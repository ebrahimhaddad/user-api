import app from "./index";
import pool from "./config/db";

const PORT = process.env.PORT || 3000;

pool
  .getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("MySQL connection failed:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
