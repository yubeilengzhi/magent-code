---
name: spec-driven-development
description: "Spec-driven development: write the spec first, then implement to match. Reduce ambiguity before coding."
metadata:
  trigger: "spec, specification, 规格, 规范, SDD, write spec, requirements doc"
  origin: agent-skills
  category: planning
  version: 1.0
---

# Spec-Driven Development

Write the spec before the code. Reduce ambiguity before coding.

## Why

Specs force you to make decisions when they're cheap to change (in a doc) rather than expensive (in code, in tests, in production).

## Process

1. **Capture the why**: What's the problem? Who's affected? Why now?
2. **Define the what**: What does success look like? What does it not do?
3. **Specify the how**: API shape, data model, key algorithms
4. **Acceptance criteria**: How will we know it's done?
5. **Get review**: Once spec is clear, code follows naturally

## Spec Template

```markdown
# [Feature Name]

## Context
- Why this matters
- Current state

## Goals
- What we're trying to achieve

## Non-goals
- What we're explicitly NOT doing

## Design
- API/data model
- Key flows
- Trade-offs considered

## Acceptance Criteria
- [ ] Specific testable behavior
- [ ] Edge case handled

## Open Questions
- Things still to decide
```

## Anti-Pattern

- ❌ Writing spec that's basically a TODO list (no design thinking)
- ❌ Specs that get out of sync with code (no maintenance)
- ❌ Skipping the "non-goals" (everything in scope = nothing in scope)
- ❌ Specs without acceptance criteria (can't verify done)

## Checklist

- [ ] Context captures why
- [ ] Goals are clear
- [ ] Non-goals explicit
- [ ] Design explains trade-offs
- [ ] Acceptance criteria are testable
- [ ] Open questions listed