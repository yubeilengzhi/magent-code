/**
 * Codex Provider Adapter
 *
 * 基于 Codex CLI v0.145.0 (2026 最新) 的真实参数：
 *
 *   codex exec --model <MODEL> --sandbox <MODE> --json
 *          --dangerously-bypass-approvals-and-sandbox
 *          --cd <DIR> --add-dir <DIR> --output-last-message <FILE>
 *
 * 关键发现：
 * - --model 接受任意字符串（OpenAI 兼容）
 * - 没有 --append-system-prompt 参数 → 通过 stdin 传
 * - 默认 sandbox=workspace-write（对 CLI 友好）
 * - --dangerously-bypass-approvals-and-sandbox 跳过所有审批
 *
 * 不修改 codex 任何文件（不写 ~/.codex/config.toml）
 */

import { spawn } from 'node:child_process';

export interface TaskOptions {
  task: string;
  model?: string;
  cwd?: string;
  systemPrompt?: string;
  jsonOutput?: boolean;
  ephemeral?: boolean;
}

export class CodexProvider {
  name = 'codex';
  capabilities = ['file-ops', 'long-context', 'reasoning', 'fast', 'mcp'];

  async runTask(options: TaskOptions): Promise<void> {
    const args = this.buildArgs(options);

    console.log(`[magent] Running: codex ${args.join(' ')}`);

    // 把 prompt 写到 stdin（codex exec 没有 --append-system-prompt）
    // 包含 task + system prompt
    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n## Task\n${options.task}`
      : options.task;

    return new Promise((resolve, reject) => {
      const proc = spawn('codex', args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'inherit', 'inherit'],
      });

      proc.stdin.write(fullPrompt + '\n');
      proc.stdin.end();

      proc.on('close', (code) => {
        if (code === 0) {
          console.log('[magent] Codex task completed');
          resolve();
        } else {
          reject(new Error(`codex exited with code ${code}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * 构建 codex 命令参数
   * 参考：https://github.com/openai/codex (v0.145.0)
   */
  buildArgs(options: TaskOptions): string[] {
    const args: string[] = ['exec'];

    // 模型（任意 OpenAI 兼容）
    if (options.model) {
      args.push('--model', options.model);
    }

    // Sandbox 模式
    args.push('--sandbox', 'workspace-write');

    // 跳过所有审批 + sandbox（auto mode）
    args.push('--dangerously-bypass-approvals-and-sandbox');

    // JSON 输出（可选）
    if (options.jsonOutput) {
      args.push('--json');
    }

    // 不持久化 session
    if (options.ephemeral) {
      args.push('--ephemeral');
    }

    // 工作目录
    if (options.cwd) {
      args.push('--cd', options.cwd);
    }

    return args;
  }
}