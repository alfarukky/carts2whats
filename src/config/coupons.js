import { pool } from './db.js';

// Create coupons table
export async function createCouponsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      type ENUM('percentage', 'fixed') NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      expires_at TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (code),
      INDEX (is_active)
    )
  `;

  try {
    await pool.execute(createTableQuery);
    console.log('✅ Coupons table created/verified');
  } catch (error) {
    console.error('❌ Error creating coupons table:', error);
    throw error;
  }
}
