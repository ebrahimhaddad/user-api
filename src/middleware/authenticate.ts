import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../config/redis";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
  token?: string;
}

// Same hashing approach used in authController's logout — keeps Redis keys
// short and avoids storing raw JWTs as literal Redis keys.
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
    };

    const isRevoked = await redis.get(`blocklist:${hashToken(token)}`);
    if (isRevoked) {
      res.status(401).json({ error: "Token has been revoked" });
      return;
    }

    req.user = decoded;
    req.token = token; // needed by logout to know which token to blocklist
    next();
  } catch (_error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
