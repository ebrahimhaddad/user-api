import { Router } from "express";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
} from "../controllers/userController";
import { authenticate } from "../middleware/authenticate";
const router = Router();

router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUser);
router.post("/", addUser); // Registration stays public
router.put("/:id", authenticate, editUser);
router.delete("/:id", authenticate, removeUser);

export default router;
