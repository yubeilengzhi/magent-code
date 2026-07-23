---
name: test-design
description: "Design effective test cases: cover behavior, edge cases, failure modes."
metadata:
  trigger: "test design, design tests, what to test, 测试设计, 设计测试"
  origin: magent
  category: testing
  version: 1.0
---

# Test Design

A good test fails when the code is wrong, and only then. A great test catches bugs.

## What to Test

### Behavior, Not Implementation
- ✅ "When user clicks Save, the data is persisted"
- ❌ "When user clicks Save, the internal state object has property X set to Y"

Tests that depend on implementation break when you refactor.

### Boundaries
- Empty input
- One item
- Many items (max)
- Zero / null / undefined
- Negative numbers
- Very large numbers
- Special characters

### Failure Modes
- Network failure
- Disk full
- Permission denied
- Invalid input
- Race conditions

### Equivalence Classes
Group inputs that should produce the same output. Test one from each class.

Example: For "valid email":
- ✅ name@domain.com
- ❌ a@b (no TLD)
- ❌ @domain.com (no local)
- ❌ name@.com (TLD starts with dot)

## Test Naming

```ts
describe('UserService.createUser', () => {
  it('creates user when email is valid', ...)
  it('throws when email is invalid', ...)
  it('returns existing user when email already exists', ...)
  it('handles concurrent creation with same email', ...)
})
```

Names should describe behavior, not implementation.

## Test Structure (AAA)

```ts
it('does X', () => {
  // Arrange (setup)
  const input = ...

  // Act (execute)
  const result = system.doSomething(input)

  // Assert (verify)
  expect(result).toBe(...)
})
```

## Test Pyramid

```
        /\
       /  \      E2E (few, slow, brittle)
      /----\
     /      \    Integration (some, medium)
    /--------\
   /          \  Unit (many, fast, isolated)
  /------------\
```

- **Many** unit tests (fast, isolated)
- **Some** integration tests (medium speed)
- **Few** E2E tests (slow, brittle)

## What NOT to Test

- Implementation details (breaks on refactor)
- Third-party code (they have tests)
- Trivial code (e.g., getters/setters)
- Generated code

## Coverage Goals

- 80%+ for business logic
- 100% for critical paths (auth, payments)
- Don't game the metric (covered ≠ tested)

## Anti-Pattern

- ❌ Testing implementation, not behavior
- ❌ Tests that depend on each other
- ❌ Tests with no assertions
- ❌ Tests that mock everything (testing mocks, not code)
- ❌ Skipping edge cases ("it should work")
- ❌ One assertion per test (debate, but usually good)

## Checklist

- [ ] Tests behavior, not implementation
- [ ] Edge cases covered
- [ ] Failure modes covered
- [ ] Tests are independent
- [ ] AAA structure
- [ ] Clear test names
- [ ] Good coverage of critical paths