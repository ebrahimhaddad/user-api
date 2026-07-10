import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
}

export const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, created_at FROM users",
  );
  return rows as User[];
};

export const getUserById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [id],
  );
  const user = (rows as User[])[0];
  return user || null;
};

export const createUser = async (user: User): Promise<number> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [user.name, user.email, hashedPassword],
  );
  return result.insertId;
};

export const updateUser = async (
  id: number,
  user: Partial<User>,
): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [user.name, user.email, id],
  );
  return result.affectedRows > 0;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM users WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
};
