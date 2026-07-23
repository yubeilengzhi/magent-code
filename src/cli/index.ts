#!/usr/bin/env node
/**
 * magent CLI 入口
 */

import { Command } from 'commander';
import { runTask, runTaskWithProvider } from '../core/router.js';
import { listSessions, showSession, shareSession } from '../core/session.js';
import { searchMemory, listMemory, addMemory } from '../memory/engram.js';
import { showConfig, editConfig } from '../core/config.js';
import { ModelPool } from '../core/model-pool.js';

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

program.parse();