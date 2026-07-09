import { Router } from "express";
import { getUsers, getUser, addUser } from "../controllers/userController";
const router = Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);

export default router;
