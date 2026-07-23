/**
 * 配置管理
 *
 * 用户配置：~/.magent/config.yaml
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import yaml from 'yaml';

export interface ProviderConfig {
  enabled: boolean;
  defaultModel: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface MagentConfig {
  version: number;
  user: { id: string; name?: string };
  providers: Record<string, ProviderConfig>;
  memory: { backend: 'engram' | 'local' };
  router: {
    model: string;
    baseUrl: string;
    apiKey: string;
  };
}

const DEFAULT_CONFIG: MagentConfig = {
  version: 1,
  user: { id: os.userInfo().username },
  providers: {
    codex: {
      enabled: true,
      defaultModel: 'qwen3.7-plus',
      baseUrl: 'http://43.137.15.66:8627/v1',
    },
    'claude-code': {
      enabled: true,
      defaultModel: 'sonnet',
    },
  },
  memory: { backend: 'engram' },
  router: {
    model: 'haiku',
    baseUrl: process.env.LLM_BASE_URL || 'http://43.137.15.66:8627/v1',
    apiKey: process.env.LLM_API_KEY || '',
  },
};

const CONFIG_PATH = path.join(os.homedir(), '.magent', 'config.yaml');

export async function loadConfig(): Promise<MagentConfig> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = yaml.parse(content) as MagentConfig;
    return { ...DEFAULT_CONFIG, ...config };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function showConfig(): Promise<void> {
  const config = await loadConfig();
  console.log(yaml.stringify(config));
}

export async function editConfig(): Promise<void> {
  const { spawn } = await import('node:child_process');
  const editor = process.env.EDITOR || 'nano';
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  const child = spawn(editor, [CONFIG_PATH], { stdio: 'inherit' });
  return new Promise((resolve) => {
    child.on('close', () => resolve());
  });
}
