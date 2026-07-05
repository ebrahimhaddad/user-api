import { Request, Response } from "express";

export const getUser = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string);

  if (isNaN(id)) {
    res.status(400).json({ error: "Id must be a number" });
    return;
  }

  res.json({ message: `Fetching user with id: ${id}` });
};
