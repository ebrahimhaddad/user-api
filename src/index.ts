import express, { Request, Response } from "express"; //Express library imported

const app = express(); // Use an instance of Express, for routing
const PORT = 3000;

app.use(express.json()); // A middleware, run before each request to be routed

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "User API is alive now!" });
}); // Router: receives two objects. req for headers, body, params, query string. res for tools to send a response

app.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

app.get("/users/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);

  if (isNaN(id)) {
    res.status(400).json({ error: "Id must be a number" });
    return;
  }

  res.json({ message: `Fetching user with id: ${id}` });
});

app.get("/search", (req: Request, res: Response) => {
  const name = req.query.name; // $_GET['name']
  const age = req.query.age;
  res.json({ searching_for: { name, age } });
  console.log(req.headers); // getallheaders()
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); // Strarts a server, starts listening
