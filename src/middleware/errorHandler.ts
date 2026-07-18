import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Our custom app error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // MySQL duplicate entry
  if ((err as any).code === "ER_DUP_ENTRY") {
    res.status(409).json({
      error: "A record with this value already exists",
    });
    return;
  }

  // Unknown error — don't expose details in production
  console.error("Unexpected error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  }); // In development you see the real error message — helpful for debugging. In production you hide it. Put NODE_ENV=development to .env
};
