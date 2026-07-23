---
name: receiving-code-review
description: "How to receive code review feedback well - stay curious, separate ego from code, find the underlying concern."
metadata:
  trigger: "review feedback, comment, suggestion, criticism, 反馈, 评论, 建议, 接受审查, feedback, response, reply, 收到评论, 怎么回复"
  origin: superpowers
  category: review
  version: 1.0
---

# Receiving Code Review

Getting feedback is a gift, even when it stings. Handle it well.

## Mindset

- The reviewer is trying to help, not attack
- "You're wrong" rarely helps; "What if we tried X?" almost always does
- Separate your ego from the code: *you* are not your PR
- The goal is better code, not "winning" the review

## When You Get Feedback

### 1. Understand First

Before responding, make sure you understand:
- What specifically is the concern?
- What scenario triggered it?
- What's the underlying principle?

Ask clarifying questions if unclear:
- "Can you give me an example where this would be a problem?"
- "What would happen if X changed?"

### 2. Evaluate

For each piece of feedback, ask:
- Is the reviewer correct about the *technical* concern?
- Even if they're wrong about the specific fix, is there an underlying issue?
- What would I advise someone else in this situation?

### 3. Respond

✅ **Good responses**:
- "Good point — let me fix that."
- "I see your concern. Here's why I chose this approach: X. But you're right that Y is also valid. Let me reconsider."
- "Can you show me an example? I want to make sure I understand."

❌ **Bad responses**:
- "You're wrong because..."
- "That's just a style preference."
- "I'll leave it as is, trust me."
- Ignoring without responding

### 4. Update or Explain

Either:
- **Update the code** if the reviewer is right
- **Explain your reasoning** if you disagree, but be open to being convinced

If you disagree strongly, escalate to a third opinion.

## Anti-Pattern

- ❌ Getting defensive
- ❌ Ignoring feedback (silently not addressing it)
- ❌ "I'll just do what they say to end the discussion"
- ❌ Rewriting the entire PR instead of addressing the specific concern
- ❌ Treating every comment as a fight

## Checklist

- [ ] Understood the reviewer's concern
- [ ] Asked clarifying questions if needed
- [ ] Evaluated the feedback objectively
- [ ] Responded respectfully
- [ ] Either updated code or explained reasoning
- [ ] Final code is better than before review