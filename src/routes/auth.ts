import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { login, logout } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/userSchema";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout); // must be authenticated to log out

export default router;
