# Architecture Decision Records — user-api

This document records the key architectural decisions made during the development of the User API project.

---

## ADR-001: Node.js + TypeScript as Runtime and Language

**Date:** 2026-07  
**Status:** Accepted

### Context

The project needed a modern backend stack that is competitive in the current job market. The developer has 15+ years of PHP/MySQL experience and familiarity with JavaScript.

### Decision

Use Node.js as the runtime and TypeScript as the language.

### Reasons

- JavaScript knowledge transfers directly to Node.js
- TypeScript adds type safety, catching bugs at compile time rather than runtime
- Node.js + TypeScript is one of the most in-demand backend stacks in 2026
- Non-blocking I/O model is more efficient than PHP's per-request process model

### Consequences

- TypeScript requires a build step (`tsc`) before production deployment
- `ts-node` is used during development to skip the build step
- `devDependencies` and `dependencies` must be carefully separated

---

## ADR-002: Express.js as HTTP Framework

**Date:** 2026-07  
**Status:** Accepted

### Context

Node.js core HTTP module is too low-level for building a REST API efficiently.

### Decision

Use Express.js as the HTTP framework.

### Reasons

- Most widely used Node.js framework — every employer knows it
- Minimal and unopinionated — good for learning fundamentals
- Large ecosystem of compatible middleware
- Clear routing and middleware pipeline model

### Consequences

- No built-in validation, auth, or security — must be added via middleware
- This is intentional — each concern is handled by a dedicated package

---

## ADR-003: MVC Architecture

**Date:** 2026-07  
**Status:** Accepted

### Context

All code starting in a single `index.ts` file is not scalable or maintainable.

### Decision

Adopt MVC (Model-View-Controller) architecture with the following folder structure:

```
src/
├── controllers/   — request handling logic
├── models/        — database queries
├── routes/        — URL to controller mapping
├── middleware/    — reusable pipeline functions
├── schemas/       — Zod validation schemas
└── utils/         — shared utilities
```

### Reasons

- Separation of concerns — each file has one job
- Familiar pattern from PHP frameworks (Laravel, CodeIgniter)
- Easy for other developers to navigate
- Controllers stay clean — no database or validation logic

### Consequences

- More files than a flat structure
- Clear boundaries make testing easier

---

## ADR-004: MySQL with Docker for Local Development

**Date:** 2026-07  
**Status:** Accepted

### Context

The developer has 15+ years of MySQL experience. A familiar database reduces learning curve while focusing on Node.js.

### Decision

Use MySQL as the database, running in Docker for local development.

### Reasons

- Existing MySQL expertise transfers directly
- Docker eliminates "works on my machine" problems
- Anyone cloning the repo can run `docker-compose up -d` for an identical environment
- `mysql2` driver supports async/await natively

### Consequences

- Docker must be installed for local development
- Connection pooling replaces PHP's per-request connections — more efficient
- Prepared statements (`?` placeholders) prevent SQL injection

---

## ADR-005: JWT for Authentication

**Date:** 2026-07  
**Status:** Accepted

### Context

API needs authentication. Traditional session-based auth requires server-side state storage.

### Decision

Use JSON Web Tokens (JWT) for stateless authentication.

### Reasons

- Stateless — no server-side session storage needed
- Scales easily across multiple servers
- Standard approach for REST APIs
- Works naturally with mobile apps and third-party clients

### Consequences

- Tokens cannot be invalidated before expiry (use short expiry + refresh tokens in future)
- Token stored on client — client responsible for security
- Secret key must be kept secure — stored in `.env`, never in Git

---

## ADR-006: Zod for Input Validation

**Date:** 2026-07  
**Status:** Accepted

### Context

Express does not validate incoming request data. Manual validation is verbose and inconsistent.

### Decision

Use Zod for schema-based input validation via a reusable middleware.

### Reasons

- TypeScript-first — schemas generate TypeScript types automatically (`z.infer`)
- Declarative — validation rules are readable and co-located in schema files
- Returns all validation errors at once, not just the first one
- Eliminates repetitive validation code in controllers

### Consequences

- Controllers receive clean, validated data — no validation logic inside them
- Schema files are the single source of truth for data shape

---

## ADR-007: Centralized Error Handling

**Date:** 2026-07  
**Status:** Accepted

### Context

Each controller had its own error handling — repetitive and inconsistent.

### Decision

Use a single Express error handler middleware registered last in the pipeline.

### Reasons

- One place to change error format across the entire API
- Controllers simply call `next(error)` — no error logic inside them
- Different error types (Zod, AppError, MySQL, unknown) handled consistently
- Production vs development error detail controlled in one place

### Consequences

- All errors must be passed via `next(error)` or thrown
- Expected outcomes (404, 400) stay in controllers — only unexpected errors go to handler

---

## ADR-008: Security Middleware Stack

**Date:** 2026-07  
**Status:** Accepted

### Context

Express has no built-in security. APIs are vulnerable to common attacks by default.

### Decision

Use a layered security middleware stack applied globally.

| Middleware           | Protection                                |
| -------------------- | ----------------------------------------- |
| `helmet`             | Secure HTTP headers                       |
| `cors`               | Cross-origin request control              |
| `express-rate-limit` | Brute force and abuse prevention          |
| `trust proxy`        | Correct IP detection behind Railway proxy |

### Reasons

- Defense in depth — multiple layers stop different attack vectors
- All middleware runs before routes — bad requests rejected early
- Auth endpoint has stricter rate limit (10/15min) than general routes (100/15min)

### Consequences

- `trust proxy` must be set when deployed behind a reverse proxy (Railway, AWS ALB)
- `ALLOWED_ORIGIN` must be updated per environment

---

## ADR-009: Winston for Logging

**Date:** 2026-07  
**Status:** Accepted

### Context

`console.log` is not suitable for production — no timestamps, no log levels, no file output.

### Decision

Use Winston for structured logging.

### Reasons

- Log levels (`info`, `error`, `debug`) allow filtering in production
- Timestamps on every log entry
- Writes to files in production, console in development
- Industry standard in Node.js ecosystem

### Consequences

- `logs/` directory added to `.gitignore`
- Log level set to `debug` in development, `info` in production via `NODE_ENV`

---

## ADR-010: Railway for Cloud Deployment

**Date:** 2026-07  
**Status:** Accepted

### Context

Project needs to be deployed to a real server accessible on the internet.

### Decision

Use Railway as the initial cloud deployment platform.

### Reasons

- Simple GitHub integration — push to deploy
- Managed MySQL database available as a service
- Free tier sufficient for learning and portfolio
- Concepts transfer directly to AWS for future production deployments

### Consequences

- `PORT` must be read from environment variables — Railway assigns it dynamically
- `trust proxy` required — Railway sits behind a reverse proxy
- Rate limiter `validate: { xForwardedForHeader: false }` required for Railway compatibility
