---
name: property-based-testing
description: "Property-based testing: define properties, let the framework generate test cases. Catches edge cases you wouldn't think of."
metadata:
  trigger: "property-based, fuzz, fast-check, hypothesis, 属性测试, 模糊测试"
  origin: magent
  category: testing
  version: 1.0
---

# Property-Based Testing

Instead of writing specific test cases, describe **properties** that should always be true. The framework generates hundreds of test cases.

## Example Tests

❌ Example-based: `assert(add(2, 3) == 5)`
✅ Property-based: "for any a, b: add(a, b) == add(b, a)" (commutativity)

## Common Properties

- **Idempotence**: `f(f(x)) == f(x)` (e.g., sort twice = sort once)
- **Commutativity**: `f(a, b) == f(b, a)` (e.g., add, union)
- **Inverse**: `decode(encode(x)) == x` (round-trip)
- **Identity**: `f(x, identity) == x`
- **Inverse functions**: `sort(reverse(x)) == reverse(sort(x))`

## When to Use

✅ Perfect for:
- Pure functions
- Data transformations
- Serializers / parsers
- Collections

⚠️ Less useful for:
- Stateful systems (use stateful testing)
- Side-effecting code

## Frameworks

- **Python**: Hypothesis
- **JavaScript/TS**: fast-check
- **Rust**: proptest
- **Haskell**: QuickCheck

## Process

1. Identify a property (mathematical invariant)
2. Write the generator (random valid inputs)
3. Write the assertion (property holds)
4. Run the framework (generates 100s of cases)
5. If a counterexample is found, **shrink** it (find minimal failing case)
6. Fix the bug, add the case to your test suite

## Anti-Pattern

- ❌ Using example-based thinking (just bigger fuzz)
- ❌ Testing properties that don't actually test what matters
- ❌ Ignoring the shrunk counterexample (the bug!)
- ❌ Overly restrictive generators (test nothing interesting)

## Checklist

- [ ] Property is a real invariant (not just a behavior)
- [ ] Generator covers edge cases (empty, large, boundary)
- [ ] Found bugs? Add to regression tests
- [ ] Property holds across 100+ generated cases