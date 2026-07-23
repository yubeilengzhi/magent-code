# magent

> **Cross-tool AI coding assistant with smart routing, persistent memory, and shared skills.**
>
> magent 本身不包含任何 AI 工具的代码（Codex、Claude Code、Pi 等）——它是 **wrapper / 集成层**，通过 spawn 调起这些 CLI。

## ✨ 核心特性

- **统一入口** — 一个 CLI 命令跨多个 AI agent
- **智能路由** — 基于 LLM 决策，自动选合适的 agent + model
- **模型池** — `~/.magent/models/pool.yml` 管所有模型偏好
- **兼容性检查** — 不会让 claude-code 跑非 Anthropic 模型
- **持久记忆** — 通过 engram（MCP）跨 agent 共享记忆
- **Skills 共享** — 通过 superpowers-zh 加载 20 个 skills

## 📦 magent 不包含

magent 是一个 **wrapper**，本身**不包含任何 AI 工具的源码**：

| 工具 | magent 怎么用 |
|------|--------------|
| **Codex CLI** | `spawn codex --model <name>` |
| **Claude Code** | `spawn claude --model <name>` |
| **Pi** | `spawn pi --model <name>` |
| **OpenCode** | `spawn opencode --model <name>` |
| **engram** | 通过 MCP 协议连接 |
| **superpowers-zh** | 通过 npm 包调用 |

**magent 永远不修改这些工具的配置**（`~/.codex/config.toml`、`~/.claude/settings.json` 等）。
magent 只 **spawn + 传 --model 参数**。

## 🚀 安装

```bash
# 1. 安装 magent
npm install -g magent

# 2. (可选) 装你想要的 AI 工具
brew install gentleman-programming/tap/engram  # 持久记忆
npm install -g @openai/codex                    # Codex CLI
npm install -g @anthropic-ai/claude-code        # Claude Code
npm install -g @earendil-works/pi-coding-agent # Pi
npm install -g superpowers-zh                   # Skills 库
```

## 🎯 使用

```bash
# 初始化（创建 ~/.magent/models/pool.yml）
magent init

# 查看所有 model + 兼容性
magent model list

# 解析 alias
magent model resolve fast
# Model: qwen3.7-plus
# Providers: codex

# 切换默认 model
magent model use kimi-k2.6

# 跑任务（自动路由）
magent run "重构 src/foo.ts"

# 强制指定
magent run --provider codex --model qwen3.7-plus "fix bug"
magent run --provider claude-code --model sonnet "深度分析"

# 启用/禁用 provider
magent provider enable opencode
magent provider disable cursor
```

## 🧠 设计：模型池 (pool.yml)

```yaml
models:
  - name: "qwen3.7-plus"
    aliases: ["fast", "default"]
    description: "Qwen 3.7 Plus"
    compatibility:
      - provider: codex        # ✅ 可被 codex 跑
        model_name: "qwen3.7-plus"
      # 注意：claude-code 不在列表里（不能跑非 Anthropic 模型）

  - name: "claude-sonnet-4"
    aliases: ["sonnet"]
    description: "Claude Sonnet 4"
    compatibility:
      - provider: claude-code   # ✅ 只能用 claude-code
        model_name: "sonnet"

providers:
  codex:
    cli: "codex"
    enabled: true
  claude-code:
    cli: "claude"
    enabled: true
```

**关键**：每个 model 声明能被哪些 provider 跑。magent 根据兼容性智能路由。

## 🏗️ 架构

```
User
  ↓
magent CLI (统一入口)
  ↓
[Router] 基于 compatibility 决策
  ├─→ engram (MCP) - 持久记忆
  ├─→ superpowers-zh (npx) - Skills 库
  └─→ 16+ Provider (spawn)
       ├─ Codex (OpenAI 协议)
       ├─ Claude Code (Anthropic)
       ├─ OpenCode / Pi / Cursor / ...
       └─ 永远不改任何工具的配置
```

## 📋 不变量（核心约束）

| ✅ magent 做 | ❌ magent 不做 |
|-------------|---------------|
| spawn 调起 CLI | 改 ~/.codex/config.toml |
| 传 --model 参数 | 改 ~/.claude/settings.json |
| 通过 MCP 连接 engram | 改 ~/.config/opencode/* |
| npx 调用 superpowers-zh | 改 ~/.pi/* |
| 读 ~/.magent/models/pool.yml | 改任何工具的源码 |
| 写入 ~/.magent/ 目录 | fork / patch 任何上游项目 |

## 🎯 Roadmap

- [x] MVP 0.1.0 - 模型池 + 智能路由
- [x] Codex adapter (spawn)
- [x] Claude Code adapter (spawn)
- [x] 兼容性检查
- [x] 模型池配置（pool.yml）
- [ ] engram 真正工作（持久记忆）
- [ ] superpowers-zh 集成（skills 加载）
- [ ] Session 持久化
- [ ] 16+ provider adapters（参考 cc-connect）
- [ ] Web UI（可选）

## 🔧 开发

```bash
git clone https://github.com/yubeilengzhi/magent-code.git
cd magent-code
npm install
npm run build
node dist/cli/index.js --version
```

## 📝 License

MIT

## 🙏 致谢

magent 借鉴了以下开源项目（不修改它们的代码）：

- **[engram](https://github.com/Gentleman-Programming/engram)** - 持久化记忆
- **[superpowers-zh](https://github.com/jnMetaCode/superpowers-zh)** - Skills 库
- **[cc-connect](https://github.com/chenhg5/cc-connect)** - 16+ agent 桥接设计
- **[Codex SDK](https://www.npmjs.com/package/@openai/codex-sdk)** - Codex
- **[Claude Code SDK](https://www.npmjs.com/package/@anthropic-ai/claude-code)** - Claude Code
- **[Pi](https://pi.dev/)** - 极简设计哲学
- **[cloudcli](https://github.com/cloudcli-ai/cloudcli)** - Provider 抽象思路