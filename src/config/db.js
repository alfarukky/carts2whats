import mysql from "mysql2/promise";
import "dotenv/config";

// CREATE A SINGLE POOL — reused across the whole app
export const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,   // queue when all connections are busy
  connectionLimit: 10,        // max 10 connections
  queueLimit: 0               // unlimited queued requests
});
