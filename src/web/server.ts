/**
 * Web UI 服务器
 * 
 * 提供简单的 Web 界面来使用 magent
 */

import express from 'express';
import cors from 'cors';
import { runTask } from '../core/router.js';
import { getSessionStore } from '../memory/session.js';
import { getMemoryStore } from '../memory/store.js';
import { getRoutingHistoryStore } from '../memory/routing-history.js';
import { ModelPool } from '../core/model-pool.js';

const app = express();
const PORT = parseInt(process.env.MAGENT_PORT || '20011');
const HOST = process.env.MAGENT_HOST || '0.0.0.0';

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件 - 优先从 dist/public 加载（生产环境），再从 public 加载（开发环境）
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPublic = path.resolve(__dirname, '..', 'public');  // dist/public
const devPublic = path.resolve(__dirname, '..', '..', 'public');  // 项目根/public

if (fs.existsSync(distPublic)) {
  app.use(express.static(distPublic));
  console.log('[magent] Serving static from: ' + distPublic);
} else if (fs.existsSync(devPublic)) {
  app.use(express.static(devPublic));
  console.log('[magent] Serving static from: ' + devPublic);
} else {
  console.warn('[magent] No static dir found');
}

// API 端点：运行任务
app.post('/api/run', async (req, res) => {
  try {
    const { task, provider, model } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }

    // 运行任务
    const result = await runTask(task, {
      provider: provider || 'codex',
      model: model || 'qwen3.7-plus',
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error running task:', error);
    res.status(500).json({ 
      error: 'Failed to run task',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// API 端点：获取会话列表
app.get('/api/sessions', async (req, res) => {
  try {
    const store = await getSessionStore();
    const sessions = await store.listAll({ limit: 50 });
    res.json(sessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// API 端点：获取记忆列表
app.get('/api/memories', async (req, res) => {
  try {
    const store = await getMemoryStore();
    const memories = await store.listAll({ limit: 50 });
    res.json(memories);
  } catch (error) {
    console.error('Error getting memories:', error);
    res.status(500).json({ error: 'Failed to get memories' });
  }
});

// API 端点：获取路由历史
app.get('/api/routing', async (req, res) => {
  try {
    const store = await getRoutingHistoryStore();
    const history = await store.listAll({ limit: 50 });
    res.json(history);
  } catch (error) {
    console.error('Error getting routing history:', error);
    res.status(500).json({ error: 'Failed to get routing history' });
  }
});

// API 端点：获取 providers
app.get('/api/providers', async (req, res) => {
  try {
    const pool = await ModelPool.load();
    const providers = pool.listProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
});

// API 端点：获取 models
app.get('/api/models', async (req, res) => {
  try {
    const pool = await ModelPool.load();
    const models = pool.listModels();
    res.json(models);
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({ error: 'Failed to get models' });
  }
});

// API 端点：添加记忆
app.post('/api/memories/add', async (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const store = await getMemoryStore();
    const record = await store.saveMemory({ content, category: category || 'general' });
    res.json({ success: true, record });
  } catch (error) {
    console.error('Error adding memory:', error);
    res.status(500).json({ error: 'Failed to add memory' });
  }
});

// API 端点：健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
export function startServer() {
  app.listen(PORT, HOST, () => {
    console.log(`[magent] Web UI server running at http://${HOST}:${PORT}`);
    console.log(`[magent] LAN access: http://<your-ip>:${PORT}`);
  });
}

// 如果直接运行此文件，启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
