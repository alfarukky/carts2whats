import { pool } from '../config/db.js';

/**
 * Phase 1: Analytics base = confirmed orders only
 * Revenue and metrics calculated from confirmed status
 */

// Get total confirmed orders
export async function getTotalOrders() {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM orders WHERE status = "confirmed"'
  );
  return rows[0].total;
}

// Get total confirmed revenue
export async function getTotalRevenue() {
  const [rows] = await pool.query(
    'SELECT SUM(total) as revenue FROM orders WHERE status = "confirmed"'
  );
  return parseFloat(rows[0].revenue) || 0;
}

// Get top 5 products by quantity sold (confirmed orders only)
export async function getTopProducts(limit = 5) {
  const [rows] = await pool.query(
    `SELECT 
      product_name_snapshot as name,
      SUM(quantity) as total_sold,
      SUM(line_total) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = "confirmed"
    GROUP BY oi.product_id, product_name_snapshot
    ORDER BY total_sold DESC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

// Get top 3 coupons by usage (confirmed orders only)
export async function getTopCoupons(limit = 3) {
  const [rows] = await pool.query(
    `SELECT 
      coupon_code,
      COUNT(*) as usage_count,
      SUM(discount) as total_discount
    FROM orders
    WHERE status = "confirmed" 
    AND coupon_code IS NOT NULL
    GROUP BY coupon_code
    ORDER BY usage_count DESC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

// Get conversion rate (initiated → confirmed)
export async function getConversionRate() {
  const [rows] = await pool.query(
    `SELECT 
      COUNT(*) as total_initiated,
      SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as total_confirmed
    FROM orders`
  );
  
  const { total_initiated, total_confirmed } = rows[0];
  const rate = total_initiated > 0 ? (total_confirmed / total_initiated) * 100 : 0;
  
  return {
    initiated: total_initiated,
    confirmed: total_confirmed,
    rate: rate.toFixed(2)
  };
}
