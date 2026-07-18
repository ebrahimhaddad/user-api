import { Router } from "express";
import { login } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/userSchema";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);

export default router;
