import { Request, Response, NextFunction } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../models/userModel";
import redis from "../config/redis";

const CACHE_TTL_SECONDS = 60;
const ALL_USERS_KEY = "users:all";
const userKey = (id: number) => `users:id:${id}`;

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cached = await redis.get(ALL_USERS_KEY);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const users = await getAllUsers(); // Our model functions hit the database which takes time. We need to await them — otherwise we'd return a response before the data arrives
    await redis.set(
      ALL_USERS_KEY,
      JSON.stringify(users),
      "EX",
      CACHE_TTL_SECONDS,
    );
    res.json(users);
  } catch (error) {
    next(error); // ← just pass to error handler
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const raw = req.params.id as string;
    const id = parseInt(raw);

    if (isNaN(id) || !/^\d+$/.test(raw)) {
      res.status(400).json({ error: "Id must be a positive integer" });
      return;
    }

    const cached = await redis.get(userKey(id));
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await redis.set(userKey(id), JSON.stringify(user), "EX", CACHE_TTL_SECONDS);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const id = await createUser({ name, email, password });
    await redis.del(ALL_USERS_KEY); // list is now stale — a new user exists
    res.status(201).json({ message: "User created", id });
  } catch (error) {
    next(error); // ER_DUP_ENTRY handled in errorHandler now
  }
};

export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const raw = req.params.id as string;
    const id = parseInt(raw);

    if (isNaN(id) || !/^\d+$/.test(raw)) {
      res.status(400).json({ error: "Id must be a positive integer" });
      return;
    }

    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: "Name and email are required" });
      return;
    }

    const updated = await updateUser(id, { name, email });

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await redis.del(ALL_USERS_KEY, userKey(id)); // both the list and this user's cached entry are now stale
    res.json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const raw = req.params.id as string;
    const id = parseInt(raw);

    if (isNaN(id) || !/^\d+$/.test(raw)) {
      res.status(400).json({ error: "Id must be a positive integer" });
      return;
    }

    const deleted = await deleteUser(id);

    if (!deleted) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await redis.del(ALL_USERS_KEY, userKey(id));
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
