/**
 * Claude Code Provider Adapter
 *
 * 基于 Claude Code v2.1.215 (2026 最新) 的真实参数。
 *
 * 关键约束（v2.1.215 官方要求）：
 * - root 用户 **不能** 运行 Claude Code（安全限制）
 * - 用户的 `~/.claude/settings.json` 如有 `skipDangerousModePermissionPrompt: true`
 *   会在 root 下产生冲突 → magent **不修改** settings.json
 * - 建议：用 `su - claudeuser` 切换非 root 后再 run
 *
 * 不修改 claude 任何文件（不写 ~/.claude/settings.json）
 */

import { spawn } from 'node:child_process';

export interface TaskOptions {
  task: string;
  model?: string;
  cwd?: string;
  systemPrompt?: string;
}

export class ClaudeCodeProvider {
  name = 'claude-code';
  capabilities = ['file-ops', 'long-context', 'deep-reasoning', 'plan-mode', 'mcp'];

  async runTask(options: TaskOptions): Promise<void> {
    // root 用户不能运行 Claude Code
    // 原因：Claude Code v2.1.215 检测到 root + dangerous mode settings → 拒绝
    // magent 不修改 settings.json（遵守"不改工具配置"的约束）
    const isRoot = process.getuid?.() === 0;
    if (isRoot) {
      console.error('[magent] Claude Code requires a non-root user.');
      console.error('Please switch to a non-root user first:');
      console.error('  su - claudeuser');
      console.error('  magent run --provider claude-code --model sonnet "task"');
      console.error('');
      console.error('Or use Codex instead (Codex works with root):');
      console.error('  magent run --provider codex "task"');
      return;
    }

    const args = this.buildArgs(options);
    console.log('[magent] Running: claude ' + args.join(' '));

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'inherit', 'inherit'],
      });

      proc.stdin.write(options.task + '\n');
      proc.stdin.end();

      proc.on('close', (code) => {
        if (code === 0) {
          console.log('[magent] Claude Code task completed');
          resolve();
        } else {
          reject(new Error('claude exited with code ' + code));
        }
      });

      proc.on('error', (err) => { reject(err); });
    });
  }

  /**
   * 构建 claude 命令参数
   * 基于 `claude --help` v2.1.215 实际输出
   */
  buildArgs(options: TaskOptions): string[] {
    const args: string[] = [
      '--print',                         // 非交互模式
      '--no-session-persistence',        // 不持久化 session
    ];

    // 模型（任意字符串，支持自定义 endpoint）
    if (options.model) {
      args.push('--model', options.model);
    }

    // 追加 system prompt（真正追加，不覆盖默认）
    if (options.systemPrompt) {
      args.push('--append-system-prompt', options.systemPrompt);
    }

    // 流式 JSON 输出
    args.push('--output-format', 'stream-json');

    // 工作目录
    if (options.cwd) {
      args.push('--add-dir', options.cwd);
    }

    return args;
  }
}