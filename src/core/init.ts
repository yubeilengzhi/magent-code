/**
 * 项目初始化
 *
 * 检测环境（engram、superpowers-zh 是否安装）
 * 创建 ~/.magent/ 目录
 * 写默认配置
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const MAGENT_DIR = path.join(os.homedir(), '.magent');

export async function initProject(): Promise<void> {
  console.log('[magent] Initializing...\n');

  // 1. 创建目录
  await fs.mkdir(MAGENT_DIR, { recursive: true });
  await fs.mkdir(path.join(MAGENT_DIR, 'memory'), { recursive: true });
  console.log(`✅ Created ${MAGENT_DIR}`);

  // 2. 检查 engram
  const hasEngram = await checkBinary('engram');
  console.log(`${hasEngram ? '✅' : '❌'} engram: ${hasEngram ? 'installed' : 'not found (install: brew install gentleman-programming/tap/engram)'}`);

  // 3. 检查 superpowers-zh
  const hasSuperpowersZh = await checkNpmPackage('superpowers-zh');
  console.log(`${hasSuperpowersZh ? '✅' : '❌'} superpowers-zh: ${hasSuperpowersZh ? 'installed' : 'not found (install: npm install -g superpowers-zh)'}`);

  // 4. 检查 codex
  const hasCodex = await checkBinary('codex');
  console.log(`${hasCodex ? '✅' : '❌'} codex: ${hasCodex ? 'installed' : 'not found'}`);

  // 5. 检查 claude
  const hasClaude = await checkBinary('claude');
  console.log(`${hasClaude ? '✅' : '❌'} claude (Claude Code): ${hasClaude ? 'installed' : 'not found'}`);

  // 6. 写默认配置
  const configPath = path.join(MAGENT_DIR, 'config.yaml');
  try {
    await fs.access(configPath);
    console.log(`\n✅ Config already exists at ${configPath}`);
  } catch {
    const defaultConfig = `# magent config
version: 1
user:
  id: ${os.userInfo().username}

providers:
  codex:
    enabled: true
    defaultModel: qwen3.7-plus
    baseUrl: \${LLM_BASE_URL}
  claude-code:
    enabled: true
    defaultModel: sonnet

memory:
  backend: ${hasEngram ? 'engram' : 'local'}

router:
  model: haiku
  baseUrl: \${LLM_BASE_URL}
  apiKey: \${LLM_API_KEY}
`;
    await fs.writeFile(configPath, defaultConfig);
    console.log(`\n✅ Created default config at ${configPath}`);
  }

  console.log('\n🎉 magent initialized! Try:');
  console.log('   magent run "hello world"');
}

function checkBinary(name: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('which', [name], { stdio: 'ignore' });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}

function checkNpmPackage(name: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['list', '-g', name, '--depth=0'], { stdio: 'ignore' });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}
