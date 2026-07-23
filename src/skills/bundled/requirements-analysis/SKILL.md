---
name: requirements-analysis
description: "Deep analysis of requirements: identify hidden assumptions, edge cases, conflicts."
metadata:
  trigger: "requirements, analyze, what's needed, 需求分析, 分析需求, 需求"
  origin: magent
  category: planning
  version: 1.0
---

# Requirements Analysis

"What the user said" ≠ "what they actually need". Requirements analysis surfaces the gap.

## Process

1. **Capture explicit requirements** (what they said)
2. **Identify implicit requirements** (what they didn't say but assume)
3. **Find conflicts** (requirements that contradict each other)
4. **Edge cases** (what happens at boundaries)
5. **Non-functional requirements** (performance, security, etc.)

## Questions to Ask

### About the User
- Who is the actual user? (not just the requester)
- What's their context? (where, when, why)
- What's their skill level? (expert vs novice)
- What tools do they use? (constraints)

### About the Task
- What's the happy path?
- What can go wrong? (failure modes)
- What's the recovery? (rollback, retry)
- How do we know it worked? (success criteria)

### About Constraints
- Time budget?
- Performance requirements?
- Compatibility requirements?
- Regulatory requirements?

## Common Hidden Assumptions

- "Users have internet" (sometimes they don't)
- "Users speak English" (sometimes they don't)
- "Data is clean" (usually it isn't)
- "The system is always up" (it won't be)
- "Users read docs" (they don't)

## Edge Case Categories

- **Empty**: no data, no users, no items
- **Boundary**: first/last, smallest/largest
- **Invalid**: wrong format, missing fields, extra fields
- **Concurrent**: two users doing the same thing at once
- **Slow**: 100x normal load
- **Failure**: dependencies down, partial failures

## Output Format

```markdown
# Requirements: [Feature]

## Functional
- [ ] User can do X
- [ ] System responds with Y

## Non-functional
- Performance: p99 < 200ms
- Availability: 99.9%
- Security: auth required
- Compatibility: works on Chrome/Safari/Firefox latest

## Edge Cases
- Empty: [behavior]
- Boundary: [behavior]
- Invalid input: [behavior]
- Concurrent: [behavior]

## Open Questions
- What if user has multiple roles?
- What if payment fails after order is placed?

## Out of Scope
- Internationalization (later)
- Mobile app (separate project)
```

## Anti-Pattern

- ❌ Implementing without questioning requirements
- ❌ "Just build it, we'll figure out later"
- ❌ Ignoring edge cases ("users won't do that")
- ❌ Skipping non-functional requirements
- ❌ Assuming the obvious is correct

## Checklist

- [ ] Explicit requirements captured
- [ ] Implicit requirements identified
- [ ] Edge cases enumerated
- [ ] Non-functional requirements listed
- [ ] Conflicts resolved
- [ ] Open questions listed
- [ ] Out-of-scope explicit