/**
 * engram 集成 - 通过 MCP 协议
 *
 * engram 是个 Go 写的 MCP server，提供：
 * - memory_save, memory_search, memory_get, memory_list, memory_update, memory_delete
 * - memory_relation
 * - session_save
 *
 * 我们用 @modelcontextprotocol/sdk 作为 client
 *
 * 如果 engram 没装，fallback 到本地 JSONL
 */

import { spawn, ChildProcess } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface Memory {
  id: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

let engramClient: Client | null = null;
let engramProcess: ChildProcess | null = null;

/**
 * 启动 engram 并连接 MCP
 */
async function ensureEngram(): Promise<Client | null> {
  if (engramClient) return engramClient;

  try {
    // 启动 engram 守护进程
    engramProcess = spawn('engram', ['serve', '--mcp'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // 等待启动
    await new Promise(r => setTimeout(r, 1000));

    // 连接 MCP client
    const transport = new StdioClientTransport({
      command: 'engram',
      args: ['serve', '--mcp'],
    });

    engramClient = new Client(
      { name: 'magent', version: '0.1.0' },
      { capabilities: {} },
    );
    await engramClient.connect(transport);

    console.log('[magent] engram MCP connected');
    return engramClient;
  } catch (e) {
    console.warn(`[magent] engram not available: ${e}`);
    console.warn('[magent] Falling back to local JSONL memory');
    return null;
  }
}

/**
 * 搜索记忆
 */
export async function searchMemory(query: string, topK: number = 10): Promise<Memory[]> {
  const client = await ensureEngram();

  if (client) {
    // 用 engram
    try {
      const result = await client.callTool({
        name: 'memory_search',
        arguments: { query, top_k: topK },
      });
      return parseEngramResults(result);
    } catch (e) {
      console.warn(`[magent] engram search failed: ${e}`);
    }
  }

  // Fallback: 本地 JSONL
  return searchLocalMemory(query, topK);
}

/**
 * 添加记忆
 */
export async function addMemory(content: string, category: string = 'general'): Promise<void> {
  const client = await ensureEngram();

  if (client) {
    try {
      await client.callTool({
        name: 'memory_save',
        arguments: { content, category },
      });
      console.log(`[magent] Saved to engram: ${content}`);
      return;
    } catch (e) {
      console.warn(`[magent] engram save failed: ${e}`);
    }
  }

  // Fallback: 本地 JSONL
  saveLocalMemory(content, category);
}

/**
 * 列出所有记忆
 */
export async function listMemory(): Promise<Memory[]> {
  const client = await ensureEngram();

  if (client) {
    try {
      const result = await client.callTool({
        name: 'memory_list',
        arguments: {},
      });
      return parseEngramResults(result);
    } catch (e) {
      console.warn(`[magent] engram list failed: ${e}`);
    }
  }

  return listLocalMemory();
}

// === 解析 engram 结果 ===
function parseEngramResults(result: any): Memory[] {
  // engram 返回格式：{ content: [{ type: 'text', text: '...' }] }
  if (result?.content && Array.isArray(result.content)) {
    const text = result.content.find((c: any) => c.type === 'text')?.text;
    if (text) {
      try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : data.observations || data.memories || [];
      } catch {
        return [];
      }
    }
  }
  return [];
}

// === Fallback: 本地 JSONL ===
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const MEMORY_DIR = path.join(os.homedir(), '.magent', 'memory');

async function searchLocalMemory(query: string, topK: number): Promise<Memory[]> {
  // 简单的关键词匹配
  try {
    const files = await fs.readdir(MEMORY_DIR);
    const allMemories: Memory[] = [];

    for (const file of files) {
      if (!file.endsWith('.jsonl')) continue;
      const content = await fs.readFile(path.join(MEMORY_DIR, file), 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const m = JSON.parse(line);
          if (m.content.toLowerCase().includes(query.toLowerCase())) {
            allMemories.push(m);
          }
        } catch {}
      }
    }

    return allMemories.slice(0, topK);
  } catch {
    return [];
  }
}

async function saveLocalMemory(content: string, category: string): Promise<void> {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  const memory: Memory = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    category,
    createdAt: new Date().toISOString(),
  };
  const file = path.join(MEMORY_DIR, `${category}s.jsonl`);
  await fs.appendFile(file, JSON.stringify(memory) + '\n');
  console.log(`[magent] Saved to local: ${content}`);
}

async function listLocalMemory(): Promise<Memory[]> {
  try {
    const files = await fs.readdir(MEMORY_DIR);
    const allMemories: Memory[] = [];
    for (const file of files) {
      if (!file.endsWith('.jsonl')) continue;
      const content = await fs.readFile(path.join(MEMORY_DIR, file), 'utf-8');
      for (const line of content.split('\n').filter(Boolean)) {
        try {
          allMemories.push(JSON.parse(line));
        } catch {}
      }
    }
    return allMemories;
  } catch {
    return [];
  }
}

/**
 * 关闭 engram（清理）
 */
export async function closeEngram(): Promise<void> {
  if (engramClient) {
    try {
      await engramClient.close();
    } catch {}
    engramClient = null;
  }
  if (engramProcess) {
    engramProcess.kill();
    engramProcess = null;
  }
}
