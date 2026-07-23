---
name: trade-off-analysis
description: "Explicitly compare options before choosing. Make trade-offs visible."
metadata:
  trigger: "trade-off, compare, choose, pros cons, 权衡, 选择, 比较, 利弊"
  origin: magent
  category: planning
  version: 1.0
---

# Trade-Off Analysis

Every choice has trade-offs. Make them explicit, not implicit.

## Why

- Avoids "I picked X because I prefer it" (arbitrary)
- Reveals hidden assumptions
- Makes decisions reversible (you can re-evaluate later)
- Documents *why*, not just *what*

## Process

1. **State the decision** clearly
2. **List options** (at least 2-3)
3. **For each option**:
   - Pros
   - Cons
   - Risks
   - Reversibility
4. **Compare on key dimensions**:
   - Performance
   - Complexity
   - Cost
   - Time to implement
   - Maintenance burden
5. **Recommend with reasoning**
6. **Wait for user approval**

## Template

```markdown
# Decision: [What we're choosing]

## Context
- What problem are we solving?
- What constraints do we have?

## Options Considered

### Option A: [Name]
**Pros**:
- ...
**Cons**:
- ...
**Risks**:
- ...
**Reversibility**: [easy/medium/hard]

### Option B: [Name]
...

## Comparison

| Dimension | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Performance | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Complexity | Low | High | Medium |
| Time | 1d | 1w | 3d |
| Cost | $0 | $100/mo | $0 |

## Recommendation
Option B because [reasoning]. The complexity is worth the
scalability we need.

## Open Questions
- Should we re-evaluate if traffic exceeds 10x?
```

## Examples of Dimensions

- **Performance**: latency, throughput, memory
- **Development**: time to ship, ease of debugging
- **Operations**: monitoring, alerting, deployment
- **Team**: learning curve, hiring, expertise
- **Cost**: $$/month, dev time
- **Risk**: what if it fails? blast radius?

## Anti-Pattern

- ❌ "Just pick one" (without analysis)
- ❌ Hidden trade-offs (the user should see them)
- ❌ Premature optimization (over-engineering for hypothetical future)
- ❌ "We always do X" (appeal to tradition, not analysis)
- ❌ Bikeshedding (debating trivial details)

## Checklist

- [ ] Decision stated clearly
- [ ] 2-3 options listed
- [ ] Pros/cons for each
- [ ] Risks identified
- [ ] Reversibility noted
- [ ] Comparison table
- [ ] Recommendation with reasoning
- [ ] User approval