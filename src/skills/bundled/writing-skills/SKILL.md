---
name: writing-skills
description: "How to write good SKILL.md files. Structure, content, examples."
metadata:
  trigger: "write skill, new skill, SKILL.md, 写 skill, 创建 skill"
  origin: superpowers
  category: communication
  version: 1.0
---

# Writing Skills

A good skill is short, focused, and actionable. Bad skills are vague essays.

## Structure

```markdown
---
name: skill-name
description: "When to use this skill. One sentence."
metadata:
  trigger: "comma, separated, keywords, that, trigger, this, skill"
  origin: where this idea came from
  category: communication
  version: 1.0
---

<HARD-GATE>  (optional - if there's a critical rule)
The most important rule that must not be violated.
</HARD-GATE>

# Skill Title

Short intro paragraph (1-2 sentences).

## Process

The steps to follow. Numbered list.

## Anti-Pattern

Things NOT to do.

## Checklist

- [ ] Verifiable items

## Optional sections

- Examples
- Templates
- Related skills
- References
```

## What Makes a Good Skill

✅ **Good**:
- Specific trigger keywords (helps auto-match)
- Concrete process (steps, not principles)
- Anti-pattern section (what NOT to do)
- Checklist (verifiable)
- One focused topic

❌ **Bad**:
- Vague ("be a good developer")
- Too long (essay instead of skill)
- Multiple unrelated topics
- No trigger keywords
- All theory, no action

## Trigger Keywords

- 10-15 keywords is good
- Mix of English and Chinese (if for Chinese users)
- Include synonyms and variations
- Include user phrasing they might use
- Test by trying: would this skill fire on this user query?

Example for `systematic-debugging`:
```
trigger: "debug, fix, broken, error, bug, not working, 调试, 修复, 出错, 报错, crash, 排查, 哪里出问题了"
```

## HARD-GATE Use

Use HARD-GATE for rules that:
- Are frequently violated
- Cause serious problems when violated
- Are unambiguous

Example: "Do NOT write implementation code before writing a failing test."

Don't use for general best practices. They're too restrictive.

## Length

- Target: 50-200 lines
- Over 300 lines? Probably should be split
- Under 30 lines? Probably needs more detail

## Naming

- Use kebab-case: `test-driven-development` not `tdd` or `TestDrivenDevelopment`
- Be descriptive but concise
- Include the technique: `refactoring-patterns` not `patterns`

## Anti-Pattern

- ❌ Skill that's just a list of platitudes
- ❌ Skill with no actionable steps
- ❌ Skill that duplicates another skill
- ❌ Skill that's all theory, no practice
- ❌ Skill with broken examples

## Checklist

- [ ] Has clear trigger keywords
- [ ] One focused topic
- [ ] Concrete process steps
- [ ] Anti-pattern section
- [ ] Verifiable checklist
- [ ] 50-200 lines
- [ ] Examples are correct
- [ ] Origin credited