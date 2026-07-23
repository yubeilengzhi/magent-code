---
name: santa-method
description: "Multi-agent adversarial verification. Generator + Evaluator converge on truth."
metadata:
  trigger: "santa, adversarial, multi-agent verify, 多 agent 验证, 对抗"
  origin: ecc
  category: testing
  version: 1.0
---

# Santa Method

Two AI agents working adversarially: one generates, one evaluates. They converge on correctness.

## The Pattern

```
Generator (G) → proposes solution
       ↓
Evaluator (E) → critiques solution
       ↓
G refines based on E's feedback
       ↓
E re-evaluates
       ↓
Loop until both agree (or max iterations)
```

## When to Use

✅ Use:
- Critical correctness (auth, payments, security)
- Complex algorithms
- Code where bugs are expensive
- Multiple valid approaches exist

⚠️ Skip when:
- Simple, well-understood code
- Time pressure
- One obvious right answer

## Implementation

```ts
async function santaMethod(task: string, maxIter = 5) {
  let solution = await generator.propose(task)
  
  for (let i = 0; i < maxIter; i++) {
    const critique = await evaluator.critique(task, solution)
    
    if (critique.approved) {
      return solution  // Both agree
    }
    
    solution = await generator.refine(task, solution, critique.feedback)
  }
  
  // Max iterations reached, return best
  return solution
}
```

## Generator's Role

- Propose initial solution
- Take feedback seriously
- Refine based on critique
- Explain reasoning

## Evaluator's Role

- **Be skeptical**: Assume the solution has bugs
- **Find issues**: Edge cases, error handling, performance
- **Be specific**: "Line 42 doesn't handle null"
- **Suggest fixes**: "Add null check: if (!x) return"

## Anti-Pattern

- ❌ Generator defending instead of improving
- ❌ Evaluator rubber-stamping
- ❌ Both agents converging on low-quality solution (groupthink)
- ❌ Too many iterations (loop forever)
- ❌ Evaluator adding requirements (scope creep)

## Configuration

| Parameter | Value | Why |
|-----------|-------|-----|
| maxIter | 3-5 | Enough for convergence, not infinite |
| evaluatorModel | smarter than generator | More critical thinking |
| stopCondition | Both agree | Avoid loop |

## Real-World Examples

- **Code review**: human = generator, automated tool = evaluator
- **Testing**: product spec = evaluator, implementation = generator
- **Documentation**: user needs = evaluator, writer = generator

## Anti-Pattern

- ❌ "Groupthink" (both agents think alike)
- ❌ No convergence criteria
- ❌ Evaluator proposes solutions (mixing roles)
- ❌ Generator ignores feedback

## Checklist

- [ ] Clear task
- [ ] Both agents have distinct roles
- [ ] Convergence criteria defined
- [ ] Max iterations set
- [ ] Feedback is actionable
- [ ] Final solution approved