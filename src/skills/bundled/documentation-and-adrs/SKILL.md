---
name: documentation-and-adrs
description: "Record significant decisions with Architecture Decision Records (ADRs). Document the why, not just the what."
metadata:
  trigger: "ADR, decision record, architecture decision, 决策记录, 文档化决策"
  origin: agent-skills
  category: communication
  version: 1.0
---

# Documentation & ADRs

Code shows *what* you did. Docs explain *why*.

## When to Document

✅ Always:
- Architecture decisions (why this tech?)
- Non-obvious code ("clever" parts need explanation)
- Onboarding ("how do I run this?")
- API contracts

⚠️ When needed:
- Complex algorithms
- Edge cases / gotchas
- Performance considerations

❌ Don't document:
- Obvious code (what `i++` does)
- Outdated info (worse than no docs)
- Implementation details that change

## ADR (Architecture Decision Records)

A short document capturing:
- **Context**: What was the situation?
- **Decision**: What did we choose?
- **Consequences**: What are the trade-offs?

### Template

```markdown
# ADR-NNN: [Decision Title]

## Status
Proposed / Accepted / Deprecated / Superseded

## Context
What problem were we facing? What constraints?

## Decision
What did we choose?

## Consequences
What becomes easier? What becomes harder?
What did we give up?

## Alternatives Considered
- Option B: ...
- Option C: ...
```

### Example

```markdown
# ADR-001: Use SQLite for primary database

## Status
Accepted, 2026-07-23

## Context
We're building a CLI tool. Users run it locally on their machines.
Options were SQLite, JSON files, or PostgreSQL.

## Decision
Use SQLite (better-sqlite3) with FTS5 for full-text search.

## Consequences
+ Zero config for users
+ Powerful querying
+ Single-file backups
- Harder to scale beyond single-machine
- Need to handle FTS5 triggers for index maintenance

## Alternatives Considered
- JSON files: too slow for large datasets
- PostgreSQL: too heavy for local CLI
```

## Anti-Pattern

- ❌ Docs that lie (out of date)
- ❌ Docs that describe implementation (not behavior)
- ❌ "TODO: document this" (never done)
- ❌ Docs in code comments only (not searchable)
- ❌ Docs for obvious code

## Checklist

- [ ] Context explains why
- [ ] Decision is specific
- [ ] Consequences are honest (both pros/cons)
- [ ] Alternatives were considered
- [ ] Status is up to date
- [ ] Linked from related code/docs