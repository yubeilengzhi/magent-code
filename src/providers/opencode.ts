/**
 * OpenCode Provider - 适配 OpenCode CLI
 *
 * OpenCode 是一个开源的 AI 编程助手，支持多种模型提供商
 * 参考：https://github.com/opencode-ai/opencode
 */

import { spawn } from 'child_process';

export interface OpenCodeOptions {
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenCodeProvider {
  async runTask(task: string, options: OpenCodeOptions = {}): Promise<string> {
    const args = ['run', '--prompt', task];
    
    if (options.model) {
      args.push('--model', options.model);
    }
    
    if (options.provider) {
      args.push('--provider', options.provider);
    }
    
    if (options.temperature !== undefined) {
      args.push('--temperature', options.temperature.toString());
    }
    
    if (options.maxTokens !== undefined) {
      args.push('--max-tokens', options.maxTokens.toString());
    }

    return new Promise((resolve, reject) => {
      const proc = spawn('opencode', args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`OpenCode exited with code ${code}: ${stderr}`));
        }
      });
      
      proc.on('error', (err) => {
        reject(new Error(`Failed to start OpenCode: ${err.message}`));
      });
    });
  }
}
