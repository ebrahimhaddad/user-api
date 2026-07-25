import { Request, Response } from "express";
import pool from "../config/db";

export async function healthCheck(req: Request, res: Response) {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      db: "unreachable",
    });
  }
}
