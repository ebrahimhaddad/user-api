import { Request, Response, NextFunction } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../models/userModel";
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await getAllUsers(); // Our model functions hit the database which takes time. We need to await them — otherwise we'd return a response before the data arrives
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

    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

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
    //console.log("Body received:", req.body);
    //console.log("ID received:", req.params.id);
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

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
