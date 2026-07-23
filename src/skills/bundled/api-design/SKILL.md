---
name: api-design
description: "Design APIs that are easy to use, hard to misuse, and forward-compatible."
metadata:
  trigger: "API design, design API, endpoint, REST, interface design, API 设计, 接口设计"
  origin: magent
  category: engineering
  version: 1.0
---

# API Design Principles

Good APIs are easy to learn, hard to misuse, and grow gracefully.

## Core Principles

### 1. Easy to Use Correctly, Hard to Use Incorrectly

```ts
// ❌ Bad: easy to swap arguments
connect(host, port, isSecure)

// ✅ Good: named parameters, can't swap
connect({ host, port, secure: true })
```

### 2. Principle of Least Astonishment

Names do what they say. Don't surprise users.

### 3. Make Invalid States Unrepresentable

```ts
// ❌ Bad: can have invalid state
type Order = { status: string }

// ✅ Good: status is constrained
type Order = { status: 'pending' | 'paid' | 'shipped' }
```

### 4. Be Consistent

- Same naming convention throughout
- Same error format
- Same auth mechanism

### 5. Easy to Evolve

Add fields without breaking old clients.
- Add optional fields, don't remove
- Version your API (`/v1/`, `/v2/`)
- Deprecate gracefully (warn for 6 months before removing)

## REST API Conventions

### URLs
```
GET    /api/v1/users          # list
GET    /api/v1/users/:id      # read
POST   /api/v1/users          # create
PUT    /api/v1/users/:id      # full update
PATCH  /api/v1/users/:id      # partial update
DELETE /api/v1/users/:id      # delete
```

### Errors
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 123 not found",
    "details": {}
  }
}
```

### Pagination
```json
{
  "data": [...],
  "page": 1,
  "page_size": 20,
  "total": 150
}
```

## Versioning

- **URL version** (`/api/v1/`): Easy to see, easy to route
- **Header version** (`Accept: application/vnd.api.v2+json`): Cleaner URLs
- **No version**: Risky

Pick URL version for new APIs.

## Naming

- ✅ Nouns for resources (`/users`, not `/getUsers`)
- ✅ Plural (`/users`, not `/user`)
- ✅ kebab-case for URLs (`/user-profiles`)
- ✅ camelCase for JSON fields

## Anti-Pattern

- ❌ Verbs in URLs (`/getUser`, `/createOrder`)
- ❌ Mixing singular/plural (`/user` and `/orders`)
- ❌ Returning different shapes for different cases
- ❌ Returning 200 for errors
- ❌ Putting auth in URL (`/login/john/password123`)
- ❌ No rate limiting / no pagination

## Checklist

- [ ] Easy to use correctly
- [ ] Hard to use incorrectly
- [ ] Invalid states unrepresentable
- [ ] Consistent with existing APIs
- [ ] Versioned
- [ ] Documented with examples