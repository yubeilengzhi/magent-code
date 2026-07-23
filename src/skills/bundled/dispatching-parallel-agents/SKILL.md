---
name: dispatching-parallel-agents
description: "When facing 2+ independent tasks, dispatch parallel agents instead of serial work."
metadata:
  trigger: "parallel, multiple agents, concurrent, 并行, 同时, 多个任务"
  origin: superpowers
  category: engineering
  version: 1.0
---

# Dispatching Parallel Agents

Two independent tasks? Don't do them one by one. Dispatch them in parallel.

## When to Parallelize

✅ Good candidates:
- 2+ unrelated features
- Independent test runs
- Multiple files that don't depend on each other
- Different parts of a system

❌ Bad candidates (must be serial):
- Task A's output is Task B's input
- Shared state that conflicts
- Tight coupling between tasks

## How to Dispatch

For each parallel task:
1. **Clear scope**: What exactly does this agent do?
2. **Inputs**: What files/context does it need?
3. **Outputs**: What should it produce?
4. **Verification**: How do we know it's done?

```markdown
# Agent 1: Refactor auth module
Scope: refactor src/auth/* to use new error handling
Inputs: src/auth/, design doc in docs/auth-design.md
Outputs: refactored auth module + tests
Done when: tests pass, no behavior change

# Agent 2: Add user settings
Scope: implement user preferences endpoints
Inputs: docs/api.md, src/db/
Outputs: new endpoints + tests
Done when: tests pass, docs updated
```

## Tools

Different platforms have different mechanisms:
- **git worktrees**: Each agent in own worktree, different branch
- **tmux sessions**: Each agent in own pane
- **Separate processes**: Spawn N processes, gather results

## Coordination

- Don't share files between parallel agents (race conditions)
- Merge results sequentially
- If conflicts arise, resolve carefully (likely both did similar work)

## Anti-Pattern

- ❌ Two agents editing same file
- ❌ Agent A waits for Agent B without knowing
- ❌ Tasks that depend on each other run in parallel
- ❌ One agent does 50% of another's work

## Checklist

- [ ] Tasks are independent
- [ ] No shared mutable state
- [ ] Each task has clear scope/output
- [ ] Verification method defined
- [ ] Merge plan ready