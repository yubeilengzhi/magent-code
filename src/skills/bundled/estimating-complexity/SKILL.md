---
name: estimating-complexity
description: "Estimate effort realistically. Avoid both optimism and paralysis."
metadata:
  trigger: "estimate, how long, complexity, effort, 估算, 复杂度, 需要多久"
  origin: magent
  category: project
  version: 1.0
---

# Estimating Complexity

Estimates are always wrong. The question is: how wrong?

## Why Estimates Are Hard

- Unknown unknowns (you don't know what you don't know)
- Optimism bias (everything seems easy at first)
- Hidden complexity (edge cases, dependencies)
- Estimation is not measurement

## Techniques

### 1. Reference Class
Compare to past similar work.
- "This is like Feature X, which took 3 days"
- Adjust for differences (larger scope, more unknowns)

### 2. T-shirt Sizes
Quick estimates, not precise:
- **S**: < 1 day (a single function)
- **M**: 1-3 days (a small feature)
- **L**: 1 week (a moderate feature)
- **XL**: 2+ weeks (probably needs breaking down)

### 3. Story Points (Fibonacci)
- 1: trivial
- 2: small change
- 3: medium complexity
- 5: complex
- 8: very complex
- 13+: too big, must break down

### 4. Range Estimates
Instead of "5 days", say "3-10 days". Be honest about uncertainty.

### 5. Triangulation
Ask 3 people, average their estimates.

### 6. Planning Poker
Each person estimates privately, reveal together, discuss differences.

## When to Estimate

✅ Estimate when:
- Sprint planning
- Quoting clients
- Resource allocation
- Roadmap planning

❌ Don't estimate when:
- "I have no idea" (say so)
- High uncertainty (use ranges, not points)
- Details will change (re-estimate later)

## Common Mistakes

❌ **Optimism bias**: "2 days" → actually 2 weeks
- Fix: Multiply by 2-3x for things you've never done

❌ **Pressure to commit**: "Say 3 days so we can ship"
- Fix: Give honest range, let stakeholders decide

❌ **Confusing effort with complexity**:
- 1 day = small change
- 5 days = complex but quick
- Effort ≠ time (consider dependencies, reviews, etc.)

❌ **Not re-estimating**: Initial estimate never updates
- Fix: Re-estimate at major milestones

## Anti-Pattern

- ❌ "It'll be quick" (without analysis)
- ❌ Estimating without understanding the work
- ❌ Single-point estimates (no range)
- ❌ Padding estimates to "look safe"
- ❌ Ignoring uncertainty

## Output Format

```markdown
# Estimate: [Feature]

## Effort: M (1-3 days)
## Best case: 1 day
## Likely: 2 days
## Worst case: 5 days

## Assumptions
- Single developer
- No major unknowns discovered
- Existing test infrastructure works

## Risks
- Authentication system may need refactor (add 1-2 days)
- Edge cases in input validation (add 1 day)

## Dependencies
- Blocked by: #123 (must finish first)
```

## Checklist

- [ ] Compared to past similar work
- [ ] Range estimate (not single point)
- [ ] Listed assumptions
- [ ] Listed risks
- [ ] Listed dependencies
- [ ] Re-estimated at milestones