/**
 * magent init - 项目初始化
 *
 * magent 不依赖外部产品（engram、superpowers 等）
 * - 内置 SQLite + FTS5 记忆层
 * - 内置 SKILL.md skills 库
 * - 唯一依赖外部的：agent CLI（codex、claude 等）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { DEFAULT_POOL_YML } from './default-pool.js';
import { initBuiltinSkills } from '../skills/parser.js';

const MAGENT_DIR = path.join(os.homedir(), '.magent');

export async function initProject(): Promise<void> {
  console.log('[magent] Initializing...\n');

  // 1. 创建目录
  await fs.mkdir(MAGENT_DIR, { recursive: true });
  await fs.mkdir(path.join(MAGENT_DIR, 'memory'), { recursive: true });
  await fs.mkdir(path.join(MAGENT_DIR, 'models'), { recursive: true });
  await fs.mkdir(path.join(MAGENT_DIR, 'skills'), { recursive: true });
  console.log('Created: ' + MAGENT_DIR);

  // 2. 写 pool.yml
  const poolPath = path.join(MAGENT_DIR, 'models', 'pool.yml');
  try {
    await fs.access(poolPath);
    console.log('Model pool already exists: ' + poolPath);
  } catch {
    await fs.writeFile(poolPath, DEFAULT_POOL_YML);
    console.log('Created model pool: ' + poolPath);
  }

  // 3. 写内置 skills（3 个示例）
  await initBuiltinSkills();
  console.log('Created built-in skills (3) in ~/.magent/skills/');

  // 4. 检测 agent CLI（这些是 magent 唯一调用的外部工具）
  console.log('\nDetecting agent CLIs:');
  const agents = [
    { name: 'codex', desc: 'OpenAI Codex CLI' },
    { name: 'claude-code', cli: 'claude', desc: 'Anthropic Claude Code' },
    { name: 'opencode', desc: 'OpenCode CLI' },
    { name: 'pi', desc: 'Pi Coding Agent' },
    { name: 'cursor', desc: 'Cursor CLI' },
  ];

  for (const a of agents) {
    const cli = a.cli || a.name;
    const installed = checkBinary(cli);
    const status = installed ? '[OK]' : '[ ]';
    console.log('  ' + status + ' ' + a.name + ' (' + a.desc + ')');
  }

  console.log('\n========================================');
  console.log('magent initialized!');
  console.log('========================================');
  console.log('');
  console.log('Architecture:');
  console.log('  - Built-in SQLite + FTS5 memory at ~/.magent/memory/');
  console.log('  - Built-in SKILL.md parser + skills at ~/.magent/skills/');
  console.log('  - Smart routing via ~/.magent/models/pool.yml');
  console.log('  - Spawn agent CLIs (codex, claude, pi, ...) when found');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Configure each agent CLI token (independently):');
  console.log('     - Codex: edit ~/.codex/auth.json');
  console.log('     - Claude Code: claude login');
  console.log('');
  console.log('  2. Try:');
  console.log('     magent run "your task here"');
  console.log('     magent model list');
  console.log('     magent provider list');
  console.log('     magent memory add "I prefer TypeScript strict"');
}

function checkBinary(name: string): boolean {
  const result = spawnSync('which', [name], { stdio: 'ignore' });
  return result.status === 0;
}