---
name: requesting-code-review
description: "Proactively ask for code review at the right time. Make it easy for reviewers."
metadata:
  trigger: "request review, ask review, need feedback, 请审查, 需要反馈"
  origin: superpowers
  category: review
  version: 1.0
---

# Requesting Code Review

Don't wait for someone to notice. Ask for review early and often.

## When to Ask

✅ Ask when:
- Implementation is complete
- You're stuck (not sure if approach is right)
- Before merging to main
- Significant design decisions

❌ Don't ask when:
- Code is half-done (wastes reviewer's time)
- You haven't self-reviewed first
- Trivial changes (typo fixes)

## Before Asking: Self-Review

Always review your own code first:
1. Re-read your PR diff
2. Check: does it do what I claim?
3. Check: edge cases handled?
4. Check: tests cover the change?
5. Check: no debug logs, no secrets?

This shows respect for the reviewer's time.

## How to Ask

### Good PR description
```markdown
## What
Implements OAuth login (Google + GitHub providers)

## Why
Required for user feature request #123. Needed before launch.

## How
Uses PKCE flow. Tokens stored in DB with rotation.
See ADR-005 for design decisions.

## Testing
- [x] Unit tests for OAuth client
- [x] Integration test with mock provider
- [x] Manual test with Google
- [ ] Manual test with GitHub (need to set up dev account)

## Risk
Low. Token storage is encrypted. Existing auth not affected.
```

### How to Ask a Person
- Be specific about what you want reviewed
- Suggest focus areas
- Be available for questions

❌ "Can someone review this?"
✅ "I focused the design on simplicity. Could you check the error handling in `auth/token.ts`?"

## Anti-Pattern

- ❌ Asking for review with WIP / failing tests
- ❌ "Drive-by" review requests (no context)
- ❌ Asking the same person repeatedly (spread the load)
- ❌ Reviewing your own code only
- ❌ Huge PR (reviewer will skim)

## Checklist

- [ ] Code is complete (not WIP)
- [ ] Self-reviewed
- [ ] Tests pass
- [ ] PR description complete
- [ ] Diff size reasonable
- [ ] Specific request to reviewer