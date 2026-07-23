---
name: regression-investigation
description: "When a previously-working feature breaks, find what changed and why."
metadata:
  trigger: "regression, broken, used to work, 回归, 之前能跑, 不工作了"
  origin: magent
  category: debugging
  version: 1.0
---

# Regression Investigation

"It used to work, now it doesn't." Find what changed.

## The Process

### 1. Confirm It's a Regression

- Did it ever work? (yes, then it's a regression)
- When did it last work?
- When did it start failing?

### 2. Bisect (git bisect)

Find the exact commit that introduced the bug:

```bash
git bisect start
git bisect bad                  # current is broken
git bisect good <last-working-commit>
# git checks out middle commit
# test, mark good or bad
git bisect good  # or bad
git bisect reset
```

### 3. What Changed?

In the offending commit:
- What files changed?
- What was the intent?
- Could this change break the reported behavior?

### 4. Why Did Tests Miss It?

- Did tests exist for this code path?
- Did they cover this scenario?
- Were they disabled? Skipped?

### 5. Fix and Add Regression Test

- Fix the bug
- Add a test that reproduces it (would have caught this)
- Verify the test fails before the fix, passes after

## Common Causes

- **Dependency upgrade**: Library behavior changed
- **Data change**: Input data is different now
- **Config change**: New env var, new default
- **Code change**: Someone edited nearby code
- **Environment change**: New OS, new runtime version
- **State change**: Database schema, cache, etc.

## Tools

### git bisect
```bash
git bisect start HEAD <good-sha>
```

### diff
```bash
git diff <good>..<bad> -- path/to/file
```

### blame
```bash
git blame path/to/file  # who changed what line
```

## Anti-Pattern

- ❌ "I don't know what changed, let me just rewrite"
- ❌ Bisecting without a clear repro
- ❌ Fixing without understanding why it worked before
- ❌ Adding a test that doesn't actually exercise the bug

## Checklist

- [ ] Reproduced the regression
- [ ] Found the commit that introduced it (git bisect)
- [ ] Understood *why* it worked before
- [ ] Fixed the root cause
- [ ] Added a regression test
- [ ] Test fails without the fix
- [ ] Test passes with the fix