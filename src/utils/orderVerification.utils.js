import crypto from 'crypto';
import { pool } from '../config/db.js';

const SECRET = process.env.ORDER_SIGN_SECRET || 'change_this_secret_in_production';

// Generate unique order ID
export function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MC-${timestamp}${random}`.substring(0, 12).toUpperCase();
}

// Sign order for verification
export function signOrder(orderId, amount) {
  const payload = `${orderId}|${amount}|${Date.now()}`;
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex').substring(0, 16);
}

// Verify order signature
export function verifyOrderSignature(orderId, amount, signature) {
  try {
    const expected = signOrder(orderId, amount);
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch (error) {
    return false;
  }
}

// Create order verification record
export async function createOrderVerification(orderId, totalAmount, couponData = null) {
  const signature = signOrder(orderId, totalAmount);
  
  let query = `
    INSERT INTO order_verifications (order_id, total_amount, signature, coupon_code, discount_amount) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const values = [
    orderId, 
    totalAmount, 
    signature,
    couponData ? couponData.code : null,
    couponData ? couponData.discount : 0
  ];
  
  try {
    const [result] = await pool.execute(query, values);
    return { success: true, id: result.insertId, orderId, signature };
  } catch (error) {
    console.error('Error creating order verification:', error);
    return { success: false, error: error.message };
  }
}

// Get order verification by ID
export async function getOrderVerification(orderId) {
  const query = 'SELECT * FROM order_verifications WHERE order_id = ?';
  
  try {
    const [rows] = await pool.execute(query, [orderId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting order verification:', error);
    return null;
  }
}

// Update order verification
export async function updateOrderVerification(orderId, updates) {
  const allowedFields = ['status', 'customer_name', 'customer_phone', 'coupon_code', 'discount_amount', 'notes'];
  const fields = [];
  const values = [];
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });
  
  if (fields.length === 0) return { success: false, error: 'No valid fields to update' };
  
  values.push(orderId);
  const query = `UPDATE order_verifications SET ${fields.join(', ')} WHERE order_id = ?`;
  
  try {
    const [result] = await pool.execute(query, values);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error updating order verification:', error);
    return { success: false, error: error.message };
  }
}

// Delete customer info only
export async function clearCustomerInfo(orderId) {
  const query = `
    UPDATE order_verifications 
    SET customer_name = NULL, customer_phone = NULL 
    WHERE order_id = ?
  `;
  
  try {
    const [result] = await pool.execute(query, [orderId]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error clearing customer info:', error);
    return { success: false, error: error.message };
  }
}

// Get all orders with filters
export async function getOrderVerifications(filters = {}) {
  let query = 'SELECT * FROM order_verifications WHERE 1=1';
  const values = [];
  
  if (filters.status) {
    query += ' AND status = ?';
    values.push(filters.status);
  }
  
  if (filters.customer_phone) {
    query += ' AND customer_phone = ?';
    values.push(filters.customer_phone);
  }
  
  query += ' ORDER BY created_at DESC';
  
  // Add LIMIT directly to query to avoid parameter issues
  if (filters.limit && Number.isInteger(filters.limit)) {
    query += ` LIMIT ${filters.limit}`;
  }
  
  try {
    const [rows] = await pool.execute(query, values);
    return rows;
  } catch (error) {
    console.error('Error getting order verifications:', error);
    return [];
  }
}
