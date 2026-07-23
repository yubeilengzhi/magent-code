---
name: root-cause-analysis
description: "Find the actual root cause, not the symptom. Use 5 Whys, fishbone diagrams, and systematic questioning."
metadata:
  trigger: "root cause, 5 whys, why why why, 根本原因, 深入分析, 真因"
  origin: magent
  category: debugging
  version: 1.0
---

# Root Cause Analysis

The symptom is not the cause. Keep digging until you find the real cause.

## 5 Whys Method

For each "why", the answer becomes the next "why":

1. **The system crashed.**
   Why? → Memory leak exhausted RAM.
2. Why? → Object reference not released.
3. Why? → No `dispose()` called.
4. Why? → Code didn't know it should dispose.
5. Why? → **Design assumption that connections auto-cleanup.**

Root cause: **Wrong assumption about resource lifecycle**, not the leak itself.

## Other Techniques

### Fishbone (Ishikawa) Diagram
Categories of causes:
- **Man**: skill, training
- **Method**: process, procedure
- **Machine**: tools, infrastructure
- **Material**: inputs, data
- **Measurement**: metrics, monitoring
- **Environment**: context, conditions

### Fault Tree Analysis
Start from the failure, decompose into sub-causes, ask "AND/OR" until you reach root causes.

## Common Mistakes

❌ Stopping at "user error" (not actionable)
❌ Blaming "the network" without evidence
❌ Fixing the symptom, not the cause
❌ Single-cause thinking (most issues have multiple contributing factors)

## Anti-Pattern

- ❌ "It works on my machine" → not root cause
- ❌ "Must be a config issue" → speculation
- ❌ "Just restart and see" → denial
- ❌ "It's always been like this" → assuming the design is correct

## Checklist

- [ ] Identified symptom (not cause)
- [ ] Asked "why" 5+ times
- [ ] Considered multiple contributing factors
- [ ] Found a cause that's actionable
- [ ] Verified the fix addresses the cause, not just symptom