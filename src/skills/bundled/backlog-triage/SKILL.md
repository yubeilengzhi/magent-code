---
name: backlog-triage
description: "Sort and prioritize backlog: identify quick wins, blockers, dependencies."
metadata:
  trigger: "triage, prioritize, backlog, sort issues, 优先级, 排序, 待办事项"
  origin: magent
  category: project
  version: 1.0
---

# Backlog Triage

A backlog without triage is a TODO list. With triage, it's a plan.

## When to Triage

- Weekly review
- Before sprint planning
- After major release
- When backlog grows > 50 items

## Triage Process

1. **Review all open issues** (or last 30 days of work)
2. **Categorize each**:
   - **Bug**: something broken
   - **Feature**: new functionality
   - **Tech debt**: code quality / maintenance
   - **Docs**: documentation
   - **Question**: needs investigation
3. **Prioritize**:
   - **P0**: Blocker, do now
   - **P1**: Important, this sprint
   - **P2**: Nice to have, next sprint
   - **P3**: Backlog
   - **P4**: Won't fix / close
4. **Identify quick wins** (< 1 day, high impact)
5. **Identify blockers** (work depends on this)
6. **Close stale issues** (no activity > 6 months)

## Quick Wins

A quick win is:
- Small (< 1 day)
- High impact
- Low risk
- Visible

Examples:
- Fix typo in error message
- Update deprecated dependency
- Add tests for critical function
- Improve CLI help text

## Blockers

A blocker prevents other work:
- Foundation (everyone needs this)
- Critical bug (users affected)
- Security issue
- External dependency (waiting on someone else)

## Anti-Pattern

- ❌ "I'll get to it eventually" (no real prioritization)
- ❌ Everything is P1 (no distinction)
- ❌ Quick wins accumulate as tech debt
- ❌ Blockers never get unblocked
- ❌ Old issues never get closed

## Output Format

```markdown
# Backlog Triage: [Date]

## P0 (Do now)
- #123 Login broken on Safari
- #456 Payment fails on slow networks

## P1 (This sprint)
- #789 Add dark mode
- #234 Improve error messages

## P2 (Next sprint)
- ...

## Quick Wins (< 1 day)
- Fix #111 typo
- Update #222 dependency
- Add tests for #333

## Blockers (waiting on someone)
- #444 Need API access (waiting on Platform team)

## Stale (consider closing)
- #555 Last activity 2025 (over 1 year)
- #666 Will not implement

## Created This Triage
- 3 quick wins identified
- 5 stale issues to close
- 2 newly prioritized
```

## Checklist

- [ ] All open issues reviewed
- [ ] Each categorized
- [ ] Each prioritized (P0-P4)
- [ ] Quick wins identified
- [ ] Blockers identified
- [ ] Stale issues marked for closure
- [ ] Stakeholders informed