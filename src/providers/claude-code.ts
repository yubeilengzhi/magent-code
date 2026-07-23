/**
 * Claude Code Provider Adapter
 *
 * 通过 spawn 调用 claude CLI
 *
 * 参考：cloudcli 的 claude-sdk.js + cc-connect 的 claudecode adapter
 */

import { spawn, ChildProcess } from 'node:child_process';
import type { ProviderConfig } from '../core/config.js';
import type { TaskOptions } from './codex.js';

export class ClaudeCodeProvider {
  name = 'claude-code';
  private config: ProviderConfig;
  private process?: ChildProcess;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async runTask(options: TaskOptions): Promise<string> {
    if (!this.config.enabled) {
      throw new Error('Claude Code provider not enabled');
    }

    const args = [
      '--print',
      '--output-format', 'stream-json',
      '--verbose',
      '--model', options.model || this.config.defaultModel || 'sonnet',
      '--dangerously-skip-permissions',
    ];

    if (options.cwd) {
      args.push('--cwd', options.cwd);
    }

    if (options.systemPrompt) {
      args.push('--append-system-prompt', options.systemPrompt);
    }

    console.log(`[magent] Running: claude ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      this.process = spawn('claude', args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'inherit', 'inherit'],
      });

      this.process.stdin?.write(options.task);
      this.process.stdin?.end();

      this.process.on('close', (code) => {
        if (code === 0) {
          console.log('[magent] Claude Code task completed');
          resolve('completed');
        } else {
          reject(new Error(`Claude Code exited with code ${code}`));
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
