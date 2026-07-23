---
name: security-review
description: "Review code for security issues: auth, injection, secrets, access control."
metadata:
  trigger: "security, vulnerability, CVE, exploit, hack, 安全, 漏洞, 渗透测试"
  origin: ecc
  category: review
  version: 1.0
---

<HARD-GATE>
Never commit secrets, API keys, or credentials to version control.
</HARD-GATE>

# Security Review

Security bugs are the most expensive to fix later. Catch them early.

## What to Look For

### Authentication
- Passwords hashed (bcrypt/argon2, not MD5/SHA1)
- MFA for sensitive operations
- Session tokens: secure, httpOnly, sameSite cookies
- OAuth: PKCE flow, state parameter
- JWT: signed, short-lived, with refresh

### Authorization
- Every endpoint checks auth (don't trust UI)
- Role-based access control (RBAC) clear
- Resource ownership verified (can user X access resource Y?)
- Admin endpoints protected
- IDOR (Insecure Direct Object Reference) prevention

### Input Validation
- All user input validated server-side
- Whitelisting > blacklisting
- Length limits
- Type checking
- Encoding (UTF-8, etc.)

### Injection
- SQL: parameterized queries (never string concat)
- NoSQL: validate input structure
- Command: never pass user input to shell
- Template: don't put user input in templates
- Path: validate against path traversal (`../`)

### Secrets
- No hardcoded secrets in code
- Use env vars / secret managers
- Different secrets per environment
- Rotate regularly
- Audit access

### Crypto
- Use established libraries (don't roll your own)
- TLS for all network communication
- Modern algorithms (AES-256, RSA-2048+, SHA-256+)
- Don't use ECB mode
- Random IVs

### Web-specific
- XSS: escape output, CSP headers
- CSRF: tokens for state-changing requests
- Clickjacking: X-Frame-Options
- HTTPS-only cookies
- HSTS

## Code Patterns to Flag

```ts
// ❌ SQL injection
db.query(`SELECT * FROM users WHERE id = ${id}`)

// ❌ Command injection
exec(`ls ${userInput}`)

// ❌ Hardcoded secret
const apiKey = "sk-1234567890"

// ❌ Path traversal
fs.readFile(`./uploads/${filename}`)

// ❌ Missing auth check
app.get('/api/users/:id', getUser)  // No auth check!

// ❌ Weak crypto
crypto.createHash('md5')
```

## Review Checklist

- [ ] Auth on every endpoint
- [ ] Input validation (server-side)
- [ ] No SQL/command injection
- [ ] No hardcoded secrets
- [ ] Output escaping (XSS prevention)
- [ ] CSRF tokens for state-changing
- [ ] Security headers set
- [ ] Dependencies up to date (no known CVEs)
- [ ] Logging doesn't include secrets
- [ ] Error messages don't leak internals