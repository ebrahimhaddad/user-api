import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { login, logout } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/userSchema";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and receive a JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many attempts (rate limited)
 */
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout); // must be authenticated to log out

export default router;
