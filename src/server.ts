import app from "./index";
import pool from "./config/db";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3000;

pool
  .getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("MySQL connection failed:", err));

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
