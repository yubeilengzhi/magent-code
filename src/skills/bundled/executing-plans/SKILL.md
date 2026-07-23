---
name: executing-plans
description: "Execute a written plan faithfully. Don't improvise mid-execution. Verify each step."
metadata:
  trigger: "execute, run plan, follow plan, 执行计划, 跑计划"
  origin: superpowers
  category: engineering
  version: 1.0
---

<HARD-GATE>
Do NOT deviate from a written plan without explicit user approval.
</HARD-GATE>

# Executing Plans

You have a written plan. Now execute it without improvising.

## The Process

1. **Re-read the plan** before starting
2. **Verify prerequisites** (dependencies installed, branch checked out, etc.)
3. **Execute step 1** (only)
4. **Verify** step 1's output
5. **Commit** if green
6. **Repeat** for each step

If you discover the plan needs to change:

🛑 **Stop and ask the user** before deviating.

The user wrote (or approved) the plan. Don't second-guess it mid-execution.

## Verification Between Steps

After each step:
- [ ] Tests still pass
- [ ] No new warnings
- [ ] Output matches expected
- [ ] Commit before next step

## When to Stop and Ask

🛑 Stop and ask if:
- A step doesn't produce the expected output
- You discover a hidden assumption
- You realize a step is wrong
- You want to combine steps (might be OK, but ask)

Don't just "fix it" — the user should know.

## Anti-Pattern

- ❌ Improvising because "I know better"
- ❌ Combining steps without asking
- ❌ Skipping verification
- ❌ Making huge commits (one per step)
- ❌ Not testing between steps (debugging is harder)

## Checklist

- [ ] Plan read and understood
- [ ] Prerequisites verified
- [ ] Step executed as written
- [ ] Output verified
- [ ] Committed before next step
- [ ] All verification gates passed