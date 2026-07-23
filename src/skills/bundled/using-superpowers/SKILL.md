---
name: using-superpowers
description: "Use this skill at the start of any conversation. Learn how to discover and invoke magent skills."
metadata:
  trigger: "start, how to use, skills, 开始, 怎么用, 如何用, 用 skill"
  origin: superpowers
  category: meta
  version: 1.0
---

# Using magent Skills

magent 包含 30+ 内置 skills。在任何任务开始时，先看看哪些 skill 可以帮你。

## How to Find Skills

magent 自动匹配：
- 你的任务触发关键词 → 自动加载相关 skill
- 用 `magent skills list` 查看所有可用 skills
- 用 `magent skills show <name>` 查看详情

## The Process

When you start a task:

1. **Identify the task type**:
   - Creating something new? → brainstorming
   - Fixing a bug? → systematic-debugging
   - Reviewing code? → code-review
   - Writing tests? → test-driven-development
   - etc.

2. **Look up the relevant skill**:
   - `magent skills list` to see all
   - Or rely on automatic matching

3. **Apply the skill's guidance**:
   - Follow the process steps
   - Honor HARD-GATEs (they're non-negotiable)
   - Use the checklist to verify

4. **If multiple skills apply**, apply them in order:
   - Start with planning (brainstorming → writing-plans)
   - Then engineering (executing-plans)
   - Then testing (test-driven-development)
   - Then verification (verification-before-completion)

## Skill Categories

- **📐 Planning**: brainstorming, writing-plans, spec-driven-development, ...
- **🧪 Testing**: test-driven-development, verification-before-completion, ...
- **🐛 Debugging**: systematic-debugging, root-cause-analysis, ...
- **👀 Review**: code-review, receiving-code-review, ...
- **🔧 Workflow**: using-git-worktrees, commit-hygiene, ...
- **⚙️ Engineering**: refactoring-patterns, api-design, ...
- **💬 Communication**: documentation-and-adrs, writing-skills, ...
- **📊 Project**: planning-and-task-breakdown, estimating-complexity, ...

## When to Use Multiple Skills

Often you'll combine:
- `brainstorming` + `writing-plans` + `executing-plans`
- `systematic-debugging` + `verification-before-completion`
- `code-review` + `receiving-code-review`

magent 自动按相关性排序。

## Customizing Skills

You can override any skill:
- Edit `~/.magent/skills/<name>/SKILL.md`
- Your version takes precedence over bundled
- Useful for project-specific conventions

## Anti-Pattern

- ❌ Skipping the planning skill ("just code it")
- ❌ Ignoring HARD-GATEs ("I'll be careful")
- ❌ Using skills as rigid rules (use judgment)
- ❌ Not checking for relevant skills ("I know what to do")

## Checklist

- [ ] Identified relevant skills
- [ ] Read the relevant skill's guidance
- [ ] Applied the process steps
- [ ] Honored HARD-GATEs
- [ ] Verified with checklist
- [ ] Used multiple skills when appropriate