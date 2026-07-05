# User API

A RESTful API built with Node.js, Express, and TypeScript — developed as part of a structured backend modernization journey from PHP/MySQL to the Node.js ecosystem.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MySQL _(coming soon)_

---

## Project Structure

```
src/
├── index.ts              # Server setup and entry point
├── routes/
│   └── users.ts          # User route definitions
├── controllers/
│   └── userController.ts # User request handlers
└── middleware/           # Reusable middleware (coming soon)
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/user-api.git

# Navigate to project folder
cd user-api

# Install dependencies
npm install
```

### Running the Server

```bash
npx ts-node src/index.ts
```

Server will start on `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/`                  | Health check          |
| GET    | `/ping`              | Returns server time   |
| GET    | `/users/:id`         | Get user by ID        |
| GET    | `/search?name=&age=` | Search users by query |

---

## Roadmap

- [x] Project setup with TypeScript
- [x] Express server and routing
- [x] MVC folder structure
- [ ] MySQL database integration with Docker
- [ ] User CRUD operations
- [ ] Authentication with JWT
- [ ] Input validation with Zod
- [ ] Unit and integration tests
- [ ] Deployment to cloud

---

## Author

Backend developer with 15+ years of PHP/MySQL experience, modernizing into the Node.js/TypeScript ecosystem.

---

## License

MIT
