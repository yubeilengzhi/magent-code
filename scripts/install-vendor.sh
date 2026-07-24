#!/usr/bin/env bash
# 安装 vendor 依赖（避免 CDN 跨域问题）
# 这些文件不应该进 git 仓库，由用户在 build 前手动运行

set -e

VENDOR_DIR="$(dirname "$0")/../public/vendor"
mkdir -p "$VENDOR_DIR"

echo "📦 安装 vendor 依赖..."

# Tailwind CSS (standalone)
echo "  - tailwindcss..."
npm install --no-save --prefix "$VENDOR_DIR" @tailwindcss/browser@4 2>&1 | tail -1
cp "$VENDOR_DIR/node_modules/@tailwindcss/browser/dist/index.global.js" "$VENDOR_DIR/tailwindcss.js"

# Marked
echo "  - marked..."
npm install --no-save --prefix "$VENDOR_DIR" marked@13.0.3 2>&1 | tail -1
cp "$VENDOR_DIR/node_modules/marked/marked.min.js" "$VENDOR_DIR/marked.min.js"

# DOMPurify
echo "  - dompurify..."
npm install --no-save --prefix "$VENDOR_DIR" dompurify@3.1.6 2>&1 | tail -1
cp "$VENDOR_DIR/node_modules/dompurify/dist/purify.min.js" "$VENDOR_DIR/purify.min.js"

# Highlight.js CSS
echo "  - highlight.js..."
npm install --no-save --prefix "$VENDOR_DIR" highlight.js@11.11.1 2>&1 | tail -1
cp "$VENDOR_DIR/node_modules/highlight.js/styles/github.min.css" "$VENDOR_DIR/github.min.css"

# 清理 node_modules
rm -rf "$VENDOR_DIR/node_modules" "$VENDOR_DIR/package.json" "$VENDOR_DIR/package-lock.json"

echo ""
echo "✅ Vendor 依赖已安装到 $VENDOR_DIR"
ls -lh "$VENDOR_DIR"
