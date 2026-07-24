#!/usr/bin/env node
/**
 * 复制 public 目录到 dist
 * 排除 vendor（vendor 会被单独复制）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'public');
const destDir = path.join(root, 'dist', 'public');

async function copyDir(src, dest, exclude = []) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  console.log('Copying public to dist/public...');
  try {
    // 不复制 vendor/ - 它由 install-vendor.sh 单独管理
    await copyDir(srcDir, destDir, ['vendor']);
    console.log('  ✓ public/ copied (excluding vendor)');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('  ✗ No public dir, skipping');
    } else {
      throw e;
    }
  }

  // 单独复制 vendor（如果存在）
  const vendorSrc = path.join(srcDir, 'vendor');
  const vendorDest = path.join(destDir, 'vendor');
  try {
    await fs.access(vendorSrc);
    await copyDir(vendorSrc, vendorDest);
    console.log('  ✓ vendor/ copied (' + (await fs.readdir(vendorSrc)).length + ' files)');
  } catch (e) {
    console.log('  - No vendor dir (run scripts/install-vendor.sh)');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
