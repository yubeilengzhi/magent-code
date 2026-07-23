/**
 * Session 管理
 *
 * 借鉴 Pi 的 tree-structured history
 * 借鉴 claude-squad 的多 instance 管理
 */

import { listSessions as engramListSessions } from '../memory/engram.js';

export async function listSessions(): Promise<void> {
  console.log('Sessions:');
  // TODO: 实现 session 列表
  // MVP 阶段先从 engram 查询
  const sessions = await engramListSessions().catch(() => []);
  console.log(JSON.stringify(sessions, null, 2));
  console.log('\n(Note: full session management is v0.2 feature)');
}

export async function showSession(id: string): Promise<void> {
  console.log(`Session ${id}:`);
  // TODO: 实现
  console.log('(Not implemented in v0.1)');
}

export async function shareSession(id: string): Promise<void> {
  console.log(`Share URL for session ${id}:`);
  // TODO: 实现 - 借鉴 Pi 的 /share
  console.log('(Not implemented in v0.1)');
}
