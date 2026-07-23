/**
 * magent 内置记忆层
 *
 * 设计借鉴：engram (SQLite + FTS5) — 但完全自己实现
 * 不调用任何外部项目
 *
 * 存储位置：~/.magent/memory.db
 */

import Database from 'better-sqlite3';
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
  private db: Database.Database;

  constructor(dbPath?: string) {
    const path = dbPath || DB_PATH;
    this.db = new Database(path);

    // 启用 WAL 模式（性能更好）
    this.db.pragma('journal_mode = WAL');

    this.init();
  }

  /**
   * 初始化 schema（含 FTS5 全文搜索）
   */
  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        scope TEXT NOT NULL DEFAULT 'user',
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
      CREATE INDEX IF NOT EXISTS idx_memories_scope ON memories(scope);
      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);

      -- FTS5 全文搜索虚拟表
      CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
        content,
        category,
        content='memories',
        content_rowid='id',
        tokenize='unicode61'
      );

      -- 触发器：维护 FTS 索引
      CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
        INSERT INTO memories_fts(rowid, content, category)
        VALUES (new.id, new.content, new.category);
      END;

      CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, category)
        VALUES('delete', old.id, old.content, old.category);
      END;

      CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, category)
        VALUES('delete', old.id, old.content, old.category);
        INSERT INTO memories_fts(rowid, content, category)
        VALUES (new.id, new.content, new.category);
      END;
    `);
  }

  /**
   * 保存记忆
   */
  save(input: {
    content: string;
    category?: string;
    scope?: string;
    metadata?: any;
  }): MemoryRecord {
    const stmt = this.db.prepare(`
      INSERT INTO memories (content, category, scope, metadata)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.content,
      input.category || 'general',
      input.scope || 'user',
      input.metadata ? JSON.stringify(input.metadata) : null,
    );

    return this.get(Number(result.lastInsertRowid))!;
  }

  /**
   * 按 ID 获取
   */
  get(id: number): MemoryRecord | null {
    const stmt = this.db.prepare(`
      SELECT id, content, category, scope, metadata, created_at as createdAt
      FROM memories WHERE id = ?
    `);
    return (stmt.get(id) as MemoryRecord) || null;
  }

  /**
   * 全文搜索（FTS5）
   */
  search(query: string, options?: {
    topK?: number;
    categories?: string[];
    scopes?: string[];
  }): SearchResult[] {
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

    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as SearchResult[];
  }

  /**
   * 列出所有
   */
  listAll(options?: {
    category?: string;
    scope?: string;
    limit?: number;
  }): MemoryRecord[] {
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

    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as MemoryRecord[];
  }

  /**
   * 删除
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM memories WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 统计
   */
  count(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) as n FROM memories`);
    return (stmt.get() as any).n;
  }

  /**
   * 关闭数据库
   */
  close(): void {
    this.db.close();
  }
}

// 单例
let _store: MemoryStore | null = null;

export async function getMemoryStore(): Promise<MemoryStore> {
  if (!_store) {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
    _store = new MemoryStore();
  }
  return _store;
}

/**
 * 简化的 API（保持与之前 engram.ts 类似）
 */
export async function searchMemory(query: string, topK: number = 10): Promise<Array<{ content: string; category?: string }>> {
  const store = await getMemoryStore();
  return store.search(query, { topK }).map(r => ({
    content: r.content,
    category: r.category,
  }));
}

export async function addMemory(content: string, category: string = 'general'): Promise<void> {
  const store = await getMemoryStore();
  store.save({ content, category });
}

export async function listMemory(): Promise<MemoryRecord[]> {
  const store = await getMemoryStore();
  return store.listAll();
}