---
name: debugging-and-error-recovery
description: "Recover from errors gracefully. Detect, diagnose, recover, learn."
metadata:
  trigger: "error recovery, handle error, recover, 错误恢复, 异常处理, 容错"
  origin: agent-skills
  category: debugging
  version: 1.0
---

# Debugging & Error Recovery

Things will break. The question is: how do you handle it?

## Layers of Defense

### 1. Prevent
- Input validation
- Type checking (TypeScript)
- Schema validation (zod, etc.)
- Pre-conditions (asserts)

### 2. Detect
- Logging (structured, with context)
- Metrics (counters, latencies)
- Health checks
- Anomaly detection

### 3. Recover
- Retries (with backoff)
- Fallbacks (degraded mode)
- Circuit breakers (stop calling broken service)
- Idempotency (so retries are safe)

### 4. Communicate
- Clear error messages (for users)
- Detailed error logs (for devs)
- Status pages (for stakeholders)
- Incident reports (for learning)

## Error Handling Patterns

### Fail Fast
```ts
function processOrder(order: Order) {
  if (!order.items.length) throw new InvalidOrderError('Empty order');
  // ... continue processing
}
```
Fail early, fail clearly. Don't try to "fix" bad data.

### Wrap & Rethrow
```ts
try {
  await api.call();
} catch (e) {
  logger.error('API call failed', { context, originalError: e });
  throw new UserFacingError('暂时无法访问服务，请稍后重试');
}
```
Log the details, expose a clean message.

### Retry with Backoff
```ts
async function retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
      await sleep(Math.pow(2, i) * 1000 + Math.random() * 1000);
    }
  }
  throw new Error('unreachable');
}
```

### Circuit Breaker
```ts
if (circuitBreaker.isOpen()) {
  return fallback();
}
try {
  return await riskyCall();
} catch (e) {
  circuitBreaker.recordFailure();
  throw e;
}
```

## Anti-Pattern

- ❌ Swallowing errors silently (`catch (e) {}`)
- ❌ Catching too broad (`catch (e) { /* whatever */ }`)
- ❌ Generic error messages ("Something went wrong")
- ❌ Logging sensitive data (passwords, tokens)
- ❌ No retry strategy (immediate fail)
- ❌ No fallback (system completely down)

## Checklist

- [ ] Errors caught at appropriate level
- [ ] Logs include context (request ID, user, operation)
- [ ] User-facing messages are clear
- [ ] Internal errors don't leak to users
- [ ] Retries with backoff
- [ ] Circuit breaker for external deps
- [ ] Idempotency for retry safety