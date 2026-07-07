import { Request, Response } from "express";
import { getAllUsers, getUserById } from "../models/userModel";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers(); // Our model functions hit the database which takes time. We need to await them — otherwise we'd return a response before the data arrives
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ error: "Internal server error" });
  }
};
