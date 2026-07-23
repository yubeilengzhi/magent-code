/**
 * magent 内置记忆层
 *
 * 设计借鉴：engram (SQLite + FTS5) — 但完全自己实现
 * 不调用任何外部项目
 *
 * 存储位置：~/.magent/memory.db
 */

import initSqlJs, { Database } from 'sql.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const MEMORY_DIR = path.join(os.homedir(), '.magent', 'memory');
const DB_PATH = path.join(MEMORY_DIR, 'memory.db');

export interface MemoryRecord {
  id: number;
  content: string;
  category: string;          // preference | project | decision | routing | session
  scope: string;             // user | project | workspace
  metadata: string | null;   // JSON
  createdAt: string;
}

export interface SearchResult extends MemoryRecord {
  rank: number;
}

export class MemoryStore {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || DB_PATH;
  }

  async init(): Promise<void> {
    if (this.db) return;

    const SQL = await initSqlJs();
    
    // 确保目录存在
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    
    // 尝试加载现有数据库
    try {
      const buffer = await fs.readFile(this.dbPath);
      this.db = new SQL.Database(buffer);
    } catch {
      // 创建新数据库
      this.db = new SQL.Database();
      await this.createTables();
      await this.save();
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        scope TEXT NOT NULL DEFAULT 'user',
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_memories_scope ON memories(scope)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at)
    `);

    // FTS5 全文搜索虚拟表
    this.db.run(`
      CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
        content,
        category,
        content='memories',
        content_rowid='id',
        tokenize='unicode61'
      )
    `);

    // 触发器：维护 FTS 索引
    this.db.run(`
      CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
        INSERT INTO memories_fts(rowid, content, category)
        VALUES (new.id, new.content, new.category);
      END
    `);

    this.db.run(`
      CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, category)
        VALUES('delete', old.id, old.content, old.category);
      END
    `);

    this.db.run(`
      CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, category)
        VALUES('delete', old.id, old.content, old.category);
        INSERT INTO memories_fts(rowid, content, category)
        VALUES (new.id, new.content, new.category);
      END
    `);
  }

  private async save(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    await fs.writeFile(this.dbPath, buffer);
  }

  /**
   * 保存记忆
   */
  async saveMemory(input: {
    content: string;
    category?: string;
    scope?: string;
    metadata?: any;
  }): Promise<MemoryRecord> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    this.db.run(
      'INSERT INTO memories (content, category, scope, metadata) VALUES (?, ?, ?, ?)',
      [
        input.content,
        input.category || 'general',
        input.scope || 'user',
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );

    await this.save();

    // 获取最后插入的 ID
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    const record = await this.get(id);
    if (!record) {
      throw new Error('Failed to retrieve inserted memory record');
    }
    return record;
  }

  /**
   * 按 ID 获取
   */
  async get(id: number): Promise<MemoryRecord | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT id, content, category, scope, metadata, created_at as createdAt FROM memories WHERE id = ?',
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    return {
      id: row[0] as number,
      content: row[1] as string,
      category: row[2] as string,
      scope: row[3] as string,
      metadata: row[4] as string | null,
      createdAt: row[5] as string,
    };
  }

  /**
   * 全文搜索（FTS5）
   */
  async search(query: string, options?: {
    topK?: number;
    categories?: string[];
    scopes?: string[];
  }): Promise<SearchResult[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const topK = options?.topK || 10;
    const categories = options?.categories;
    const scopes = options?.scopes;

    // 转义 FTS5 特殊字符
    const escapedQuery = query.replace(/['"]/g, '').trim();
    if (!escapedQuery) return [];

    // FTS5 查询（用 prefix 匹配）
    const ftsQuery = escapedQuery.split(/\s+/)
      .filter(Boolean)
      .map(w => `"${w}"*`)
      .join(' ');

    let sql = `
      SELECT
        m.id, m.content, m.category, m.scope, m.metadata, m.created_at as createdAt,
        fts.rank as rank
      FROM memories_fts fts
      JOIN memories m ON m.id = fts.rowid
      WHERE memories_fts MATCH ?
    `;
    const params: any[] = [ftsQuery];

    if (categories && categories.length > 0) {
      sql += ` AND m.category IN (${categories.map(() => '?').join(',')})`;
      params.push(...categories);
    }

    if (scopes && scopes.length > 0) {
      sql += ` AND m.scope IN (${scopes.map(() => '?').join(',')})`;
      params.push(...scopes);
    }

    sql += ` ORDER BY fts.rank LIMIT ?`;
    params.push(topK);

    const result = this.db.exec(sql, params);
    if (result.length === 0) return [];

    return result[0].values.map((row: any[]) => ({
      id: row[0] as number,
      content: row[1] as string,
      category: row[2] as string,
      scope: row[3] as string,
      metadata: row[4] as string | null,
      createdAt: row[5] as string,
      rank: row[6] as number,
    }));
  }

  /**
   * 列出所有
   */
  async listAll(options?: {
    category?: string;
    scope?: string;
    limit?: number;
  }): Promise<MemoryRecord[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    let sql = `SELECT id, content, category, scope, metadata, created_at as createdAt FROM memories`;
    const params: any[] = [];
    const where: string[] = [];

    if (options?.category) {
      where.push('category = ?');
      params.push(options.category);
    }
    if (options?.scope) {
      where.push('scope = ?');
      params.push(options.scope);
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(options?.limit || 100);

    const result = this.db.exec(sql, params);
    if (result.length === 0) return [];

    return result[0].values.map((row: any[]) => ({
      id: row[0] as number,
      content: row[1] as string,
      category: row[2] as string,
      scope: row[3] as string,
      metadata: row[4] as string | null,
      createdAt: row[5] as string,
    }));
  }

  /**
   * 删除
   */
  async delete(id: number): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM memories WHERE id = ?', [id]);
    await this.save();
    return true;
  }

  /**
   * 统计
   */
  async count(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT COUNT(*) as n FROM memories');
    return result[0].values[0][0] as number;
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.save();
      this.db.close();
      this.db = null;
    }
  }
}

// 单例
let _store: MemoryStore | null = null;

export async function getMemoryStore(): Promise<MemoryStore> {
  if (!_store) {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
    _store = new MemoryStore();
    await _store.init();
  }
  return _store;
}

/**
 * 简化的 API（保持与之前 engram.ts 类似）
 */
export async function searchMemory(query: string, topK: number = 10): Promise<Array<{ content: string; category?: string }>> {
  const store = await getMemoryStore();
  const results = await store.search(query, { topK });
  return results.map(r => ({
    content: r.content,
    category: r.category,
  }));
}

export async function addMemory(content: string, category: string = 'general'): Promise<void> {
  const store = await getMemoryStore();
  await store.saveMemory({ content, category });
}

export async function listMemory(): Promise<MemoryRecord[]> {
  const store = await getMemoryStore();
  return store.listAll();
}
