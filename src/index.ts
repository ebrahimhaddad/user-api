import express, { Request, Response } from "express"; //Express library imported
import usersRouter from "./routes/users";
import pool from "./config/db";
import authRouter from "./routes/auth";

const app = express(); // Use an instance of Express, for routing
const PORT = 3000;

app.use(express.json()); // A middleware, run before each request to be routed

app.use("/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "User API is alive now!" });
}); // Router: receives two objects. req for headers, body, params, query string. res for tools to send a response

app.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

app.use("/users", usersRouter);

app.get("/search", (req: Request, res: Response) => {
  const name = req.query.name; // $_GET['name']
  const age = req.query.age;
  res.json({ searching_for: { name, age } });
  console.log(req.headers); // getallheaders()
});

pool
  .getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("MySQL connection failed:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); // Strarts a server, starts listening
