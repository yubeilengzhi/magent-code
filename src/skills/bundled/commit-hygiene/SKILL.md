---
name: commit-hygiene
description: "Write good commits: atomic, descriptive, conventional format. Make git log useful."
metadata:
  trigger: "commit, git commit, commit message, commit 规范, 提交"
  origin: magent
  category: workflow
  version: 1.0
---

# Commit Hygiene

Your git log should tell the story of your project. Bad commits make it impossible to find, revert, or understand.

## Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build, deps, tooling

### Examples

```
feat(auth): add OAuth2 login

Implements /api/auth/login with Google and GitHub providers.
Uses PKCE flow for security. Adds rate limiting (100 req/min).

Closes #123
```

```
fix: handle null user in profile endpoint

Previously crashed when accessing /api/users/{id}/profile
if the user had been deleted but the cache hadn't expired.

Fixes #456
```

## Atomic Commits

One commit = one logical change. Don't mix:
- ❌ "Fix bug AND add new feature AND refactor AND update docs"
- ✅ Each is a separate commit

## Subject Line Rules

- 50 chars max
- Imperative mood ("add" not "added")
- No period at end
- Capitalize first letter
- Explain *what*, not *how*

## Body

Explain:
- **Why** this change
- **What** problem it solves
- Any **trade-offs** considered
- Related issues/PRs

## Anti-Pattern

- ❌ "fix" or "update" with no context
- ❌ 50 files changed, "various fixes"
- ❌ WIP commits in main
- ❌ Mixing whitespace fixes with logic changes
- ❌ Committing secrets / credentials

## Checklist

- [ ] One logical change
- [ ] Subject < 50 chars
- [ ] Body explains why
- [ ] Type prefix correct
- [ ] Tests pass
- [ ] No secrets included