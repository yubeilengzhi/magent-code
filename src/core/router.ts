/**
 * 智能路由器 - magent 的核心差异化
 *
 * 设计原则：
 * - 不硬编码规则（基于 LLM 决策）
 * - 从历史中学习（哪个 provider 在哪种任务上表现好）
 * - 可解释（给出决策理由）
 */

import OpenAI from 'openai';
import type { MagentConfig, ProviderConfig } from './config.js';
import { searchMemory } from '../memory/engram.js';
import { CodexProvider } from '../providers/codex.js';
import { ClaudeCodeProvider } from '../providers/claude-code.js';

export interface RouteDecision {
  provider: string;
  model: string;
  reason: string;
  confidence: number;
  fallback?: string;
}

export interface TaskContext {
  cwd?: string;
  files?: string[];
  estimatedSize?: number;
  timeConstraint?: 'fast' | 'normal' | 'thorough';
}

export class Router {
  private config: MagentConfig;
  private llm: OpenAI;

  constructor(config: MagentConfig) {
    this.config = config;
    this.llm = new OpenAI({
      baseURL: config.router.baseUrl,
      apiKey: config.router.apiKey,
    });
  }

  /**
   * 智能路由决策
   * 输入：用户任务 + 上下文
   * 输出：选择哪个 provider 和 model
   */
  async route(task: string, context: TaskContext = {}): Promise<RouteDecision> {
    // 1. 获取可用 providers
    const providers = Object.entries(this.config.providers)
      .filter(([_, p]) => p.enabled)
      .map(([name, p]) => ({ name, ...p }));

    if (providers.length === 0) {
      throw new Error('No providers enabled. Run `magent provider add <name>` first.');
    }

    if (providers.length === 1) {
      return {
        provider: providers[0].name,
        model: providers[0].defaultModel || 'auto',
        reason: 'Only one provider configured',
        confidence: 1.0,
      };
    }

    // 2. 获取相关记忆
    const memories = await searchMemory(task, 5);
    const memoryContext = memories
      .map(m => `[${m.category || 'general'}] ${m.content}`)
      .join('\n');

    // 3. LLM 决策
    const prompt = this.buildRouterPrompt(task, context, providers, memoryContext);

    try {
      const response = await this.llm.chat.completions.create({
        model: this.config.router.model,
        messages: [
          {
            role: 'system',
            content: '你是 AI 工具路由器。基于任务、上下文、用户偏好，选择最合适的 provider 和 model。',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content) as RouteDecision;
    } catch (e) {
      // 失败 fallback：选第一个 provider
      return {
        provider: providers[0].name,
        model: providers[0].defaultModel || 'auto',
        reason: `Routing failed: ${e}, using default`,
        confidence: 0,
      };
    }
  }

  private buildRouterPrompt(
    task: string,
    context: TaskContext,
    providers: Array<{ name: string } & ProviderConfig>,
    memoryContext: string,
  ): string {
    return `## 可用 Providers
${providers.map(p => `
- ${p.name}:
  - 默认模型: ${p.defaultModel || 'auto'}
`).join('\n')}

## 用户偏好
${memoryContext || 'None'}

## 当前任务
${task}

## 上下文
${context.files ? `文件: ${context.files.join(', ')}` : ''}
${context.estimatedSize ? `估算大小: ${context.estimatedSize} tokens` : ''}
${context.timeConstraint ? `时间约束: ${context.timeConstraint}` : ''}

## 输出（仅 JSON）
{
  "provider": "name",
  "model": "model-name",
  "reason": "explanation",
  "confidence": 0.0-1.0,
  "fallback": "backup-provider"
}`;
  }
}

/**
 * 运行任务（自动路由）
 */
export async function runTask(
  task: string,
  config: MagentConfig,
  options: any,
): Promise<void> {
  const router = new Router(config);
  const decision = await router.route(task, {
    cwd: options.cwd,
    files: options.files,
  });

  console.log(`[magent] Router chose: ${decision.provider} / ${decision.model}`);
  console.log(`[magent] Reason: ${decision.reason}`);
  console.log(`[magent] Confidence: ${(decision.confidence * 100).toFixed(0)}%`);

  // 路由历史记录
  await recordRoutingHistory(task, decision);

  // 启动 provider
  await runTaskWithProvider(task, decision.provider, decision.model, config, options);
}

/**
 * 用指定 provider 运行任务
 */
export async function runTaskWithProvider(
  task: string,
  providerName: string,
  model: string | undefined,
  config: MagentConfig,
  options: any,
): Promise<void> {
  // 注入记忆到 system prompt
  const memories = options.memory !== false ? await searchMemory(task, 5) : [];
  const memoryContext = memories
    .map(m => `[${m.category || 'general'}] ${m.content}`)
    .join('\n');

  const systemPrompt = memoryContext
    ? `你是一个 AI 编码助手。用户的相关记忆：\n${memoryContext}\n\n`
    : '';

  // 选择 provider
  const provider = createProvider(providerName, config);

  // 启动 session
  await provider.runTask({
    task,
    model,
    cwd: options.cwd,
    systemPrompt,
  });

  // 保存记忆
  if (options.memory !== false) {
    // TODO: 让 provider 返回 session 摘要
    // 临时：保存一个简单的引用
    console.log('[magent] Task completed. Use `magent memory add` to save insights.');
  }
}

function createProvider(name: string, config: MagentConfig) {
  switch (name) {
    case 'codex':
      return new CodexProvider(config.providers.codex);
    case 'claude-code':
      return new ClaudeCodeProvider(config.providers['claude-code']);
    default:
      throw new Error(`Unknown provider: ${name}. Supported: codex, claude-code`);
  }
}

async function recordRoutingHistory(task: string, decision: RouteDecision): Promise<void> {
  // TODO: 写到 ~/.magent/routing/history.jsonl
  // 用 engram 保存（更智能）
  // MVP 阶段先不做
}
