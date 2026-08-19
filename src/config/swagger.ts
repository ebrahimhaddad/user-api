import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createUserSchema,
  updateUserSchema,
  loginSchema,
  userResponseSchema,
} from "../schemas/userSchema";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// --- Security scheme: Bearer JWT ---
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: z.object({ error: z.string() }),
    },
  },
});

// --- Auth routes ---
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Authenticate and receive a JWT",
  request: {
    body: {
      content: { "application/json": { schema: loginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful, returns a JWT",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), token: z.string() }),
        },
      },
    },
    401: errorResponse("Invalid credentials"),
    429: errorResponse("Too many login attempts (rate limited)"),
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Revoke the current JWT (logout)",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Logged out successfully",
      content: {
        "application/json": { schema: z.object({ message: z.string() }) },
      },
    },
    401: errorResponse("Access token required, invalid, or expired"),
  },
});

// --- User routes ---
registry.registerPath({
  method: "get",
  path: "/users",
  tags: ["Users"],
  summary: "List all users",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of users",
      content: { "application/json": { schema: z.array(userResponseSchema) } },
    },
    401: errorResponse("Access token required, invalid, or expired"),
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Get a user by ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: {
      description: "User found",
      content: { "application/json": { schema: userResponseSchema } },
    },
    400: errorResponse("Id must be a positive integer"),
    401: errorResponse("Access token required, invalid, or expired"),
    404: errorResponse("User not found"),
  },
});

registry.registerPath({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Create a new user",
  request: {
    body: { content: { "application/json": { schema: createUserSchema } } },
  },
  responses: {
    201: {
      description: "User created",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), id: z.number() }),
        },
      },
    },
    400: errorResponse("Validation error"),
    409: errorResponse("Email already in use"),
  },
});

registry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Update a user",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    body: { content: { "application/json": { schema: updateUserSchema } } },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: {
        "application/json": { schema: z.object({ message: z.string() }) },
      },
    },
    400: errorResponse("Validation error"),
    401: errorResponse("Access token required, invalid, or expired"),
    404: errorResponse("User not found"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Delete a user",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: {
      description: "User deleted successfully",
      content: {
        "application/json": { schema: z.object({ message: z.string() }) },
      },
    },
    401: errorResponse("Access token required, invalid, or expired"),
    404: errorResponse("User not found"),
  },
});

// --- Health ---
registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Health check, including DB connectivity",
  responses: {
    200: {
      description: "Service healthy",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
            db: z.string(),
          }),
        },
      },
    },
    503: errorResponse("Service unhealthy (DB unreachable)"),
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "user-api",
    version: "1.0.0",
    description:
      "Production REST API built with Node.js, TypeScript, and Express. See the live deployment at https://api.webtechie.ir and the ADR log for architecture decisions.",
  },
  servers: [
    process.env.NODE_ENV === "production"
      ? { url: "https://api.webtechie.ir", description: "Production" }
      : { url: "http://localhost:3000", description: "Local development" },
    process.env.NODE_ENV === "production"
      ? { url: "http://localhost:3000", description: "Local development" }
      : { url: "https://api.webtechie.ir", description: "Production" },
  ],
});
