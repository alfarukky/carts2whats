import { pool } from './db.js';

// Create order verification table
export async function createOrderVerificationTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS order_verifications (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(12) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      signature VARCHAR(16) NOT NULL,
      status ENUM('pending', 'verified', 'cancelled') DEFAULT 'pending',
      customer_name VARCHAR(100) NULL,
      customer_phone VARCHAR(20) NULL,
      coupon_code VARCHAR(20) NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (order_id),
      INDEX (status),
      INDEX (created_at),
      INDEX (customer_phone)
    )
  `;

  try {
    await pool.execute(createTableQuery);
    console.log('✅ Order verification table created/verified');
  } catch (error) {
    console.error('❌ Error creating order verification table:', error);
    throw error;
  }
}
