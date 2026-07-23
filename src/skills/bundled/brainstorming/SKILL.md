---
name: brainstorming
description: "Use this skill before any creative work to explore ideas and design before implementing."
metadata:
  trigger: "brainstorm, brainstorm设计, 设计, 想法, 方案, 创意, 头脑风暴, 多方案, compare options, explore, propose approach"
  origin: superpowers
  category: planning
  version: 1.0
---

<HARD-GATE>
Do NOT invoke any implementation skill until you have presented a design and received user approval.
</HARD-GATE>

# Brainstorming Ideas Into Designs

When starting creative work, never jump straight to code. Brainstorm first.

## Process

1. **Understand the problem**
   - What is the user actually trying to accomplish?
   - What are the constraints (time, tech stack, team skills)?
   - What are the non-goals?

2. **Explore the solution space**
   - Generate at least 2-3 different approaches
   - Consider: simplicity vs flexibility, build vs buy, incremental vs big-bang
   - Look at how similar problems are solved elsewhere

3. **Compare trade-offs**
   - For each option: pros, cons, risks, reversibility
   - What does the user gain/lose by picking each option?
   - Which option best fits the constraints?

4. **Present the design**
   - Lead with your recommendation and reasoning
   - Show the alternatives you considered
   - Highlight key trade-offs the user should weigh in on
   - Wait for approval before implementing

## Anti-Pattern

- ❌ Jumping straight to code without exploring
- ❌ Asking "what do you want?" without offering options
- ❌ Implementing the first idea without comparison
- ❌ Designing without understanding constraints
- ❌ Presenting only one option (looks like bias)

## Checklist

- [ ] Problem clearly understood
- [ ] Constraints identified
- [ ] 2-3 different approaches considered
- [ ] Trade-offs explicitly compared
- [ ] Recommendation presented with reasoning
- [ ] User approval received before implementation