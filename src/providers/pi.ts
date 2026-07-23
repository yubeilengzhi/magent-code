/**
 * Pi Provider - 适配 Pi CLI
 *
 * Pi 是一个 AI 编程助手，支持多种模型和工具
 * 参考：https://github.com/pi-apps/pi
 */

import { spawn } from 'child_process';

export interface PiOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
}

export class PiProvider {
  async runTask(task: string, options: PiOptions = {}): Promise<string> {
    const args = ['--print', '--prompt', task];
    
    if (options.model) {
      args.push('--model', options.model);
    }
    
    if (options.temperature !== undefined) {
      args.push('--temperature', options.temperature.toString());
    }
    
    if (options.maxTokens !== undefined) {
      args.push('--max-tokens', options.maxTokens.toString());
    }
    
    if (options.tools && options.tools.length > 0) {
      args.push('--tools', options.tools.join(','));
    }

    return new Promise((resolve, reject) => {
      const proc = spawn('pi', args, { stdio: 'pipe' });
      
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
          reject(new Error(`Pi exited with code ${code}: ${stderr}`));
        }
      });
      
      proc.on('error', (err) => {
        reject(new Error(`Failed to start Pi: ${err.message}`));
      });
    });
  }
}
