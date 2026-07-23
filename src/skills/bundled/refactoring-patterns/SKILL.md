---
name: refactoring-patterns
description: "Refactor safely: tests first, small steps, behavior preservation. Common patterns explained."
metadata:
  trigger: "refactor, restructure, clean code, 重构, 整理代码, 代码优化"
  origin: magent
  category: engineering
  version: 1.0
---

<HARD-GATE>
Do NOT refactor without test coverage of the existing behavior first.
</HARD-GATE>

# Refactoring Patterns

Refactoring = changing structure without changing behavior. The tests are your safety net.

## The Process

1. **Have tests** that pass
2. **Identify smell** (duplication, long method, etc.)
3. **Apply one pattern** (small change)
4. **Run tests** after each change
5. **Commit after green**

## Common Patterns (Fowler's Catalog)

### Extract Method
Long method? Pull out a chunk into a well-named helper.
```ts
// Before
function processOrder(order) {
  // 30 lines of validation, calculation, persistence...
}

// After
function processOrder(order) {
  validate(order);
  const total = calculateTotal(order);
  return persist(order, total);
}
```

### Inline Method
Helper that's only used once and obvious? Inline it.

### Rename
Bad name? Rename. Update all callers. (IDE can do this safely.)

### Extract Variable
Long expression? Give it a name.
```ts
// Before
return user.hasRole('admin') && !user.disabled && order.total > 100;

// After
const canRefund = user.hasRole('admin') && !user.disabled && order.total > 100;
return canRefund;
```

### Move Method
Method uses another class more than its own? Move it.

### Replace Conditional with Polymorphism
Type checks everywhere? Make subclasses.

### Introduce Parameter Object
3+ parameters often passed together? Group them.

### Replace Magic Number with Constant
`if (status === 3)` → `if (status === STATUS_APPROVED)`

## When to Refactor

✅ Right time:
- Adding a feature (the code resists)
- Fixing a bug (the code is hard to understand)
- During code review (clear improvement opportunity)

❌ Not right now:
- "Just for fun" (no clear benefit)
- Right before a release (risky)
- Without tests (dangerous)

## Anti-Pattern

- ❌ Big-bang rewrite (do it incrementally)
- ❌ Refactor + change behavior in same commit (hard to review)
- ❌ Refactor without tests (no safety net)
- ❌ "While I'm in here" (scope creep)
- ❌ Renaming for style (without team agreement)

## Checklist

- [ ] Tests pass before refactoring
- [ ] One pattern applied at a time
- [ ] Tests run after each step
- [ ] Behavior unchanged (no "improvements" mixed in)
- [ ] Commit per step (easy to review/revert)