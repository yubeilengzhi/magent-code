---
name: planning-and-task-breakdown
description: "Break complex projects into shippable tasks. Identify dependencies, sequence work, estimate effort."
metadata:
  trigger: "task breakdown, decompose, split task, 任务分解, 拆分任务, plan project"
  origin: agent-skills
  category: project
  version: 1.0
---

# Task Breakdown

A big project is just many small tasks. Break it down.

## Process

1. **Define the goal** (one sentence)
2. **Identify the major phases**
3. **Break each phase into tasks** (1-3 days each)
4. **Identify dependencies** (what blocks what)
5. **Sequence tasks** (what order)
6. **Mark unknowns** (need research first)
7. **Estimate effort**

## Task Sizing

Each task should be:
- ✅ Completable in 1-3 days
- ✅ Independently testable
- ✅ Clearly defined (specific deliverable)
- ✅ Has acceptance criteria

❌ Too big: "Build the entire authentication system"
✅ Right size: "Add OAuth login endpoint with Google provider"

❌ Too small: "Add semicolon on line 42"
✅ Right size: "Add type definitions for User API"

## Dependency Graph

```
[Set up project] ──┬──> [API endpoints] ──> [Frontend integration]
                   │
                   └──> [Database schema] ──> [API endpoints]
```

Visualize this. Find the critical path. Identify parallelizable work.

## Estimation Techniques

### T-shirt Sizes (quick)
- S: < 1 day
- M: 1-3 days
- L: 1 week
- XL: 2+ weeks (probably needs breaking down)

### Story Points
- 1: trivial
- 2: small
- 3: medium
- 5: complex
- 8: very complex (break it down)
- 13: too complex (must break)

### Reference Class
- "This is like X, which took Y time"
- Compare to past similar work

## Sequencing

- **Critical path**: Tasks that must happen sequentially
- **Parallelizable**: Tasks that can run simultaneously
- **Quick wins first**: Build momentum, show progress
- **Risky first**: Tackle unknowns early, before building on top

## Anti-Pattern

- ❌ Tasks too big ("build the system")
- ❌ Tasks too small (busy work)
- ❌ No dependencies identified
- ❌ Optimistic estimates (multiply by 2)
- ❌ No buffer for unknowns

## Checklist

- [ ] Goal is clear
- [ ] Phases identified
- [ ] Each task 1-3 days
- [ ] Dependencies mapped
- [ ] Critical path identified
- [ ] Estimates realistic
- [ ] Unknowns marked