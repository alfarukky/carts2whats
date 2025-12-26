import http from "http";
import app from "./app.js";
import { initializeDatabase } from "./config/initialize.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database and create tables/admin
    await initializeDatabase();

    // Start the server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ STARTUP SERVER ERROR:", err.message || err);
    process.exit(1);
  }
}

startServer();
