/**
 * 智能路由器 - 基于 ModelPool 的 compatibility 决策
 *
 * 设计原则：
 * - 不硬编码规则
 * - 用 ModelPool 的 compatibility 决定可用 provider
 * - 自动降级到下一个可用 provider
 * - 不修改任何工具的配置（只 spawn + 传 --model）
 * - 集成 magent 内置 SQLite 记忆层（不依赖 engram）
 * - 集成 magent 内置 SKILL.md skills（不依赖 superpowers）
 */

import { spawn } from 'node:child_process';
import OpenAI from 'openai';
import { ModelPool } from './model-pool.js';
import { searchMemory } from '../memory/store.js';
import { loadAllSkills, matchSkill, formatSkillForPrompt } from '../skills/parser.js';

export interface TaskContext {
  cwd?: string;
  files?: string[];
  estimatedSize?: number;
  timeConstraint?: 'fast' | 'normal' | 'thorough';
}

export interface RunOptions {
  cwd?: string;
  memory?: boolean;
  skills?: boolean;
  noRouting?: boolean;
}

export class Router {
  private pool: ModelPool;
  private llm: OpenAI | null = null;

  constructor(pool: ModelPool, llmConfig?: { baseUrl: string; apiKey: string; model: string }) {
    this.pool = pool;
    if (llmConfig && llmConfig.apiKey) {
      this.llm = new OpenAI({
        baseURL: llmConfig.baseUrl,
        apiKey: llmConfig.apiKey,
      });
    }
  }

  async selectProvider(modelName: string, task: string, context: TaskContext = {}): Promise<{
    provider: string;
    model_name: string;
    cli: string;
    reason: string;
  }> {
    const candidates = this.pool.findProviders(modelName);

    if (candidates.length === 0) {
      throw new Error(
        'No available provider for model: ' + modelName + '. ' +
        'Check pool.yml compatibility or enable a provider.'
      );
    }

    if (candidates.length === 1) {
      return {
        ...candidates[0],
        reason: 'Only one provider available',
      };
    }

    if (this.llm) {
      try {
        const decision = await this.llmDecision(task, context, candidates);
        return decision;
      } catch (e) {
        return {
          ...candidates[0],
          reason: 'LLM routing failed: ' + e,
        };
      }
    }

    return {
      ...candidates[0],
      reason: 'Default: first available',
    };
  }

  private async llmDecision(
    task: string,
    context: TaskContext,
    candidates: Array<{ provider: string; model_name: string; cli: string }>,
  ): Promise<{ provider: string; model_name: string; cli: string; reason: string }> {
    if (!this.llm) throw new Error('LLM not configured');

    const prompt = 'You are an AI tool router. Pick the best provider.\n\n' +
      'Task: ' + task + '\n\n' +
      'Available providers:\n' +
      candidates.map((c, i) =>
        (i + 1) + '. ' + c.provider + ' (CLI: ' + c.cli + ', model: ' + c.model_name + ')'
      ).join('\n') +
      '\n\nReturn JSON: {"provider": "name", "reason": "explanation"}';

    const response = await this.llm.chat.completions.create({
      model: this.pool.getRouterModel() || 'haiku',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    const decision = JSON.parse(content);

    const candidate = candidates.find(c => c.provider === decision.provider);
    if (!candidate) {
      throw new Error('LLM chose invalid provider: ' + decision.provider);
    }

    return {
      ...candidate,
      reason: decision.reason || 'LLM decision',
    };
  }
}

/**
 * 构建 system prompt（注入记忆 + skills）
 */
async function buildSystemPrompt(task: string, options: RunOptions): Promise<string> {
  let prompt = 'You are a helpful AI coding assistant.\n\n';

  if (options.memory !== false) {
    try {
      const memories = await searchMemory(task, 5);
      if (memories.length > 0) {
        prompt += '## User Preferences & Project Context\n';
        for (const m of memories) {
          prompt += '- [' + (m.category || 'general') + '] ' + m.content + '\n';
        }
        prompt += '\n';
      }
    } catch (e) {
      // ignore
    }
  }

  if (options.skills !== false) {
    try {
      const skills = await loadAllSkills();
      const matched = matchSkill(skills, task).slice(0, 2);
      if (matched.length > 0) {
        prompt += '## Relevant Skills\n';
        for (const skill of matched) {
          prompt += formatSkillForPrompt(skill);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return prompt;
}

export async function runTask(
  task: string,
  options: RunOptions = {},
): Promise<void> {
  const pool = await ModelPool.load();

  const router = new Router(pool, getLLMConfig() || undefined);
  const decision = await router.selectProvider(pool.getDefaultModel(), task, {
    cwd: options.cwd,
  });

  console.log('[magent] Router chose: ' + decision.provider + ' / ' + decision.model_name);
  console.log('[magent] Reason: ' + decision.reason);

  const systemPrompt = await buildSystemPrompt(task, options);

  await runWithProvider(decision.cli, decision.model_name, task, systemPrompt, options);
}

export async function runTaskWithProvider(
  task: string,
  providerName: string,
  modelName: string,
  options: RunOptions = {},
): Promise<void> {
  const pool = await ModelPool.load();
  const providers = pool.listProviders();
  const provider = providers.find(p => p.name === providerName);

  if (!provider) {
    throw new Error('Unknown provider: ' + providerName);
  }

  let actualModelName = modelName;
  if (modelName) {
    const compatible = pool.findProviders(modelName);
    const match = compatible.find(c => c.provider === providerName);
    if (!match) {
      throw new Error(
        'Model "' + modelName + '" is not compatible with provider "' + providerName + '".\n' +
        'Compatible providers for ' + modelName + ': ' +
        compatible.map(c => c.provider).join(', ') + '\n' +
        'Run `magent model resolve ' + modelName + '` for details.'
      );
    }
    actualModelName = match.model_name;
  } else {
    actualModelName = pool.getDefaultModel();
  }

  console.log('[magent] Running with: ' + providerName + ' / ' + actualModelName);

  const systemPrompt = await buildSystemPrompt(task, options);
  await runWithProvider(provider.cli, actualModelName || '', task, systemPrompt, options);
}

async function runWithProvider(
  cli: string,
  model: string,
  task: string,
  systemPrompt: string,
  options: RunOptions,
): Promise<void> {
  const isRoot = process.getuid?.() === 0;
  if (cli === 'claude' && isRoot) {
    console.error('[magent] Error: claude-code cannot run as root for security reasons.');
    console.error('Run magent as a non-root user, or use codex instead.');
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const args: string[] = buildArgs(cli, model, task, systemPrompt, options);

    console.log('[magent] Command: ' + cli + ' ' + args.join(' '));

    // 把 system prompt + task 都写到 stdin（codex 不支持 --append-system-prompt）
    const fullPrompt = systemPrompt + '\n\n## Task\n' + task;

    const proc = spawn(cli, args, {
      cwd: options.cwd || process.cwd(),
      stdio: ['pipe', 'inherit', 'inherit'],
    });

    proc.stdin.write(fullPrompt + '\n');
    proc.stdin.end();

    proc.on('close', (code) => {
      if (code === 0) {
        console.log('[magent] Task completed');
        resolve();
      } else {
        reject(new Error(cli + ' exited with code ' + code));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

function buildArgs(cli: string, model: string, task: string, systemPrompt: string, options: RunOptions): string[] {
  const isRoot = process.getuid?.() === 0;

  if (cli === 'codex') {
    return [
      'exec',
      '--model', model,
      '--sandbox', 'workspace-write',
    ];
  }

  if (cli === 'claude') {
    const args: string[] = [
      '--print',
      '--output-format', 'stream-json',
      '--verbose',
      '--model', model,
    ];

    if (!isRoot) {
      args.push('--dangerously-skip-permissions');
    }

    return args;
  }

  if (cli === 'opencode') {
    return ['run', '--model', model, task];
  }

  if (cli === 'pi') {
    return ['-p', '--model', model, task];
  }

  if (cli === 'cursor') {
    return ['--model', model, task];
  }

  return ['--model', model, task];
}

function getLLMConfig(): { baseUrl: string; apiKey: string; model: string } | null {
  const baseUrl = process.env.LLM_BASE_URL || 'http://43.137.15.66:8627/v1';
  const apiKey = process.env.LLM_API_KEY || '';

  if (!apiKey) {
    return null;
  }

  return { baseUrl, apiKey, model: 'haiku' };
}