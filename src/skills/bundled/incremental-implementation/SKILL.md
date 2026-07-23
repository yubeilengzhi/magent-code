---
name: incremental-implementation
description: "Build in small steps. Each step is a working, deployable increment."
metadata:
  trigger: "incremental, small steps, MVP, iterate, 小步快跑, 增量, 最小可行, 逐步实现"
  origin: agent-skills
  category: planning
  version: 1.0
---

# Incremental Implementation

Don't build the whole thing at once. Build the smallest useful slice, ship it, then add more.

## Why

- Get feedback earlier (before building 10 things nobody wanted)
- Each step is shippable (no "big bang" releases)
- Easier to debug (smaller diffs)
- Easier to roll back (one step at a time)

## Process

1. **Identify the thinnest vertical slice**
   - What's the simplest end-to-end path?
   - Example: "user can sign up" not "all of authentication"

2. **Build it end-to-end (not horizontally)**
   - All layers (UI, API, DB) for one feature
   - Not all UI, then all API, then all DB

3. **Ship and learn**
   - Deploy to real users
   - Measure usage
   - Adjust based on feedback

4. **Add the next slice**
   - Repeat

## Examples

❌ Bad (horizontal): "First build all the UI, then all the API"
✅ Good (vertical): "First build user signup (UI + API + DB), then login, then password reset"

❌ Bad (big bang): "Build the entire marketplace feature in one release"
✅ Good (incremental): "First, sellers can list items. Then buyers can browse. Then payments."

## Anti-Pattern

- ❌ "Let me just finish this whole feature first"
- ❌ Long-running branches that diverge from main
- ❌ Big-bang releases with months of changes
- ❌ Skipping user validation between steps

## Checklist

- [ ] Identified thinnest useful slice
- [ ] Built end-to-end (all layers)
- [ ] Shipped and got real feedback
- [ ] Used learning to inform next slice