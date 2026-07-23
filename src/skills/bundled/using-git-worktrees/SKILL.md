---
name: using-git-worktrees
description: "Use git worktrees to isolate work, run multiple branches in parallel, keep main clean."
metadata:
  trigger: "worktree, parallel, isolate, branch, switch"
  origin: superpowers
  category: workflow
  version: 1.0
---

# Using Git Worktrees

Git worktrees let you have multiple working directories from one repo, each on a different branch.

## Why

- Run multiple agents on the same repo, different branches, simultaneously
- Keep main directory clean while you experiment
- Easy to discard work (just `rm -rf` the worktree)
- No `git stash`/unstash gymnastics

## Common Pattern

```bash
# Main worktree: ~/code/project (on main)
# New worktree for feature:
git worktree add ../project-feature-x -b feature/x
cd ../project-feature-x
# ... do work, commit, push ...

# Run another agent on different branch:
git worktree add ../project-bug-fix -b fix/bug-123
cd ../project-bug-fix
# ... another agent works here ...

# When done:
git worktree remove ../project-feature-x
git branch -d feature/x
```

## Conventions

- Name worktrees by branch: `../{repo}-{branch-slug}`
- Always create a new branch for each worktree
- Clean up worktrees when feature is merged
- Don't share build artifacts between worktrees (use shared `node_modules` only if safe)

## With AI Agents

When running multiple agents:
- Give each agent its own worktree
- They work in parallel without conflict
- Easier to merge or discard

## Anti-Pattern

- ❌ Working in main directory directly for everything
- ❌ `git stash` + `git stash pop` (use worktree instead)
- ❌ Forgetting to clean up worktrees (leaves clutter)
- ❌ Sharing worktrees between agents (conflicts)

## Checklist

- [ ] Each new feature gets its own worktree
- [ ] New branch created (not on main)
- [ ] Worktree named after the branch
- [ ] Work committed and pushed before removing
- [ ] Worktree removed after merge