---
name: issue-creation
description: "Create high-quality GitHub issues: clear repro, expected vs actual, context."
metadata:
  trigger: "issue, bug report, file issue, GitHub issue, 问题报告, 提 issue"
  origin: magent
  category: communication
  version: 1.0
---

# Issue Creation

A good issue gets fixed fast. A bad issue gets ignored or misunderstood.

## Issue Template

```markdown
## Summary
One sentence: what's broken.

## Environment
- OS: macOS 14.5
- Browser: Chrome 126
- App version: 1.36.3
- Date: 2026-07-23

## Steps to Reproduce
1. Run `npm install -g magent`
2. Run `magent run "hello"`
3. See error

## Expected
Should print "hello from magent"

## Actual
```
Error: spawn codex ENOENT
    at ChildProcess._handle.onexit
```

## Context
- Tried on macOS and Linux, both fail
- ~/.codex/auth.json exists with valid key

## Logs
```
[full error output]
```

## Possible Solution
(If you have ideas)

## Severity
- [ ] Blocker
- [ ] High
- [x] Medium
- [ ] Low
```

## What Makes a Good Issue

✅ **Good**:
- One problem per issue
- Clear repro steps
- Expected vs actual
- Environment info
- Logs / screenshots
- Severity

❌ **Bad**:
- "It doesn't work" (no detail)
- 10 different issues in one
- No repro steps
- No logs
- "URGENT!!!" (emotion > info)

## Titles

✅ Good titles:
- "codex adapter fails on Linux with ENOENT"
- "Memory search returns wrong category"
- "Pool.yml not loaded on first run"

❌ Bad titles:
- "Bug!!"
- "Help me"
- "It doesn't work"

## Labels

Use consistently:
- `bug`: something is broken
- `enhancement`: new feature request
- `docs`: documentation
- `question`: asking, not reporting
- `good first issue`: easy entry point
- `priority: high/medium/low`

## Anti-Pattern

- ❌ Reporting multiple bugs in one issue
- ❌ "Doesn't work, please fix" (no info)
- ❌ Including sensitive data (API keys, passwords)
- ❌ Bumping with "+1" or "any update?"
- ❌ Filing duplicate issues without searching first

## Checklist

- [ ] Searched for existing issues
- [ ] One issue, one problem
- [ ] Clear title
- [ ] Repro steps
- [ ] Expected vs actual
- [ ] Environment info
- [ ] Logs attached
- [ ] Labels applied
- [ ] Severity noted