#!/usr/bin/env node
/**
 * 复制 public 目录到 dist
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'public');
const destDir = path.join(root, 'dist', 'public');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  console.log('Copying public to dist/public...');
  try {
    await copyDir(srcDir, destDir);
    console.log('Done');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('No public dir, skipping');
    } else {
      throw e;
    }
  }
}

main();
