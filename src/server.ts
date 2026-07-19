import app from "./index";
import pool from "./config/db";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3000;

pool
  .getConnection()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("MySQL connection failed:", err));

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown in sake of Railway
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => {
    pool.end();
    logger.info("Process terminated");
  });
});
