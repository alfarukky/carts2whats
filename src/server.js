import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { createSuperAdmin } from './config/createSuperAdmin.js'; // Fixed import path

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Connect to the database
    const connection = await connectDB();

    // 2. Initialize Super Admin
    await createSuperAdmin(connection);

    // 3. Create server (ONCE)
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

startServer();
