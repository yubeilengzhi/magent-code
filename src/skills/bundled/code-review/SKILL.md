---
name: code-review
description: "Review code changes for correctness, style, performance, and best practices."
metadata:
  trigger: "review, check code, audit, look at"
  origin: superpowers-zh
  category: review
  version: 1.0
---

# Code Review

Code review catches bugs before they ship and spreads knowledge across the team.

## What to Look For

### Correctness
- Does the code do what it claims?
- Edge cases handled? (null, empty, boundary, error)
- Off-by-one errors, typos, logic bugs
- Race conditions, concurrency issues

### Design
- Is the abstraction level right?
- Is the responsibility in the right place?
- Could this be simpler?
- Names: do they describe what the code actually does?

### Tests
- Are changes tested?
- Do tests cover the happy path AND edge cases?
- Are tests fast and deterministic?
- Are test names descriptive?

### Style
- Consistent with the rest of the codebase?
- Idiomatic for the language?
- Comments explain WHY, not WHAT
- No dead code, no commented-out code

### Performance
- Obvious inefficiencies?
- N+1 queries?
- Unnecessary work in hot paths?
- Memory leaks?

### Security
- Input validation?
- Auth/authz checks?
- Secrets handling?
- SQL injection / XSS / etc.?

## How to Give Feedback

✅ **Good feedback**:
- "This works, but could we extract X to make it reusable?"
- "I'm worried about thread safety here — can we add a test?"
- "Could we name this `retry_with_backoff` instead? More clear."

❌ **Bad feedback**:
- "This is wrong" (no explanation)
- "I would have done it differently" (style preference as fact)
- "Why didn't you use library X?" (without explaining why)
- Nitpicking without substance

## Anti-Pattern

- ❌ Praising without critique ("looks great!" with no analysis)
- ❌ Nitpicking style (spaces, naming) without substance
- ❌ Demanding perfect before approving
- ❌ Rejecting without offering alternative
- ❌ Reviewing without context (skim + comment)

## Checklist

- [ ] Correctness verified (read tests + code)
- [ ] Edge cases considered
- [ ] Design is appropriate
- [ ] Tests cover the change
- [ ] Style consistent with codebase
- [ ] No obvious performance issues
- [ ] No security issues
- [ ] Feedback is specific and actionable