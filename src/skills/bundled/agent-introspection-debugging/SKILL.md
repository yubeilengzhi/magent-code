---
name: agent-introspection-debugging
description: "Structured self-debugging workflow for AI agent failures. Diagnose your own behavior."
metadata:
  trigger: "agent fail, agent broken, self debug, agent 调试, 自省"
  origin: ecc
  category: debugging
  version: 1.0
---

# Agent Introspection Debugging

When an AI agent fails, the failure is usually in reasoning, not in code. Diagnose systematically.

## Common Agent Failures

### Type 1: Misunderstood Task
- **Symptom**: Output doesn't match what was asked
- **Cause**: Didn't fully understand the request
- **Fix**: Re-read the task, ask clarifying questions

### Type 2: Wrong Tool/Approach
- **Symptom**: Used a tool that doesn't fit
- **Cause**: Didn't consider alternatives
- **Fix**: Review tool selection logic

### Type 3: Hallucinated Facts
- **Symptom**: Made up APIs, libraries, syntax
- **Cause**: LLM generating plausible-sounding nonsense
- **Fix**: Verify against actual documentation

### Type 4: Lost Context
- **Symptom**: Forgot earlier decisions, repeated work
- **Cause**: Context window exceeded
- **Fix**: Use memory, summarize, reference earlier decisions

### Type 5: Premature Completion
- **Symptom**: Said "done" but didn't actually finish
- **Cause**: Skipped verification
- **Fix**: Use verification-before-completion skill

## The Process

1. **Reproduce** the failure (re-run the task)
2. **Identify the type** (which of the 5 above?)
3. **Gather evidence**:
   - What was the input?
   - What was the output?
   - What was the expected output?
   - Where did the reasoning diverge?
4. **Form hypothesis**: Which failure type?
5. **Test hypothesis**: Re-run with different approach
6. **Fix the system** (not just this one case)

## Self-Debugging Questions

Ask yourself:
- Did I fully understand the request?
- Did I check my assumptions?
- Did I verify my output?
- Did I use the right tools?
- Did I lose context?
- Am I making this too complex?

## Logging for Debugging

Add structured logs:
```ts
log('decision', {
  task: '...',
  reasoning: '...',
  toolsUsed: ['file_read', 'bash'],
  outcome: 'success' | 'failure',
})
```

## Anti-Pattern

- ❌ "It just doesn't work" (no diagnosis)
- ❌ Blaming the user
- ❌ Blaming the LLM ("temperature was high")
- ❌ Giving up after one attempt
- ❌ Same approach twice (expecting different results)

## Recovery Strategies

- **Step back**: Re-read the task
- **Simplify**: Try the simplest version first
- **Verify**: Check intermediate outputs
- **Switch approach**: Try a different tool/method
- **Ask for help**: Don't spin forever

## Checklist

- [ ] Reproduced the failure
- [ ] Identified failure type
- [ ] Gathered evidence
- [ ] Formed hypothesis
- [ ] Tested hypothesis
- [ ] Fixed the system (not just this case)
- [ ] Added logging to prevent recurrence