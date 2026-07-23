/**
 * 智能路由学习 - 记录历史，优化路由决策
 *
 * 核心功能：
 * - 记录每次路由决策（provider、model、任务类型、执行结果）
 * - 分析历史数据，找出哪些 provider 适合哪些任务类型
 * - 在路由决策时，使用历史数据作为权重
 *
 * 这是 magent 独有的能力：其他工具没有基于历史的路由优化
 */

import initSqlJs, { Database } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.magent', 'memory', 'routing_history.db');

export interface RoutingHistory {
  id: number;
  timestamp: string;
  taskType: string;           // brainstorm, debug, review, test, etc.
  taskDescription: string;
  provider: string;
  model: string;
  success: boolean;
  duration: number;           // 执行时间（秒）
  tokensUsed: number;
  userFeedback?: string;      // 用户反馈（可选）
}

export interface RoutingStats {
  provider: string;
  taskType: string;
  totalRuns: number;
  successRate: number;        // 0-1
  avgDuration: number;        // 秒
  avgTokens: number;
  score: number;              // 综合评分（0-100）
}

export class RoutingHistoryStore {
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
      CREATE TABLE IF NOT EXISTS routing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        task_type TEXT NOT NULL,
        task_description TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        success INTEGER NOT NULL,
        duration REAL NOT NULL,
        tokens_used INTEGER NOT NULL,
        user_feedback TEXT
      )
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_routing_history_task_type 
      ON routing_history(task_type)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_routing_history_provider 
      ON routing_history(provider)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_routing_history_timestamp 
      ON routing_history(timestamp)
    `);
  }

  private async save(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    await fs.writeFile(this.dbPath, buffer);
  }

  /**
   * 记录路由历史
   */
  async record(input: {
    taskType: string;
    taskDescription: string;
    provider: string;
    model: string;
    success: boolean;
    duration: number;
    tokensUsed: number;
    userFeedback?: string;
  }): Promise<RoutingHistory> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO routing_history 
       (timestamp, task_type, task_description, provider, model, success, duration, tokens_used, user_feedback) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        now,
        input.taskType,
        input.taskDescription,
        input.provider,
        input.model,
        input.success ? 1 : 0,
        input.duration,
        input.tokensUsed,
        input.userFeedback || null,
      ]
    );

    await this.save();

    // 获取最后插入的 ID
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    return {
      id,
      timestamp: now,
      taskType: input.taskType,
      taskDescription: input.taskDescription,
      provider: input.provider,
      model: input.model,
      success: input.success,
      duration: input.duration,
      tokensUsed: input.tokensUsed,
      userFeedback: input.userFeedback,
    };
  }

  /**
   * 获取指定任务类型的历史统计
   */
  async getStats(taskType?: string, provider?: string): Promise<RoutingStats[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT 
        provider,
        task_type as taskType,
        COUNT(*) as totalRuns,
        AVG(success) as successRate,
        AVG(duration) as avgDuration,
        AVG(tokens_used) as avgTokens
      FROM routing_history
    `;
    const params: any[] = [];
    const where: string[] = [];

    if (taskType) {
      where.push('task_type = ?');
      params.push(taskType);
    }
    if (provider) {
      where.push('provider = ?');
      params.push(provider);
    }

    if (where.length > 0) {
      query += ` WHERE ${where.join(' AND ')}`;
    }

    query += ` GROUP BY provider, task_type ORDER BY totalRuns DESC`;

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    return result[0].values.map((row: any[]) => {
      const successRate = row[3] as number;
      const avgDuration = row[4] as number;
      const avgTokens = row[5] as number;

      // 综合评分：成功率 50% + 速度 30% + token 效率 20%
      const speedScore = Math.max(0, 100 - avgDuration);  // 越快越好
      const tokenScore = Math.max(0, 100 - avgTokens / 1000);  // token 越少越好
      const score = successRate * 50 + (speedScore / 100) * 30 + (tokenScore / 100) * 20;

      return {
        provider: row[0] as string,
        taskType: row[1] as string,
        totalRuns: row[2] as number,
        successRate,
        avgDuration,
        avgTokens,
        score,
      };
    });
  }

  /**
   * 获取推荐 provider（基于历史数据）
   */
  async getRecommendedProvider(taskType: string): Promise<{ provider: string; score: number } | null> {
    const stats = await this.getStats(taskType);
    if (stats.length === 0) return null;

    // 选择评分最高的
    const best = stats.reduce((prev, curr) => curr.score > prev.score ? curr : prev);
    return {
      provider: best.provider,
      score: best.score,
    };
  }

  /**
   * 列出所有历史记录
   */
  async listAll(options?: {
    taskType?: string;
    provider?: string;
    limit?: number;
  }): Promise<RoutingHistory[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT id, timestamp, task_type as taskType, task_description as taskDescription,
             provider, model, success, duration, tokens_used as tokensUsed, user_feedback as userFeedback
      FROM routing_history
    `;
    const params: any[] = [];
    const where: string[] = [];

    if (options?.taskType) {
      where.push('task_type = ?');
      params.push(options.taskType);
    }
    if (options?.provider) {
      where.push('provider = ?');
      params.push(options.provider);
    }

    if (where.length > 0) {
      query += ` WHERE ${where.join(' AND ')}`;
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(options?.limit || 50);

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    return result[0].values.map((row: any[]) => ({
      id: row[0] as number,
      timestamp: row[1] as string,
      taskType: row[2] as string,
      taskDescription: row[3] as string,
      provider: row[4] as string,
      model: row[5] as string,
      success: row[6] === 1,
      duration: row[7] as number,
      tokensUsed: row[8] as number,
      userFeedback: row[9] as string | undefined,
    }));
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
let _store: RoutingHistoryStore | null = null;

export async function getRoutingHistoryStore(): Promise<RoutingHistoryStore> {
  if (!_store) {
    _store = new RoutingHistoryStore();
    await _store.init();
  }
  return _store;
}
