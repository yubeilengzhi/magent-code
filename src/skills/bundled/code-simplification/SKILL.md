---
name: code-simplification
description: "Simplify code: reduce complexity, remove duplication, improve readability."
metadata:
  trigger: "simplify, clean up, complexity, 简化, 清理, 复杂度"
  origin: agent-skills
  category: review
  version: 1.0
---

# Code Simplification

Every line of code is a liability. Less code = fewer bugs.

## When to Simplify

✅ Simplify when:
- Adding a feature (the code resists)
- Fixing a bug (the code is hard to follow)
- During review (clear opportunity)
- After learning (you know better now)

❌ Don't simplify:
- Right before a release (risky)
- Without tests (no safety net)
- For style alone (subjective)

## Common Smells

### 1. Duplicated Code
Same logic in multiple places? Extract to a function.

```ts
// ❌ Bad
function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
function validateEmailStrict(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) && email.length < 100
}

// ✅ Good
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isValidEmail(email: string) {
  return EMAIL_RE.test(email)
}
```

### 2. Long Methods (>30 lines)
Extract helpers. Each helper does one thing.

### 3. Deep Nesting (>3 levels)
Use early returns (guard clauses).

```ts
// ❌ Bad
function process(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        // ... 5 levels deep
      }
    }
  }
}

// ✅ Good
function process(order) {
  if (!order?.items?.length) return
  // ... flat
}
```

### 4. Magic Numbers/Strings
`if (status === 3)` → `if (status === STATUS_APPROVED)`

### 5. Commented-Out Code
Delete it. Git remembers.

### 6. Dead Code
Unused functions? Delete. Unused imports? Delete.

### 7. Over-Engineering
"You aren't gonna need it" (YAGNI).
Build what you need now, not what you might need later.

## How to Simplify Safely

1. **Have tests** (they catch regressions)
2. **One change at a time**
3. **Run tests after each**
4. **Commit per change**

## Anti-Pattern

- ❌ "Let me just rewrite this" (without tests)
- ❌ Refactor + new feature in same PR (hard to review)
- ❌ Renaming for "aesthetics" (without team agreement)
- ❌ Removing code "to simplify" (when it's actually used)
- ❌ Adding indirection "for flexibility" (premature abstraction)

## Checklist

- [ ] Tests pass before simplifying
- [ ] One change at a time
- [ ] Tests pass after each change
- [ ] Each change is a separate commit
- [ ] Diff is reviewable
- [ ] No behavior changes (only structure)