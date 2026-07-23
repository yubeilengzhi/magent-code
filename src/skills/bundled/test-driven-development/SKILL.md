---
name: test-driven-development
description: "Test-driven development: write a failing test first, then implement to make it pass."
metadata:
  trigger: "test, TDD, write test first, unit test, integration test, 测试, 写测试, 单元测试, TDD测试, red green refactor, testing first, 测一下, 加测试"
  origin: superpowers
  category: testing
  version: 1.0
---

<HARD-GATE>
Do NOT write implementation code before writing a failing test.
</HARD-GATE>

# Test-Driven Development

TDD forces you to think about the API and behavior before implementation.

## Cycle (Red-Green-Refactor)

1. **Red**: Write a test for the desired behavior
2. **Confirm failure**: Run it, verify it fails for the *expected* reason (not syntax error)
3. **Green**: Write the *minimum* code to make it pass
4. **Confirm pass**: Run it, verify it passes
5. **Refactor**: Clean up, keeping tests green
6. Repeat

## Writing Good Tests

- Test behavior, not implementation
- One assertion per test (usually)
- Use descriptive names: "should X when Y"
- Arrange-Act-Assert structure
- Test edge cases: null, empty, boundary, error

## When to Use TDD

✅ Use:
- Business logic with clear inputs/outputs
- Bug fixes (write test that reproduces, then fix)
- API contracts

⚠️ Less useful:
- UI layout code
- Throwaway scripts
- Pure infrastructure (e.g., config files)

## Anti-Pattern

- ❌ Writing tests *after* code (loses the design benefit)
- ❌ Testing implementation details (breaks refactoring)
- ❌ Tests that don't actually run the code
- ❌ Mocking everything (tests become trivial)
- ❌ Skipping the "confirm failure" step

## Checklist

- [ ] Test written first
- [ ] Test confirmed failing for expected reason
- [ ] Minimal implementation written
- [ ] Test passes
- [ ] No extra code beyond what's needed
- [ ] Refactored while keeping tests green
- [ ] Edge cases covered