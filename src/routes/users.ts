import { Router } from "express";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
} from "../controllers/userController";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";

const router = Router();

router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUser);
router.post("/", validate(createUserSchema), addUser); // Registration stays public
router.put("/:id", authenticate, validate(updateUserSchema), editUser);
router.delete("/:id", authenticate, removeUser);

export default router;
