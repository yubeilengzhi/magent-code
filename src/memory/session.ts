import initSqlJs, { Database } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.magent', 'memory', 'session.db');

export interface Session {
  id: string;
  provider: string;
  model: string;
  task: string;
  output: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
}

export class SessionStore {
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
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        task TEXT NOT NULL,
        output TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        parent_id TEXT
      )
    `);
  }

  private async save(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    await fs.writeFile(this.dbPath, buffer);
  }

  async create(input: {
    provider: string;
    model: string;
    task: string;
    parentId?: string;
  }): Promise<Session> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      'INSERT INTO sessions (id, provider, model, task, output, created_at, updated_at, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, input.provider, input.model, input.task, '', now, now, input.parentId || null]
    );

    await this.save();

    return {
      id,
      provider: input.provider,
      model: input.model,
      task: input.task,
      output: '',
      createdAt: now,
      updatedAt: now,
      parentId: input.parentId,
    };
  }

  async get(id: string): Promise<Session | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM sessions WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    return {
      id: row[0] as string,
      provider: row[1] as string,
      model: row[2] as string,
      task: row[3] as string,
      output: row[4] as string,
      createdAt: row[5] as string,
      updatedAt: row[6] as string,
      parentId: row[7] as string | undefined,
    };
  }

  async update(id: string, output: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    this.db.run('UPDATE sessions SET output = ?, updated_at = ? WHERE id = ?', [output, now, id]);
    await this.save();
  }

  async listAll(options?: { provider?: string; limit?: number }): Promise<Session[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM sessions';
    const params: any[] = [];

    if (options?.provider) {
      query += ' WHERE provider = ?';
      params.push(options.provider);
    }

    query += ' ORDER BY created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    return result[0].values.map((row: any[]) => ({
      id: row[0] as string,
      provider: row[1] as string,
      model: row[2] as string,
      task: row[3] as string,
      output: row[4] as string,
      createdAt: row[5] as string,
      updatedAt: row[6] as string,
      parentId: row[7] as string | undefined,
    }));
  }

  async delete(id: string): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM sessions WHERE id = ?', [id]);
    await this.save();
    return true;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.save();
      this.db.close();
      this.db = null;
    }
  }
}

export async function getSessionStore(): Promise<SessionStore> {
  const store = new SessionStore();
  await store.init();
  return store;
}
