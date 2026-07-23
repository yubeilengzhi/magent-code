---
name: systematic-debugging
description: "Debug systematically - don't guess, form hypotheses, gather evidence, isolate the cause."
metadata:
  trigger: "debug, fix, broken, error, bug, not working"
  origin: superpowers
  category: debugging
  version: 1.0
---

<HARD-GATE>
Do NOT make speculative code changes. Find the root cause FIRST.
</HARD-GATE>

# Systematic Debugging

Stop. Don't guess. Debug like a scientist.

## The Process

### 1. Reproduce

- Can you make the bug happen reliably?
- What's the minimal reproduction?
- If you can't reproduce it, you can't fix it.

### 2. Gather Evidence

Before changing code, collect:
- Error messages (full stack trace, not just last line)
- Logs around the failure
- Input that triggers it
- State of the system (env vars, configs, DB)
- Recent changes (git log, recent commits)

### 3. Form Hypotheses

List 2-3 possible causes, ranked by likelihood.

### 4. Test Each Hypothesis

For each hypothesis:
- What evidence would confirm/refute it?
- How can I check WITHOUT changing production code?
- Use: logging, debugger, print statements, isolated test

### 5. Fix Root Cause

- Apply the minimum change that fixes the root cause
- Don't fix symptoms, fix causes
- Don't add unrelated cleanup "while you're in there"

### 6. Verify Fix

- Original reproduction case now works?
- No regressions?
- Add a test that would have caught this

## Common Anti-Patterns

- ❌ "Let me just try changing X" (random mutation)
- ❌ Adding try/catch to swallow the error (hides problem)
- ❌ Restart and see if it goes away (denial)
- ❌ "It works on my machine" (irrelevant)
- ❌ Multiple changes at once (can't tell which helped)
- ❌ Fixing without understanding

## Checklist

- [ ] Bug reliably reproduced
- [ ] Full error info collected (logs, stack trace, inputs)
- [ ] Hypotheses listed and ranked
- [ ] Each hypothesis tested with evidence
- [ ] Root cause identified (not just symptom)
- [ ] Minimal fix applied
- [ ] Test added to prevent regression
- [ ] No other behavior broken