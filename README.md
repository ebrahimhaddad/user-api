# User API

A production-grade RESTful API built with Node.js, Express, and TypeScript, developed as part of a structured backend modernization journey from 15+ years of PHP/MySQL work into the Node.js/TypeScript ecosystem.

**Live API:** [https://api.webtechie.ir](https://api.webtechie.ir)
**Architecture decisions:** [ADR.md](./ADR.md), every major design decision documented with context, reasoning, and trade-offs

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MySQL
- **Cache / Token revocation:** Redis
- **Auth:** JWT (with Redis-backed logout/revocation)
- **Validation:** Zod
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Winston + morgan
- **Error tracking:** Sentry
- **Uptime monitoring:** UptimeRobot
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions (lint, type-check, build, test against a real MySQL service container, branch protection gating merges)
- **Infrastructure:** Docker Compose, self-managed AWS EC2, nginx (reverse proxy), Let's Encrypt (SSL), Cloudflare (edge/DNS)

---

## Features

- JWT authentication with Redis-backed token revocation (real logout, not just client-side token deletion)
- Redis caching (cache-aside pattern) on read-heavy endpoints, with invalidation on writes
- Centralized error handling and structured logging across the whole request lifecycle
- Rate limiting (stricter on `/auth`, general elsewhere)
- Full CI pipeline gating every merge to `master`
- Self-managed production deployment: Docker Compose orchestration with healthcheck-gated service startup, nginx reverse proxy, real TLS via Let's Encrypt

---

## Project Structure

```
src/
├── index.ts               # Express app definition (exported, not started, see server.ts)
├── server.ts               # Real entry point: starts the HTTP server, graceful shutdown
├── instrument.ts            # Sentry initialization (must load first)
├── config/
│   ├── db.ts                # MySQL connection pool
│   └── redis.ts             # Redis client
├── routes/                  # URL → controller mapping
├── controllers/              # Request handling logic
├── models/                  # Database queries
├── middleware/               # authenticate, validate, rateLimiter, errorHandler
├── schemas/                  # Zod validation schemas
└── utils/                   # Logger and shared utilities
```

**Note:** `index.ts` builds and exports the Express app but deliberately does not call
`app.listen()` - this keeps the app importable/testable in isolation (Supertest imports
`app` directly). `server.ts` is the actual runtime entry point. Running `node dist/index.js`
directly will start cleanly but never bind to a port - always run `server.ts` in production.

---

## Getting Started

### Prerequisites

- Node.js v20+
- Docker & Docker Compose (for local MySQL + Redis)

### Installation

```bash
git clone https://github.com/ebrahimhaddad/user-api.git
cd user-api
npm install
cp .env.example .env   # fill in DB, Redis, JWT, and Sentry values
docker compose up -d   # starts local MySQL + Redis
```

### Running the Server

```bash
npx ts-node src/server.ts
```

Server starts on `http://localhost:3000`.

### Running Tests

```bash
npm test
```

---

## API Endpoints

| Method | Endpoint       | Auth required | Description                                   |
| ------ | -------------- | ------------- | --------------------------------------------- |
| GET    | `/`            | No            | Liveness check                                |
| GET    | `/ping`        | No            | Returns server time                           |
| GET    | `/health`      | No            | Health check, including DB connectivity       |
| POST   | `/auth/login`  | No            | Authenticate, returns a JWT                   |
| POST   | `/auth/logout` | Yes           | Revokes the current token via Redis blocklist |
| GET    | `/users`       | Yes           | List users (cached)                           |
| GET    | `/users/:id`   | Yes           | Get user by ID (cached)                       |
| POST   | `/users`       | No            | Create a user                                 |
| PUT    | `/users/:id`   | Yes           | Update a user                                 |
| DELETE | `/users/:id`   | Yes           | Delete a user                                 |
| GET    | `/search`      | No            | Search users by query params                  |

---

## Deployment

Currently self-hosted on AWS EC2 (Docker Compose, nginx, Let's Encrypt), sitting behind
Cloudflare in Full (strict) mode. See [ADR-013](./ADR.md#adr-013-migrate-deployment-from-railway-to-self-managed-aws-ec2)
for the full reasoning behind this setup, including the trade-offs considered.

---

## Roadmap

- [x] Project setup with TypeScript
- [x] Express server and routing
- [x] MVC folder structure
- [x] MySQL database integration with Docker
- [x] User CRUD operations
- [x] Authentication with JWT
- [x] Input validation with Zod
- [x] Security middleware (Helmet, CORS, rate limiting)
- [x] Centralized error handling
- [x] Structured logging (Winston + morgan)
- [x] Unit and integration tests (Jest + Supertest)
- [x] CI/CD pipeline with branch protection
- [x] Redis caching and JWT revocation
- [x] Error tracking (Sentry) and uptime monitoring
- [x] Production deployment with custom domain and HTTPS
- [ ] OpenAPI/Swagger documentation
- [ ] API versioning (currently deferred, see ADR log)

---

## Author

Backend developer with 20+ years of hands-on technology experience and 15+ years of
production PHP/MySQL work, now specializing in Node.js/TypeScript. This project is the
primary portfolio piece for that transition, see the [ADR log](./ADR.md) for the full
decision history behind it.

---

## License

MIT
