import dotenv from "dotenv";
dotenv.config({ quiet: true });
import helmet from "helmet";
import cors from "cors";
import express, { Request, Response } from "express"; //Express library imported
import usersRouter from "./routes/users";
import pool from "./config/db";
import authRouter from "./routes/auth";
import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

const app = express(); // Use an instance of Express, for routing
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(generalLimiter);

app.use(express.json()); // A middleware, run before each request to be routed

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "User API is alive now!" });
}); // Router: receives two objects. req for headers, body, params, query string. res for tools to send a response

app.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

app.use("/users", usersRouter);

app.use("/auth", authRouter);

app.get("/search", (req: Request, res: Response) => {
  const name = req.query.name; // $_GET['name']
  const age = req.query.age;
  res.json({ searching_for: { name, age } });
  console.log(req.headers); // getallheaders()
});

app.use(errorHandler); // must be last

export default app; // export app without starting it
