# magent

> Cross-tool AI coding assistant with smart routing, persistent memory, and shared skills.

## Status: v0.1.0 (MVP)

Built on top of proven open-source projects:
- **[engram](https://github.com/Gentleman-Programming/engram)** - persistent memory via MCP
- **[superpowers-zh](https://github.com/jnMetaCode/superpowers-zh)** - 20 skills × 20 harnesses
- **[cc-connect](https://github.com/chenhg5/cc-connect)** - 16+ agent adapter design
- **[@openai/codex-sdk](https://www.npmjs.com/package/@openai/codex-sdk)** - Codex
- **[claude-code](https://docs.anthropic.com/en/docs/claude-code)** - Claude Code

## Installation

```bash
# 1. Install magent
npm install -g magent

# 2. (Optional) Install engram for persistent memory
brew install gentleman-programming/tap/engram

# 3. (Optional) Install superpowers-zh for skills
npm install -g superpowers-zh
```

## Quick Start

```bash
# Run a task (smart routing picks the best agent)
magent run "重构 src/foo.ts"

# Force a specific agent
magent run --provider codex "快速修改 README"
magent run --provider claude-code "深度重构"

# Manage sessions
magent session list
magent session show <id>
magent session share <id>

# Manage memory (via engram)
magent memory search "用户偏好"
magent memory list
magent memory add "我喜欢 TypeScript"

# Configuration
magent config show
magent config edit
magent provider list
magent provider add codex
```

## Architecture

```
User
  ↓
magent CLI (统一入口)
  ↓
[magent router] (LLM 决策)
  ├─→ engram (记忆后端 via MCP)
  ├─→ superpowers-zh (skills 库 via npx)
  └─→ 16+ agent adapter
       ├─ Claude Code
       ├─ Codex
       ├─ OpenCode
       └─ ... (参考 cc-connect)
```

## Roadmap

- [x] PoC (architecture validation)
- [x] Design (architecture docs)
- [ ] v0.1.0 (MVP - Week 1-4)
  - [ ] CLI 入口
  - [ ] Codex adapter
  - [ ] Claude Code adapter
  - [ ] engram integration
  - [ ] superpowers-zh integration
  - [ ] Smart routing
  - [ ] npm publish
- [ ] v1.0 (3 months)
  - [ ] 16+ agent adapters
  - [ ] Cross-tool session migration
  - [ ] Web UI
  - [ ] Tree-structured session history
- [ ] v2.0 (6 months)
  - [ ] Multi-agent parallel
  - [ ] Messaging integrations
  - [ ] Team features

## License

MIT
