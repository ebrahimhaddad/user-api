import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";
import redis from "../config/redis";
import { AuthRequest, hashToken } from "../middleware/authenticate";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user by email
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
    //res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.token; // set by the authenticate middleware
    if (!token) {
      res.status(400).json({ error: "No token to revoke" });
      return;
    }

    // Decode (not verify again — authenticate middleware already verified it)
    // just to read the expiry so we know how long to keep the blocklist entry.
    const decoded = jwt.decode(token) as { exp?: number } | null;

    if (!decoded?.exp) {
      res.status(400).json({ error: "Token has no expiry to calculate" });
      return;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp - nowInSeconds;

    if (remainingSeconds > 0) {
      // Blocklist entry expires exactly when the token itself would have
      // expired anyway — no point keeping it in Redis any longer than that.
      await redis.set(
        `blocklist:${hashToken(token)}`,
        "1",
        "EX",
        remainingSeconds,
      );
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
