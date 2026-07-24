#!/usr/bin/env node
/**
 * magent CLI 入口
 */

import { Command } from 'commander';
import { runTask, runTaskWithProvider } from '../core/router.js';
import { listSessions, showSession, shareSession } from '../core/session.js';
import { searchMemory, listMemory, addMemory, getMemoryStore } from '../memory/store.js';
import { showConfig, editConfig } from '../core/config.js';
import { ModelPool } from '../core/model-pool.js';
import { loadAllSkills } from '../skills/parser.js';

const program = new Command();

program
  .name('magent')
  .description('Cross-tool AI coding assistant with smart routing')
  .version('0.1.0');

program
  .command('run')
  .description('Run a task with intelligent routing')
  .argument('<task...>', 'Task description')
  .option('-p, --provider <name>', 'Force a specific provider')
  .option('-m, --model <name>', 'Force a specific model')
  .option('-c, --cwd <path>', 'Working directory')
  .option('--no-memory', 'Disable memory injection')
  .option('--no-routing', 'Skip smart routing, use default provider')
  .action(async (taskArgs: string[], options) => {
    const task = taskArgs.join(' ');
    const runOptions = {
      cwd: options.cwd,
      memory: options.memory !== false,
      noRouting: options.routing === false,
    };

    if (options.provider) {
      await runTaskWithProvider(task, options.provider, options.model || '', runOptions);
    } else {
      await runTask(task, runOptions);
    }
  });
// === Session 管理 ===
const sessionCmd = program.command('session').description('Manage sessions');

sessionCmd
  .command('list')
  .description('List all sessions')
  .option('-p, --provider <provider>', 'Filter by provider')
  .option('-n, --limit <n>', 'Max results', '20')
  .action(async (options) => {
    const { getSessionStore } = await import('../memory/session.js');
    const store = await getSessionStore();
    const sessions = await store.listAll({
      provider: options.provider,
      limit: parseInt(options.limit),
    });
    
    if (sessions.length === 0) {
      console.log('No sessions found');
      return;
    }
    
    console.log(`Found ${sessions.length} session(s):\n`);
    for (const s of sessions) {
      console.log(`ID: ${s.id}`);
      console.log(`  Provider: ${s.provider}`);
      console.log(`  Model: ${s.model}`);
      console.log(`  Task: ${s.task.substring(0, 80)}${s.task.length > 80 ? '...' : ''}`);
      console.log(`  Created: ${s.createdAt}`);
      console.log(`  Updated: ${s.updatedAt}`);
      if (s.parentId) {
        console.log(`  Forked from: ${s.parentId}`);
      }
      console.log();
    }
  });

sessionCmd
  .command('show <id>')
  .description('Show session details')
  .action(async (id) => {
    const { getSessionStore } = await import('../memory/session.js');
    const store = await getSessionStore();
    const session = await store.get(id);
    
    if (!session) {
      console.error('Session not found: ' + id);
      process.exit(1);
    }
    
    console.log('Session Details:');
    console.log('ID:', session.id);
    console.log('Provider:', session.provider);
    console.log('Model:', session.model);
    console.log('Task:', session.task);
    console.log('Output:', session.output || '(empty)');
    console.log('Created:', session.createdAt);
    console.log('Updated:', session.updatedAt);
    if (session.parentId) {
      console.log('Forked from:', session.parentId);
    }
  });

sessionCmd
  .command('delete <id>')
  .description('Delete a session')
  .action(async (id) => {
    const { getSessionStore } = await import('../memory/session.js');
    const store = await getSessionStore();
    const deleted = await store.delete(id);
    
    if (deleted) {
      console.log('Session deleted: ' + id);
    } else {
      console.error('Session not found: ' + id);
      process.exit(1);
    }
  });

// === Routing History 管理 ===
const routingCmd = program.command('routing').description('Manage routing history and stats');

routingCmd
  .command('stats')
  .description('Show routing statistics')
  .option('-t, --task-type <type>', 'Filter by task type')
  .option('-p, --provider <provider>', 'Filter by provider')
  .action(async (options) => {
    const { getRoutingHistoryStore } = await import('../memory/routing-history.js');
    const store = await getRoutingHistoryStore();
    const stats = await store.getStats(options.taskType, options.provider);
    
    if (stats.length === 0) {
      console.log('No routing history found');
      return;
    }
    
    console.log(`Found ${stats.length} routing stat(s):\n`);
    for (const s of stats) {
      console.log(`Provider: ${s.provider}`);
      console.log(`  Task Type: ${s.taskType}`);
      console.log(`  Total Runs: ${s.totalRuns}`);
      console.log(`  Success Rate: ${(s.successRate * 100).toFixed(1)}%`);
      console.log(`  Avg Duration: ${s.avgDuration.toFixed(2)}s`);
      console.log(`  Avg Tokens: ${s.avgTokens.toFixed(0)}`);
      console.log(`  Score: ${s.score.toFixed(1)}`);
      console.log();
    }
  });

routingCmd
  .command('list')
  .description('List routing history')
  .option('-t, --task-type <type>', 'Filter by task type')
  .option('-p, --provider <provider>', 'Filter by provider')
  .option('-n, --limit <n>', 'Max results', '20')
  .action(async (options) => {
    const { getRoutingHistoryStore } = await import('../memory/routing-history.js');
    const store = await getRoutingHistoryStore();
    const history = await store.listAll({
      taskType: options.taskType,
      provider: options.provider,
      limit: parseInt(options.limit),
    });
    
    if (history.length === 0) {
      console.log('No routing history found');
      return;
    }
    
    console.log(`Found ${history.length} routing record(s):\n`);
    for (const h of history) {
      console.log(`ID: ${h.id}`);
      console.log(`  Timestamp: ${h.timestamp}`);
      console.log(`  Task Type: ${h.taskType}`);
      console.log(`  Provider: ${h.provider} / ${h.model}`);
      console.log(`  Success: ${h.success ? '✅' : '❌'}`);
      console.log(`  Duration: ${h.duration.toFixed(2)}s`);
      console.log(`  Tokens: ${h.tokensUsed}`);
      console.log(`  Task: ${h.taskDescription.substring(0, 80)}${h.taskDescription.length > 80 ? '...' : ''}`);
      console.log();
    }
  });

routingCmd
  .command('recommend <task-type>')
  .description('Get recommended provider for a task type')
  .action(async (taskType) => {
    const { getRoutingHistoryStore } = await import('../memory/routing-history.js');
    const store = await getRoutingHistoryStore();
    const recommended = await store.getRecommendedProvider(taskType);
    
    if (!recommended) {
      console.log(`No routing history found for task type: ${taskType}`);
      return;
    }
    
    console.log(`Recommended provider for "${taskType}": ${recommended.provider}`);
    console.log(`Score: ${recommended.score.toFixed(1)}`);
  });

const memoryCmd = program.command('memory').description('Manage persistent memory (built-in SQLite + FTS5)');

memoryCmd
  .command('search <query>')
  .description('Search memories')
  .option('--top-k <n>', 'Top K results', '10')
  .action(async (query: string, options) => {
    const store = await getMemoryStore();
    const results = await store.search(query, { topK: parseInt(options.topK) });
    console.log('Found ' + results.length + ' memories:');
    for (const r of results) {
      console.log('  [' + r.category + '] ' + r.content);
    }
  });

memoryCmd
  .command('list')
  .description('List all memories')
  .action(async () => {
    const store = await getMemoryStore();
    const records = await store.listAll({ limit: 50 });
    const total = await store.count();
    console.log('Total: ' + total + ' memories');
    for (const r of records) {
      console.log('  [' + r.category + '] ' + r.content);
    }
  });

memoryCmd
  .command('add <content>')
  .description('Add a memory')
  .option('--category <cat>', 'Category (preference, project, decision)', 'general')
  .action(async (content: string, options) => {
    const store = await getMemoryStore();
    const record = await store.saveMemory({ content, category: options.category });
    console.log('Saved: [' + record.category + '] ' + record.content);
  });

// === Skills 管理（内置 SKILL.md）===
const skillsCmd = program.command('skills').description('Manage skills (built-in SKILL.md parser)');

skillsCmd
  .command('list')
  .description('List all loaded skills')
  .action(async () => {
    const skills = await loadAllSkills();
    console.log('Loaded ' + skills.length + ' skills:');
    for (const s of skills) {
      console.log('  - ' + s.id + ': ' + s.metadata.description);
    }
  });

const modelCmd = program.command('model').description('Manage models (from pool.yml)');

modelCmd
  .command('list')
  .description('List all models')
  .action(async () => {
    const pool = await ModelPool.load();
    console.log('Available models:');
    for (const m of pool.listModels()) {
      const compat = pool.findProviders(m.name);
      const providerList = compat.map(c => c.provider).join(', ') || 'NONE';
      console.log('  ' + m.name + ' (' + m.aliases.join(', ') + ')');
      console.log('    ' + m.description);
      console.log('    Providers: ' + providerList);
    }
  });

modelCmd
  .command('use <model>')
  .description('Set default model')
  .action(async (model: string) => {
    const pool = await ModelPool.load();
    const resolved = pool.resolve(model);
    if (!resolved) {
      console.error('Unknown model: ' + model);
      process.exit(1);
    }
    await pool.setDefaultModel(resolved.name);
    console.log('Default model set to: ' + resolved.name);
  });

modelCmd
  .command('resolve <name>')
  .description('Resolve model name (including aliases)')
  .action(async (name: string) => {
    const pool = await ModelPool.load();
    const model = pool.resolve(name);
    if (!model) {
      console.error('Unknown model: ' + name);
      process.exit(1);
    }
    console.log('Model: ' + model.name);
    console.log('Aliases: ' + model.aliases.join(', '));
    console.log('Description: ' + model.description);
    console.log('Compatible providers:');
    for (const c of pool.findProviders(model.name)) {
      console.log('  - ' + c.provider + ' (CLI: ' + c.cli + ', model_name: ' + c.model_name + ')');
    }
  });

const providerCmd = program.command('provider').description('Manage providers');

providerCmd
  .command('list')
  .description('List configured providers')
  .action(async () => {
    const pool = await ModelPool.load();
    console.log('Configured providers:');
    for (const p of pool.listProviders()) {
      console.log('  ' + p.name + ' (CLI: ' + p.cli + '): ' + (p.enabled ? '[OK]' : '[ ]'));
    }
  });

providerCmd
  .command('enable <name>')
  .description('Enable a provider')
  .action(async (name: string) => {
    const pool = await ModelPool.load();
    await pool.setProviderEnabled(name, true);
    console.log('Enabled: ' + name);
  });

providerCmd
  .command('disable <name>')
  .description('Disable a provider')
  .action(async (name: string) => {
    const pool = await ModelPool.load();
    await pool.setProviderEnabled(name, false);
    console.log('Disabled: ' + name);
  });

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

program
  .command('init')
  .description('Initialize magent in current project')
  .action(async () => {
    const { initProject } = await import('../core/init.js');
    await initProject();
  });

// === Web UI 服务器 ===
program
  .command('serve')
  .description('启动 Web UI 服务器（默认 0.0.0.0:20011）')
  .option('-p, --port <port>', '服务器端口', '20011')
  .option('-h, --host <host>', '绑定地址', '0.0.0.0')
  .action(async (options) => {
    process.env.MAGENT_PORT = options.port;
    process.env.MAGENT_HOST = options.host;
    const { startServer } = await import('../web/server.js');
    startServer();
  });

program.parse();