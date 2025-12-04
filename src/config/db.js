import mysql from 'mysql2/promise';
import 'dotenv/config';
// CREATE A SINGLE POOL — reused across the whole app
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "carts2whats",
  waitForConnections: true,   // queue when all connections are busy
  connectionLimit: 10,        // max 10 connections
  queueLimit: 0               // unlimited queued requests
});

