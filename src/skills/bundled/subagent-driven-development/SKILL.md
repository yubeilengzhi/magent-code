---
name: subagent-driven-development
description: "Execute multi-step implementation plans by dispatching subagents. Each subagent handles one task."
metadata:
  trigger: "subagent, delegate, sub-task, 分发任务, 子 agent"
  origin: superpowers
  category: engineering
  version: 1.0
---

# Subagent-Driven Development

For complex multi-step tasks, dispatch subagents instead of doing everything yourself.

## When to Use

✅ Use subagents for:
- Multi-file changes that can be parallelized
- Independent feature implementations
- Routine tasks (boilerplate, tests, docs)
- Long-running operations

⚠️ Don't use for:
- Single small changes (overhead)
- Tightly coupled work (race conditions)
- When you need full context for decisions

## The Pattern

```
Main agent (you)
├── Subagent 1: Implement feature A
├── Subagent 2: Implement feature B
└── Subagent 3: Update documentation

Each subagent:
- Has clear scope
- Reports back with diffs/results
- Main agent integrates
```

## Subagent Communication

Give each subagent:
1. **Goal**: What to achieve
2. **Context**: Files to read, patterns to follow
3. **Constraints**: What NOT to do
4. **Output format**: What to return

Example prompt:
```
Task: Add user settings endpoint
Goal: Implement GET/PUT /api/users/:id/settings

Context:
- Read src/api/users.ts for existing patterns
- Read docs/api.md for conventions
- Follow the pattern in src/api/profile.ts

Constraints:
- Do NOT modify existing files outside this scope
- Use the existing error handling pattern

Output:
- New file: src/api/settings.ts
- Test file: src/api/settings.test.ts
- Brief summary of changes
```

## Integration

When subagents return:
1. **Review their work** (don't blindly trust)
2. **Run tests** for their changes
3. **Check for conflicts** between subagents
4. **Integrate** into main

## Anti-Pattern

- ❌ Subagent doing too much (should be 1 task)
- ❌ Main agent losing context (subagents work independently)
- ❌ Subagent making architectural decisions (that's main agent's job)
- ❌ No verification of subagent output
- ❌ Subagents editing shared files (race conditions)

## Checklist

- [ ] Tasks independent
- [ ] Each subagent has clear scope
- [ ] Context provided (files, patterns, constraints)
- [ ] Output format specified
- [ ] Main agent reviews output
- [ ] Tests run after integration