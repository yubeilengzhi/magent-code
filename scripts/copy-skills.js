#!/usr/bin/env node
/**
 * 复制 SKILL.md 文件到 dist
 *
 * 因为 tsc 不复制 .md 文件，需要这个脚本
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'skills', 'bundled');
const DEST = path.join(ROOT, 'dist', 'skills', 'bundled');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.md')) {
      await fs.copyFile(srcPath, destPath);
      console.log('  copied: ' + entry.name);
    }
  }
}

console.log('Copying bundled skills to dist...');
try {
  await copyDir(SRC, DEST);
  console.log('Done');
} catch (e) {
  console.error('Failed:', e.message);
  process.exit(1);
}