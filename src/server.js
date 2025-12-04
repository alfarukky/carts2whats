import http from 'http';
import app from './app.js';
import { pool } from './config/db.js';
import { createSuperAdmin } from './config/createSuperAdmin.js'; // Fixed import path

const PORT = process.env.PORT || 3000;

async function startServer() {
  let conn; // Define conn here to be accessible in finally block
  try {
    // 1. Get a database connection
    conn = await pool.getConnection(); 
    console.log("✅ Database pool connected successfully");

    // 2. Initialize Super Admin using the obtained connection
    await createSuperAdmin(conn);

    // 3. Create and start the server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ STARTUP SERVER ERROR:", err.message || err);
    process.exit(1);
  } finally {
    // 4. Ensure the connection is always released
    if (conn) {
      conn.release();
      console.log("✅ Initial setup connection released");
    }
  }
}

startServer();
