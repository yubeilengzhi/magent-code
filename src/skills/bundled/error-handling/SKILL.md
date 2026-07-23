---
name: error-handling
description: "Patterns for robust error handling across languages. Fail fast, recover gracefully."
metadata:
  trigger: "error handling, exception, fail, 错误处理, 异常, 容错"
  origin: ecc
  category: debugging
  version: 1.0
---

# Error Handling

Errors are inevitable. Good error handling makes systems resilient.

## Principles

### 1. Fail Fast
Detect errors early, fail clearly. Don't try to "fix" bad data.

```ts
// ❌ Bad: try to handle empty order
function processOrder(order) {
  if (order.items.length === 0) {
    order.items = [{ placeholder: true }]  // HIDDEN BUG
  }
  // ...
}

// ✅ Good: fail immediately
function processOrder(order) {
  if (order.items.length === 0) {
    throw new InvalidOrderError('Order has no items')
  }
  // ...
}
```

### 2. Errors are Values
In some languages (Go, Rust), errors are just values. Pass them, don't throw.

### 3. Never Swallow
```ts
// ❌ CATASTROPHIC
try {
  await criticalOperation()
} catch (e) {
  // Silent failure
}
```

### 4. Wrap with Context
```ts
try {
  await db.query(...)
} catch (e) {
  logger.error('Failed to fetch user preferences', { userId, originalError: e })
  throw new ServiceError('Unable to load preferences', { cause: e })
}
```

### 5. Use Specific Types
```ts
// ❌ Too broad
catch (e) {}

// ✅ Specific
catch (e) {
  if (e instanceof ValidationError) {
    return badRequest(e.message)
  } else if (e instanceof AuthError) {
    return unauthorized()
  } else {
    logger.error('Unexpected error', e)
    throw e
  }
}
```

## Retry Strategies

### Exponential Backoff
```ts
async function retry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === attempts - 1 || !isRetryable(e)) throw e
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
      await sleep(delay)
    }
  }
  throw new Error('unreachable')
}
```

### Circuit Breaker
Stop calling broken service:
```ts
if (circuit.state === 'OPEN') {
  return fallback()
}
try {
  return await callService()
} catch (e) {
  circuit.recordFailure()
  throw e
}
```

### Idempotency Key
For safe retries:
```ts
await api.call({ idempotencyKey: uuid() })
```

## Logging Best Practices

✅ Include:
- Timestamp
- Request ID
- User ID
- Operation
- Error type
- Stack trace

❌ Don't include:
- Passwords
- API keys
- Credit card numbers
- PII (unless required and secured)

## User-Facing Messages

| Bad (internal jargon) | Good (user-friendly) |
|---|---|
| "NullPointerException at line 42" | "暂时无法处理请求，请稍后重试" |
| "ECONNREFUSED" | "服务暂时不可用" |
| "Validation failed: email regex" | "邮箱格式不正确" |

## Anti-Pattern

- ❌ Swallowing errors
- ❌ Catch-all with generic handling
- ❌ Logging sensitive data
- ❌ Showing internal errors to users
- ❌ Retrying non-idempotent operations
- ❌ Not retrying at all
- ❌ Infinite retry loops (need backoff)

## Checklist

- [ ] Fail fast (don't try to fix bad data)
- [ ] Never swallow errors
- [ ] Wrap with context
- [ ] Use specific error types
- [ ] Retry with backoff
- [ ] Circuit breaker for external deps
- [ ] Idempotency for retries
- [ ] User-friendly messages
- [ ] No secrets in logs