/**
 * SKILL.md Parser - magent 内置 skills 解析器
 *
 * 设计借鉴：superpowers-zh / ECC / superpowers 的 SKILL.md 格式
 * 完全自己实现，不调用任何外部项目
 *
 * 格式：
 * ---
 * name: skill-name
 * description: what it does
 * metadata:
 *   trigger: "when to invoke"
 *   origin: where it's from
 * ---
 * # Markdown content
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const SKILLS_DIR = path.join(os.homedir(), '.magent', 'skills');

export interface SkillMetadata {
  name: string;
  description: string;
  trigger?: string;
  origin?: string;
  author?: string;
  version?: string;
  [key: string]: any;
}

export interface Skill {
  /** skill 唯一 ID（基于目录名） */
  id: string;

  /** 完整路径（~/{name}/SKILL.md） */
  path: string;

  /** YAML frontmatter */
  metadata: SkillMetadata;

  /** Markdown 正文 */
  content: string;

  /** 提取的硬门控（HARD-GATE 块） */
  hardGates: string[];

  /** 提取的检查清单 */
  checklist: string[];

  /** 加载时间戳 */
  loadedAt: string;
}

/**
 * 解析单个 SKILL.md
 */
export async function parseSkillFile(skillPath: string): Promise<Skill | null> {
  try {
    const content = await fs.readFile(skillPath, 'utf-8');

    // 1. 解析 YAML frontmatter（--- ... ---）
    const fmMatch = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
    if (!fmMatch) {
      return null;  // 没有 frontmatter，跳过
    }

    const yamlText = fmMatch[1];
    const markdownText = fmMatch[2];

    // 简单 YAML 解析（不依赖 yaml 包，避免重复）
    const metadata = parseSimpleYaml(yamlText);

    if (!metadata.name) {
      return null;  // 必须有 name
    }

    // 2. 提取 HARD-GATE 块（<HARD-GATE>...</HARD-GATE>）
    const hardGates: string[] = [];
    const gateRegex = /<HARD-GATE>([\s\S]*?)<\/HARD-GATE>/g;
    let match;
    while ((match = gateRegex.exec(markdownText)) !== null) {
      hardGates.push(match[1].trim());
    }

    // 3. 提取 Checklist（## Checklist 下的列表）
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
 * 简单 YAML 解析（支持嵌套 metadata）
 */
function parseSimpleYaml(text: string): SkillMetadata {
  const result: SkillMetadata = {} as SkillMetadata;
  const lines = text.split('\n');
  let currentKey: string | null = null;
  let indentLevel = 0;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    if (indent === 0 && trimmed.includes(':')) {
      // 顶层 key: value
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIdx).trim();
      const value = trimmed.substring(colonIdx + 1).trim();
      currentKey = key;
      indentLevel = 0;

      if (value) {
        // 简单字符串值
        result[key] = stripQuotes(value);
      } else {
        // 对象开始
        result[key] = {};
      }
    } else if (indent > 0 && currentKey) {
      // 嵌套 key: value
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
export async function loadAllSkills(skillsDir?: string): Promise<Skill[]> {
  const dir = skillsDir || SKILLS_DIR;
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
    // 目录不存在或读失败，返回空
  }

  return skills;
}

/**
 * 按 trigger 匹配 skill（找最相关的）
 */
export function matchSkill(skills: Skill[], query: string): Skill[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  return skills
    .map(skill => {
      let score = 0;

      // 匹配 trigger
      const trigger = skill.metadata.trigger?.toLowerCase() || '';
      for (const word of queryWords) {
        if (trigger.includes(word)) score += 3;
      }

      // 匹配 name
      if (skill.metadata.name.toLowerCase().includes(queryLower)) score += 5;

      // 匹配 description
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
  let result = `\n## Skill: ${skill.metadata.name}\n`;
  result += `Description: ${skill.metadata.description}\n`;

  if (skill.hardGates.length > 0) {
    result += `\n**HARD-GATES** (must enforce):\n`;
    for (const gate of skill.hardGates) {
      result += `- ${gate}\n`;
    }
  }

  if (skill.checklist.length > 0) {
    result += `\nChecklist:\n`;
    for (const item of skill.checklist) {
      result += `- [ ] ${item}\n`;
    }
  }

  result += `\n${skill.content}\n`;
  return result;
}

/**
 * 初始化内置 skills（创建示例）
 */
export async function initBuiltinSkills(): Promise<void> {
  await fs.mkdir(SKILLS_DIR, { recursive: true });

  // 内置 1: brainstorming
  const brainstorming = `---
name: brainstorming
description: "Use this skill before any creative work to explore ideas and design before implementing."
metadata:
  trigger: "brainstorm, design, plan, idea"
  origin: superpowers
  version: 1.0
---

<HARD-GATE>
Do NOT invoke any implementation skill until you have presented a design.
</HARD-GATE>

# Brainstorming Ideas Into Designs

When starting creative work:

1. Explore the requirements
2. Identify constraints
3. Propose 2-3 design options
4. Compare trade-offs
5. Get user approval before implementing

## Anti-Pattern

- Jumping straight to code
- Asking "what do you want?" without offering options
- Implementing the first idea that comes to mind

## Checklist

- [ ] Requirements understood
- [ ] Constraints identified
- [ ] Multiple design options presented
- [ ] User approval received
- [ ] Implementation plan documented
`;

  await fs.mkdir(path.join(SKILLS_DIR, 'brainstorming'), { recursive: true });
  await fs.writeFile(
    path.join(SKILLS_DIR, 'brainstorming', 'SKILL.md'),
    brainstorming,
  );

  // 内置 2: test-driven-development
  const tdd = `---
name: tdd
description: "Test-driven development: write failing test first, then implement."
metadata:
  trigger: "test, TDD, write test"
  origin: superpowers
  version: 1.0
---

<HARD-GATE>
Do NOT write implementation code before writing a failing test.
</HARD-GATE>

# Test-Driven Development

1. Write a failing test for the desired behavior
2. Run the test, confirm it fails for the expected reason
3. Write minimal code to make the test pass
4. Run the test, confirm it passes
5. Refactor
6. Repeat

## Checklist

- [ ] Test written first
- [ ] Test confirmed failing
- [ ] Minimal implementation
- [ ] Test passes
- [ ] Refactored cleanly
`;

  await fs.mkdir(path.join(SKILLS_DIR, 'tdd'), { recursive: true });
  await fs.writeFile(
    path.join(SKILLS_DIR, 'tdd', 'SKILL.md'),
    tdd,
  );

  // 内置 3: code-review
  const codeReview = `---
name: code-review
description: "Review code changes for correctness, style, and best practices."
metadata:
  trigger: "review, check code, audit"
  origin: superpowers-zh
  version: 1.0
---

# Code Review

When reviewing code:

1. Check correctness (does it do what it claims?)
2. Check edge cases (null, empty, boundary)
3. Check style (consistent with codebase)
4. Check tests (are changes tested?)
5. Check documentation (are docs updated?)
6. Suggest improvements (constructive)

## Anti-Pattern

- Nitpicking style without substance
- Praising without critique
- Skipping critical review
`;

  await fs.mkdir(path.join(SKILLS_DIR, 'code-review'), { recursive: true });
  await fs.writeFile(
    path.join(SKILLS_DIR, 'code-review', 'SKILL.md'),
    codeReview,
  );
}