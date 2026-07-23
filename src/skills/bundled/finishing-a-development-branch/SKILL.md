---
name: finishing-a-development-branch
description: "Complete the branch lifecycle: merge, clean up, archive context."
metadata:
  trigger: "finish branch, complete branch, merge branch, 结束分支, 完成分支, 合并"
  origin: superpowers
  category: workflow
  version: 1.0
---

# Finishing a Development Branch

When your work is done, don't just leave the branch. Close the loop properly.

## Steps

1. **Verify all tests pass** in the branch
2. **Update CHANGELOG / version** if needed
3. **Open PR** (if not already open)
4. **Get review approval**
5. **Merge** (squash, merge, or rebase based on team conventions)
6. **Delete remote branch** (e.g., on GitHub)
7. **Delete local branch** (`git branch -d`)
8. **Remove worktree** if used
9. **Update status** (close related issues)

## Merge Strategies

| Strategy | Use when |
|----------|----------|
| **Squash merge** | Feature branch (clean linear history) |
| **Merge commit** | Multi-person branch (preserve history) |
| **Rebase + merge** | Personal branch (linear history) |

## Anti-Pattern

- ❌ Branch lives for months (merge conflicts galore)
- ❌ Force-push after others have reviewed
- ❌ Delete branch without merge (lose work)
- ❌ Skip review for "small" changes
- ❌ Force-merge because CI is annoying

## Checklist

- [ ] All tests pass
- [ ] PR reviewed and approved
- [ ] Merged to main
- [ ] Remote branch deleted
- [ ] Local branch deleted
- [ ] Worktree removed
- [ ] Issues closed
- [ ] Team notified (if relevant)