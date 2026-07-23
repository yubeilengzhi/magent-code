/**
 * 默认 pool.yml 模板
 */

export const DEFAULT_POOL_YML = `# magent 统一模型池
# magent 不修改任何工具的配置（~/.codex/、~/.claude/ 等）

models:
  # === Anthropic 模型（只能用 claude-code）===
  - name: "claude-opus-4"
    aliases: ["opus", "claude", "smart"]
    description: "Claude Opus 4 - 最强推理"
    compatibility:
      - provider: claude-code
        model_name: "opus"

  - name: "claude-sonnet-4"
    aliases: ["sonnet"]
    description: "Claude Sonnet 4 - 平衡"
    compatibility:
      - provider: claude-code
        model_name: "sonnet"

  - name: "claude-haiku"
    aliases: ["haiku", "router", "small"]
    description: "Claude Haiku - 快速便宜"
    compatibility:
      - provider: claude-code
        model_name: "haiku"

  # === Qwen / Kimi 模型（用 codex via cliproxy）===
  - name: "qwen3.7-plus"
    aliases: ["qwen", "default", "fast"]
    description: "Qwen 3.7 Plus - 默认快速模型"
    compatibility:
      - provider: codex
        model_name: "qwen3.7-plus"
      - provider: opencode
        model_name: "qwen3.7-plus"
      - provider: pi
        model_name: "qwen3.7-plus"

  - name: "kimi-k2.6"
    aliases: ["kimi", "reasoning"]
    description: "Kimi K2.6 - 强推理"
    compatibility:
      - provider: codex
        model_name: "kimi-k2.6"

  - name: "deepseek-v4-flash"
    aliases: ["deepseek"]
    description: "DeepSeek V4 Flash - 速度极快"
    compatibility:
      - provider: codex
        model_name: "deepseek-v4-flash"

  # === OpenAI 模型 ===
  - name: "gpt-4o"
    aliases: ["gpt4"]
    description: "GPT-4o"
    compatibility:
      - provider: codex
        model_name: "gpt-4o"

# === Provider 配置 ===
providers:
  codex:
    cli: "codex"
    enabled: true
    description: "OpenAI Codex CLI - 兼容 OpenAI 协议"

  claude-code:
    cli: "claude"
    enabled: true
    description: "Anthropic Claude Code CLI - 只能用 Anthropic 模型"

  opencode:
    cli: "opencode"
    enabled: false
    description: "OpenCode CLI"

  pi:
    cli: "pi"
    enabled: false
    description: "Pi Coding Agent"

  cursor:
    cli: "cursor"
    enabled: false
    description: "Cursor CLI - 限制模式"

# === 默认偏好 ===
defaults:
  default_model: "qwen3.7-plus"
  router_model: "claude-haiku"
`;