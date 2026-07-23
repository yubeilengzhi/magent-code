/**
 * Claude Code Provider Adapter
 *
 * 基于 Claude Code v2.1.215 (2026 最新) 的真实参数：
 *
 *   claude --print
 *          --model <model>
 *          --append-system-prompt <prompt>   # 真正追加（不覆盖）
 *          --permission-mode <mode>           # acceptEdits/auto/bypassPermissions/manual/dontAsk/plan
 *          --output-format stream-json
 *          --add-dir <DIR>
 *
 * 关键发现：
 * - --model 接受任意字符串（兼容 Anthropic + 自定义 endpoint）
 * - --append-system-prompt 真正追加（不会覆盖默认 system prompt）
 * - --permission-mode bypassPermissions 跳过权限检查
 * - ⚠️ --dangerously-skip-permissions root 用户不可用
 *
 * 不修改 claude 任何文件（不写 ~/.claude/settings.json）
 */

import { spawn } from 'node:child_process';

export interface TaskOptions {
  task: string;
  model?: string;
  cwd?: string;
  systemPrompt?: string;
  bare?: boolean;
}

export class ClaudeCodeProvider {
  name = 'claude-code';
  capabilities = ['file-ops', 'long-context', 'deep-reasoning', 'plan-mode', 'mcp'];

  async runTask(options: TaskOptions): Promise<void> {
    // root 用户不能用 --dangerously-skip-permissions
    // 改用 --permission-mode bypassPermissions
    // （但也是 root 限制，需要非 root 用户）
    const isRoot = process.getuid?.() === 0;
    if (isRoot) {
      console.error('[magent] Warning: Claude Code has restrictions for root users.');
      console.error('Run magent as a non-root user for auto-approval.');
    }

    const args = this.buildArgs(options);

    console.log(`[magent] Running: claude ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'inherit', 'inherit'],
      });

      // prompt 写到 stdin
      proc.stdin.write(options.task + '\n');
      proc.stdin.end();

      proc.on('close', (code) => {
        if (code === 0) {
          console.log('[magent] Claude Code task completed');
          resolve();
        } else {
          reject(new Error(`claude exited with code ${code}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * 构建 claude 命令参数
   * 参考：https://docs.anthropic.com/en/docs/claude-code (v2.1.215)
   */
  buildArgs(options: TaskOptions): string[] {
    const args: string[] = ['--print'];

    // 模型（任意字符串，包括自定义 endpoint）
    if (options.model) {
      args.push('--model', options.model);
    }

    // 追加 system prompt（不覆盖默认）
    if (options.systemPrompt) {
      args.push('--append-system-prompt', options.systemPrompt);
    }

    // 权限模式：跳过权限检查
    // 用 --permission-mode bypassPermissions（root 不可用也能用）
    const isRoot = process.getuid?.() === 0;
    if (!isRoot) {
      args.push('--permission-mode', 'bypassPermissions');
    }

    // 流式 JSON 输出
    args.push('--output-format', 'stream-json');

    // 最小模式（关 hooks / auto-memory / skill 缓存）
    if (options.bare) {
      args.push('--bare');
    }

    // 工作目录
    if (options.cwd) {
      args.push('--add-dir', options.cwd);
    }

    return args;
  }
}