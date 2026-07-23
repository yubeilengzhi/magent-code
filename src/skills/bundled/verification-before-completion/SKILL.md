---
name: verification-before-completion
description: "Always verify your work actually works before declaring it done. Don't assume, demonstrate."
metadata:
  trigger: "verify, check, done, complete, finished, 验证, 完成, 检查, confirm, prove, demonstrate, evidence, 真的能跑吗, 测试过了吗, 跑通了, 验证一下, 完工"
  origin: superpowers
  category: testing
  version: 1.0
---

<HARD-GATE>
Never declare work "done" without showing evidence it actually works.
</HARD-GATE>

# Verification Before Completion

The #1 cause of bugs in code: the author *thought* it worked but didn't actually verify.

## The Standard

Before saying "done", you must demonstrate:
1. **Code runs**: No syntax errors, imports work
2. **Tests pass**: Run them, show output
3. **User-visible behavior works**: Actually exercise the feature
4. **Edge cases handled**: Try the failure modes

## What "Done" Means

❌ "I added the function" — not done
✅ "The function exists at src/foo.ts:42 and returns 'hello' when called with 'world'" — done

❌ "Tests should pass" — not done
✅ "Ran `npm test`, all 47 tests passed" — done

❌ "I think this fixes the bug" — not done
✅ "Ran the failing case, output is now correct" — done

## How to Verify

1. **Run the code**: don't just read it
2. **Capture the output**: copy/paste or screenshot
3. **Test edge cases**: empty input, null, very large, special characters
4. **Compare against expectations**: does output match what user asked for?

## Common Failures

- ❌ "Looks correct to me" (didn't run it)
- ❌ "I ran similar code before" (not THIS code)
- ❌ Skipping verification because "it should work"
- ❌ Reporting partial verification as full success

## Checklist

- [ ] Code actually runs without errors
- [ ] Tests executed and output captured
- [ ] User-visible behavior verified end-to-end
- [ ] Edge cases tried (empty, null, boundary)
- [ ] Output matches the expected result
- [ ] No "should work" assumptions