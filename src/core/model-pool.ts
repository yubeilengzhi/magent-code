/**
 * Model Pool - 统一模型池
 *
 * 设计原则：
 * 1. magent 不直接管理 token（让各 CLI 自己管）
 * 2. magent 不写任何工具的 config 文件
 * 3. compatibility 是数据驱动（pool.yml 声明）
 * 4. 加新 provider = pool.yml 加一段（不改代码）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import yaml from 'yaml';

export interface ModelCompatibility {
  provider: string;
  model_name: string;
}

export interface ModelDefinition {
  name: string;
  aliases: string[];
  description: string;
  compatibility: ModelCompatibility[];
}

export interface ProviderDefinition {
  cli: string;
  enabled: boolean;
  description?: string;
}

export interface ModelPoolConfig {
  models: ModelDefinition[];
  providers: Record<string, ProviderDefinition>;
  defaults: {
    default_model: string;
    router_model: string;
  };
}

const POOL_PATH = path.join(os.homedir(), '.magent', 'models', 'pool.yml');

export class ModelPool {
  private config: ModelPoolConfig;

  constructor(config: ModelPoolConfig) {
    this.config = config;
  }

  static async load(): Promise<ModelPool> {
    try {
      const content = await fs.readFile(POOL_PATH, 'utf-8');
      const config = yaml.parse(content) as ModelPoolConfig;
      return new ModelPool(config);
    } catch (e) {
      throw new Error('Failed to load model pool: ' + e + '. Run `magent init` first.');
    }
  }

  resolve(modelOrAlias: string): ModelDefinition | null {
    for (const model of this.config.models) {
      if (model.name === modelOrAlias) return model;
      if (model.aliases.includes(modelOrAlias)) return model;
    }
    return null;
  }

  listModels(): ModelDefinition[] {
    return this.config.models;
  }

  listProviders(): Array<{ name: string } & ProviderDefinition> {
    return Object.entries(this.config.providers).map(([name, def]) => ({
      name,
      ...def,
    }));
  }

  findProviders(modelName: string): Array<{ provider: string; model_name: string; cli: string }> {
    const model = this.resolve(modelName);
    if (!model) return [];

    const results: Array<{ provider: string; model_name: string; cli: string }> = [];

    for (const compat of model.compatibility) {
      const provider = this.config.providers[compat.provider];
      if (!provider) continue;
      if (!provider.enabled) continue;
      results.push({
        provider: compat.provider,
        model_name: compat.model_name,
        cli: provider.cli,
      });
    }

    return results;
  }

  selectProvider(modelName: string): { provider: string; model_name: string; cli: string } | null {
    const candidates = this.findProviders(modelName);
    return candidates[0] || null;
  }

  getDefaultModel(): string {
    return this.config.defaults.default_model;
  }

  getRouterModel(): string {
    return this.config.defaults.router_model;
  }

  getConfig(): ModelPoolConfig {
    return this.config;
  }

  async save(): Promise<void> {
    await fs.mkdir(path.dirname(POOL_PATH), { recursive: true });
    await fs.writeFile(POOL_PATH, yaml.stringify(this.config));
  }

  async setDefaultModel(modelName: string): Promise<void> {
    this.config.defaults.default_model = modelName;
    await this.save();
  }

  async setProviderEnabled(providerName: string, enabled: boolean): Promise<void> {
    const provider = this.config.providers[providerName];
    if (!provider) {
      throw new Error('Unknown provider: ' + providerName);
    }
    provider.enabled = enabled;
    await this.save();
  }
}