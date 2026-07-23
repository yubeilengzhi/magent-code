#!/usr/bin/env node
/**
 * magent CLI 入口
 *
 * 设计参考：
 * - Commander.js (CLI 解析)
 * - cloudcli 的 CLI 设计
 * - claude-squad 的多 instance 管理
 */

import { Command } from 'commander';
import { runTask, runTaskWithProvider } from '../core/router.js';
import { listSessions, showSession, shareSession } from '../core/session.js';
import { searchMemory, listMemory, addMemory } from '../memory/engram.js';
import { loadConfig, showConfig, editConfig } from '../core/config.js';

const program = new Command();

program
  .name('magent')
  .description('Cross-tool AI coding assistant with smart routing')
  .version('0.1.0');

// === 主命令：运行任务 ===
program
  .command('run')
  .description('Run a task with intelligent routing')
  .argument('<task...>', 'Task description')
  .option('-p, --provider <name>', 'Force a specific provider (codex, claude-code)')
  .option('-m, --model <name>', 'Force a specific model')
  .option('-c, --cwd <path>', 'Working directory')
  .option('--no-memory', 'Disable memory injection')
  .option('--no-routing', 'Skip smart routing, use default provider')
  .action(async (taskArgs: string[], options) => {
    const task = taskArgs.join(' ');
    const config = await loadConfig();

    if (options.provider) {
      await runTaskWithProvider(task, options.provider, options.model, config, options);
    } else {
      await runTask(task, config, options);
    }
  });

// === Session 管理 ===
const sessionCmd = program.command('session').description('Manage sessions');

sessionCmd
  .command('list')
  .description('List all sessions')
  .action(async () => {
    await listSessions();
  });

sessionCmd
  .command('show <id>')
  .description('Show session details')
  .action(async (id: string) => {
    await showSession(id);
  });

sessionCmd
  .command('share <id>')
  .description('Generate shareable session URL')
  .action(async (id: string) => {
    await shareSession(id);
  });

// === 记忆管理（通过 engram）===
const memoryCmd = program.command('memory').description('Manage persistent memory (via engram)');

memoryCmd
  .command('search <query>')
  .description('Search memories')
  .option('--top-k <n>', 'Top K results', '10')
  .action(async (query: string, options) => {
    await searchMemory(query, parseInt(options.topK));
  });

memoryCmd
  .command('list')
  .description('List all memories')
  .action(async () => {
    await listMemory();
  });

memoryCmd
  .command('add <content>')
  .description('Add a memory')
  .option('--category <cat>', 'Category (preference, project, decision)', 'general')
  .action(async (content: string, options) => {
    await addMemory(content, options.category);
  });

// === 配置管理 ===
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(async () => {
    await showConfig();
  });

configCmd
  .command('edit')
  .description('Edit configuration')
  .action(async () => {
    await editConfig();
  });

// === Provider 管理 ===
program
  .command('provider')
  .description('Manage providers')
  .command('list', 'List configured providers')
  .action(async () => {
    const config = await loadConfig();
    console.log('Configured providers:');
    for (const [name, p] of Object.entries(config.providers)) {
      console.log(`  ${name}: ${p.enabled ? '✅' : '❌'} (default: ${p.defaultModel || 'auto'})`);
    }
  });

// === 初始化 ===
program
  .command('init')
  .description('Initialize magent in current project')
  .action(async () => {
    const { initProject } = await import('../core/init.js');
    await initProject();
  });

program.parse();
