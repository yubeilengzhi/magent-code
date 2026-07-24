#!/usr/bin/env node
/**
 * 从 src/skills/bundled/ 生成 public/skills.js
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const SKILLS_DIR = path.join(root, 'src', 'skills', 'bundled');
const OUTPUTS = [
  path.join(root, 'public', 'skills.js'),
  path.join(root, 'dist', 'public', 'skills.js'),
];

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};
  try {
    const parts = content.split('---');
    if (parts.length < 3) return {};
    const meta = {};
    for (const line of parts[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      meta[k] = v;
    }
    return meta;
  } catch {
    return {};
  }
}

async function main() {
  const skills = [];
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const skillFile = path.join(SKILLS_DIR, e.name, 'SKILL.md');
    try {
      const content = await fs.readFile(skillFile, 'utf-8');
      const meta = parseFrontmatter(content);
      const trigger = meta.trigger || '';
      skills.push({
        name: meta.name || e.name,
        description: meta.description || '',
        category: meta.category || 'general',
        origin: meta.origin || 'magent',
        triggers: trigger.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5),
      });
    } catch (err) {
      console.warn('Skipping', e.name, err.message);
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));

  const jsContent = `// 自动生成 - magent skills 数据库\nwindow.MAGENT_SKILLS = ${JSON.stringify(skills, null, 2)};\n`;

  for (const output of OUTPUTS) {
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, jsContent, 'utf-8');
    console.log(`✅ ${path.relative(root, output)} (${skills.length} skills)`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
