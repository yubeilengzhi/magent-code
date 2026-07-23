/**
 * SKILL.md Parser - magent 内置 skills 解析器
 *
 * 设计借鉴：superpowers / ECC / superpowers-zh 的 SKILL.md 格式
 * 完全自己实现，不调用任何外部项目
 *
 * skills 加载顺序：
 * 1. 内置 bundled skills（src/skills/bundled/）
 * 2. 用户自定义 skills（~/.magent/skills/，覆盖内置）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

/**
 * 用户 skills 目录（运行时）
 */
const SKILLS_DIR = path.join(os.homedir(), '.magent', 'skills');

/**
 * 内置 skills 目录（src/skills/bundled/）
 */
const BUNDLED_SKILLS_DIR = path.join(
  new URL('.', import.meta.url).pathname,
  'bundled'
);

export interface SkillMetadata {
  name: string;
  description: string;
  trigger?: string;
  origin?: string;
  author?: string;
  version?: string;
  category?: string;
  [key: string]: any;
}

export interface Skill {
  id: string;
  path: string;
  metadata: SkillMetadata;
  content: string;
  hardGates: string[];
  checklist: string[];
  loadedAt: string;
}

/**
 * 解析单个 SKILL.md
 */
export async function parseSkillFile(skillPath: string): Promise<Skill | null> {
  try {
    const content = await fs.readFile(skillPath, 'utf-8');

    const fmMatch = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const yamlText = fmMatch[1];
    const markdownText = fmMatch[2];

    const metadata = parseSimpleYaml(yamlText);

    if (!metadata.name) return null;

    const hardGates: string[] = [];
    const gateRegex = /<HARD-GATE>([\s\S]*?)<\/HARD-GATE>/g;
    let match;
    while ((match = gateRegex.exec(markdownText)) !== null) {
      hardGates.push(match[1].trim());
    }

    const checklist: string[] = [];
    const checklistMatch = markdownText.match(/##\s+Checklist\s*\n([\s\S]*?)(?=\n##\s|\n*$)/);
    if (checklistMatch) {
      const items = checklistMatch[1].matchAll(/^[-*]\s+(.+)$/gm);
      for (const item of items) {
        checklist.push(item[1].trim());
      }
    }

    const id = path.basename(path.dirname(skillPath));

    return {
      id,
      path: skillPath,
      metadata,
      content: markdownText.trim(),
      hardGates,
      checklist,
      loadedAt: new Date().toISOString(),
    };
  } catch (e) {
    return null;
  }
}

/**
 * 简单 YAML 解析（不依赖 yaml 包）
 */
function parseSimpleYaml(text: string): SkillMetadata {
  const result: SkillMetadata = {} as SkillMetadata;
  const lines = text.split('\n');
  let currentKey: string | null = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    if (indent === 0 && trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIdx).trim();
      const value = trimmed.substring(colonIdx + 1).trim();
      currentKey = key;

      if (value) {
        result[key] = stripQuotes(value);
      } else {
        result[key] = {};
      }
    } else if (indent > 0 && currentKey) {
      const subMatch = trimmed.match(/^(\S+):\s*(.*)$/);
      if (subMatch) {
        const subKey = subMatch[1];
        const subValue = subMatch[2];
        const parent = result[currentKey];

        if (typeof parent === 'object' && parent !== null && !Array.isArray(parent)) {
          if (subValue) {
            (parent as any)[subKey] = stripQuotes(subValue);
          } else {
            (parent as any)[subKey] = '';
          }
        }
      }
    }
  }

  return result;
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

/**
 * 从目录加载所有 SKILL.md
 */
async function loadFromDir(dir: string): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillMdPath = path.join(dir, entry.name, 'SKILL.md');
      const skill = await parseSkillFile(skillMdPath);
      if (skill) {
        skills.push(skill);
      }
    }
  } catch (e) {
    // 目录不存在或读失败
  }

  return skills;
}

/**
 * 加载所有 skills（内置 + 用户自定义）
 *
 * 加载顺序：
 * 1. 内置（bundled）
 * 2. 用户（~/.magent/skills/）—— 同名 skill 会覆盖内置
 */
export async function loadAllSkills(): Promise<Skill[]> {
  const bundled = await loadFromDir(BUNDLED_SKILLS_DIR);
  const userDefined = await loadFromDir(SKILLS_DIR);

  // 用户 skill 覆盖内置
  const skillMap = new Map<string, Skill>();
  for (const s of bundled) {
    skillMap.set(s.id, s);
  }
  for (const s of userDefined) {
    skillMap.set(s.id, s);
  }

  return Array.from(skillMap.values());
}

/**
 * 按 trigger 匹配 skill
 */
export function matchSkill(skills: Skill[], query: string): Skill[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  return skills
    .map(skill => {
      let score = 0;

      const trigger = skill.metadata.trigger?.toLowerCase() || '';
      for (const word of queryWords) {
        if (trigger.includes(word)) score += 3;
      }

      if (skill.metadata.name.toLowerCase().includes(queryLower)) score += 5;

      const desc = skill.metadata.description.toLowerCase();
      for (const word of queryWords) {
        if (desc.includes(word)) score += 2;
      }

      return { skill, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.skill);
}

/**
 * 格式化 skill 为 system prompt 片段
 */
export function formatSkillForPrompt(skill: Skill): string {
  let result = '\n## Skill: ' + skill.metadata.name + '\n';
  result += 'Description: ' + skill.metadata.description + '\n';

  if (skill.metadata.category) {
    result += 'Category: ' + skill.metadata.category + '\n';
  }

  if (skill.hardGates.length > 0) {
    result += '\n**HARD-GATES** (must enforce):\n';
    for (const gate of skill.hardGates) {
      result += '- ' + gate + '\n';
    }
  }

  if (skill.checklist.length > 0) {
    result += '\nChecklist:\n';
    for (const item of skill.checklist) {
      result += '- [ ] ' + item + '\n';
    }
  }

  result += '\n' + skill.content + '\n';
  return result;
}

/**
 * 初始化：把内置 skills 复制到用户目录
 *
 * 注意：用户目录的 skill 会覆盖内置
 * 这样用户可以自定义
 */
export async function initBuiltinSkills(): Promise<void> {
  await fs.mkdir(SKILLS_DIR, { recursive: true });

  try {
    const entries = await fs.readdir(BUNDLED_SKILLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const srcDir = path.join(BUNDLED_SKILLS_DIR, entry.name);
      const destDir = path.join(SKILLS_DIR, entry.name);

      // 检查用户是否已经有自定义版本
      try {
        await fs.access(destDir);
        continue;  // 跳过（用户自定义优先）
      } catch {
        // 不存在，复制
      }

      await fs.mkdir(destDir, { recursive: true });

      // 复制所有文件
      const files = await fs.readdir(srcDir);
      for (const file of files) {
        const src = path.join(srcDir, file);
        const dest = path.join(destDir, file);
        await fs.copyFile(src, dest);
      }
    }
  } catch (e) {
    // bundled 目录不存在或读失败
  }
}