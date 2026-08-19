import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .openapi({ example: "Jane Doe" }),
    email: z
      .email("Invalid email format")
      .openapi({ example: "jane@example.com" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({ example: "secret123" }),
  })
  .openapi("CreateUserInput");

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .openapi({ example: "Jane Doe" }),
    email: z
      .email("Invalid email format")
      .openapi({ example: "jane@example.com" }),
  })
  .openapi("UpdateUserInput");

export const loginSchema = z
  .object({
    email: z
      .email("Invalid email format")
      .openapi({ example: "jane@example.com" }),
    password: z
      .string()
      .min(1, "Password is required")
      .openapi({ example: "secret123" }),
  })
  .openapi("LoginInput");

// Represents a user as returned BY the API (never includes password)
export const userResponseSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Jane Doe" }),
    email: z.email().openapi({ example: "jane@example.com" }),
    created_at: z.string().openapi({ example: "2026-08-14T10:00:00.000Z" }),
  })
  .openapi("UserResponse");

export type CreateUserInput = z.infer<typeof createUserSchema>;
// zod automatically generates a TypeScript type from your schema
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
