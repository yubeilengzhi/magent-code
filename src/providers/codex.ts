/**
 * Codex Provider Adapter
 *
 * 用 @openai/codex-sdk 直接调用
 *
 * 参考：cloudcli 的 dist-server/server/openai-codex.js
 */

import { spawn, ChildProcess } from 'node:child_process';
import type { ProviderConfig } from '../core/config.js';

export interface TaskOptions {
  task: string;
  model?: string;
  cwd?: string;
  systemPrompt?: string;
}

export class CodexProvider {
  name = 'codex';
  private config: ProviderConfig;
  private process?: ChildProcess;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async runTask(options: TaskOptions): Promise<string> {
    if (!this.config.enabled) {
      throw new Error('Codex provider not enabled');
    }

    const args = [
      'exec',
      '--experimental-json',
      '--model', options.model || this.config.defaultModel || 'qwen3.7-plus',
      '--sandbox', 'workspace-write',
    ];

    if (options.cwd) {
      args.push('--cd', options.cwd);
    }

    if (options.systemPrompt) {
      args.push('--append-system-prompt', options.systemPrompt);
    }

    console.log(`[magent] Running: codex ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      this.process = spawn('codex', args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'inherit', 'inherit'],
      });

      this.process.stdin?.write(options.task);
      this.process.stdin?.end();

      this.process.on('close', (code) => {
        if (code === 0) {
          console.log('[magent] Codex task completed');
          resolve('completed');
        } else {
          reject(new Error(`Codex exited with code ${code}`));
        }
      });

      this.process.on('error', (err) => {
        reject(err);
      });
    });
  }

  async abort(): Promise<void> {
    if (this.process) {
      this.process.kill();
    }
  }
}
