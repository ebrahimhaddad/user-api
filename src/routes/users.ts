import { Router } from "express";
import { getUser } from "../controllers/userController";

const router = Router();

router.get("/:id", getUser);

export default router;
