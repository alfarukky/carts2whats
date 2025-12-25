import { pool } from '../config/db.js';

// Get all coupons
export async function getAllCoupons() {
  const query = 'SELECT * FROM coupons ORDER BY created_at DESC';
  
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error getting coupons:', error);
    return [];
  }
}

// Get coupon by code
export async function getCouponByCode(code) {
  const query = 'SELECT * FROM coupons WHERE code = ? AND is_active = 1';
  
  try {
    const [rows] = await pool.execute(query, [code.toUpperCase()]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    return null;
  }
}

// Validate coupon
export async function validateCoupon(code, orderTotal) {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }
  
  // Check expiry
  if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check minimum order amount
  if (orderTotal < coupon.min_order_amount) {
    return { 
      valid: false, 
      message: `Minimum order amount is $${coupon.min_order_amount}` 
    };
  }
  
  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderTotal * coupon.value) / 100;
  } else {
    discount = Math.min(coupon.value, orderTotal); // Don't exceed order total
  }
  
  // Ensure final total is never negative or zero
  const finalTotal = orderTotal - discount;
  if (finalTotal <= 0) {
    // Adjust discount to leave minimum $0.01
    discount = orderTotal - 0.01;
  }
  
  return {
    valid: true,
    coupon,
    discount: parseFloat(discount.toFixed(2)),
    message: `Coupon applied! You saved $${discount.toFixed(2)}`
  };
}

// Create coupon
export async function createCoupon(couponData) {
  const { code, type, value, min_order_amount, expires_at } = couponData;
  
  const query = `
    INSERT INTO coupons (code, type, value, min_order_amount, expires_at) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  try {
    const [result] = await pool.execute(query, [
      code.toUpperCase(),
      type,
      value,
      min_order_amount || 0,
      expires_at || null
    ]);
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Coupon code already exists' };
    }
    return { success: false, error: error.message };
  }
}

// Update coupon status
export async function updateCouponStatus(id, isActive) {
  const query = 'UPDATE coupons SET is_active = ? WHERE id = ?';
  
  try {
    const [result] = await pool.execute(query, [isActive, id]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error updating coupon status:', error);
    return { success: false, error: error.message };
  }
}

// Delete coupon
export async function deleteCoupon(id) {
  const query = 'DELETE FROM coupons WHERE id = ?';
  
  try {
    const [result] = await pool.execute(query, [id]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, error: error.message };
  }
}
