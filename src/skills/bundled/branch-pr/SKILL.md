---
name: branch-pr
description: "Best practices for creating branches and pull requests. Small, focused, well-described."
metadata:
  trigger: "branch, PR, pull request, create branch, 分支, 拉取请求, 开 PR"
  origin: magent
  category: workflow
  version: 1.0
---

# Branch & PR Best Practices

## Branch Lifecycle

1. Create branch from main (or latest release branch)
2. Commit often in small chunks
3. Push regularly (backup + visibility)
4. Open PR early (even as draft)
5. Iterate based on review
6. Merge or close

## Branch Hygiene

- ✅ Name: `<type>/<scope>-<description>`
- ✅ Keep branches short-lived (days, not weeks)
- ✅ Rebase on main frequently
- ✅ Delete after merge

- ❌ Branches that live for months
- ❌ Mega branches that diverge heavily
- ❌ Generic names: `fix`, `update`, `wip`

## PR Description

A good PR description answers:
- **What**: What does this PR do?
- **Why**: Why is this needed?
- **How**: How does it work (high level)?
- **Testing**: How was it tested?
- **Risk**: What could break?

## PR Size

| Lines changed | Quality |
|--------------|---------|
| < 100 | ✅ Easy to review |
| 100-400 | ⚠️ OK if focused |
| 400-1000 | ⚠️ Consider splitting |
| > 1000 | ❌ Almost certainly too big |

## Review Markers (in PR comments)

- `// nit:` Minor stylistic issue
- `// question:` I don't understand, please explain
- `// blocking:` Must be addressed before merge
- `// suggestion:` Take it or leave it
- `// praise:` Nice work!

## Anti-Pattern

- ❌ "Fix bug" or "WIP" as PR title
- ❌ 50 files in one PR
- ❌ PR with no description
- ❌ Pushing force without warning
- ❌ Reviewing your own code (pair with someone)

## Checklist (Before Opening PR)

- [ ] Branch rebased on latest main
- [ ] All tests pass locally
- [ ] Linter passes
- [ ] PR description complete
- [ ] Linked to issue
- [ ] Diff size reasonable