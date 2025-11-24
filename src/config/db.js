import mysql from 'mysql2/promise';
import 'dotenv/config';
export async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'carts2whats',
    });

    console.log('✅ Database connected successfully');
    return connection;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err; // Re-throw to handle in calling function
  }
}
