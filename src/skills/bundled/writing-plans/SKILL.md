---
name: writing-plans
description: "Turn a brainstormed design into an executable implementation plan."
metadata:
  trigger: "plan, implement, build, write plan, planning, 计划, 实施, 方案, 步骤, implementation plan, step by step, roadmap, 写计划, 实施计划"
  origin: superpowers
  category: planning
  version: 1.0
---

# Writing Implementation Plans

A good plan is the difference between chaos and progress.

## Plan Structure

```markdown
# [Goal]

## Context
- Why this matters
- What's the current state
- Constraints to honor

## Approach
- High-level strategy
- Key trade-offs

## Steps
1. [Concrete, verifiable step]
2. [Next step]
3. ...

Each step should be:
- Small enough to verify (single commit usually)
- Clear what "done" looks like
- Independently reviewable

## Files to Create/Modify
- path/to/file: brief reason

## Verification
- [ ] All tests pass
- [ ] Specific user-visible behavior works
- [ ] Edge cases handled

## Risks
- What could go wrong
- How to mitigate
```

## Process

1. Start with the goal (one sentence)
2. Capture context (why now, what's been considered)
3. List steps in execution order
4. Each step = one commit = one PR-review cycle
5. Add verification steps at the end
6. Identify risks upfront

## Anti-Pattern

- ❌ Steps too vague ("implement the feature")
- ❌ No verification criteria
- ❌ 20-page plans that nobody reads
- ❌ Steps that depend on each other in unclear ways
- ❌ Missing rollback plan

## Checklist

- [ ] Goal is one sentence
- [ ] Context explains "why"
- [ ] Steps are concrete and verifiable
- [ ] Each step maps to one commit
- [ ] Verification criteria are explicit
- [ ] Risks identified with mitigations