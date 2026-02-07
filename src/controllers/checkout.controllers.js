import {
  generateOrderId,
  createOrderVerification,
} from "../utils/orderVerification.utils.js";
import { pool } from "../config/db.js";
import "dotenv/config";

const MAX_QUANTITY = 100; // Phase 2: Abuse prevention

export const showCheckout = (req, res) => {
  res.render("checkout", {
    title: "Order Confirmation - MorishCart",
    whatsappNumber: process.env.WHATSAPP_NUMBER,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { items, couponCode } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Phase 1: Generate cart hash for idempotency
    const cartHash = items
      .map(i => `${i.productId || i.id}:${i.quantity}`)
      .sort()
      .join('|');

    // Phase 1: Check for duplicate order (within last 60 seconds)
    const [existingOrders] = await pool.query(
      `SELECT order_id, total FROM orders 
       WHERE cart_hash = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
       LIMIT 1`,
      [cartHash]
    );

    if (existingOrders.length > 0) {
      console.log('⚠️ Duplicate order prevented:', cartHash);
      return res.json({
        success: true,
        orderId: existingOrders[0].order_id,
        verificationCode: existingOrders[0].order_id.substring(0, 4).toUpperCase(),
        totalAmount: parseFloat(existingOrders[0].total),
        duplicate: true
      });
    }

    // Server-side validation and calculation
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = item.productId || item.id;
      const quantity = parseInt(item.quantity);

      // Phase 2: Quantity validation (MAX_QUANTITY guardrail)
      if (quantity <= 0 || quantity > MAX_QUANTITY) {
        return res.status(400).json({
          success: false,
          error: `Invalid quantity for product ${productId}. Max ${MAX_QUANTITY} per item.`,
        });
      }

      // Fetch product from database (source of truth)
      const [products] = await pool.query(
        'SELECT id, name, category, price FROM products WHERE id = ?',
        [productId]
      );

      if (products.length === 0) {
        return res.status(400).json({
          success: false,
          error: `Product ${productId} not found`,
        });
      }

      const product = products[0];
      const price = parseFloat(product.price);
      const lineTotal = price * quantity;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        variantId: null,
        productName: product.name,
        productCategory: product.category, // Phase 2: Snapshot category
        variantName: null,
        quantity,
        price,
        lineTotal
      });
    }

    // Calculate discount (if coupon provided)
    let discount = 0;
    if (couponCode && discountAmount) {
      // Re-validate coupon server-side
      const [coupons] = await pool.query(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = 1 
         AND (expires_at IS NULL OR expires_at > NOW())`,
        [couponCode]
      );

      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (subtotal >= coupon.min_order_amount) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100;
          } else {
            discount = coupon.value;
          }
          discount = Math.min(discount, subtotal);
        }
      }
    }

    const total = subtotal - discount;

    // Generate unique order ID
    const orderId = generateOrderId();

    // Phase 1: Insert into orders table (analytics base)
    await pool.query(
      `INSERT INTO orders (order_id, cart_hash, subtotal, discount, total, coupon_code, status)
       VALUES (?, ?, ?, ?, ?, ?, 'initiated')`,
      [orderId, cartHash, subtotal, discount, total, couponCode || null]
    );

    // Phase 1: Insert order items (analytics ready)
    for (const item of validatedItems) {
      await pool.query(
        `INSERT INTO order_items 
         (order_id, product_id, variant_id, product_name_snapshot, 
          product_category_snapshot, variant_name_snapshot, quantity, 
          price_snapshot, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.variantId,
          item.productName,
          item.productCategory,
          item.variantName,
          item.quantity,
          item.price,
          item.lineTotal
        ]
      );
    }

    // Backward compatibility: Create legacy order_verification
    await createOrderVerification(
      orderId,
      total,
      couponCode ? { code: couponCode, discount } : null
    );

    console.log('✓ Order created:', orderId, 'Total:', total);

    // Build WhatsApp message server-side
    const whatsappMessage = buildWhatsAppMessage(
      orderId,
      validatedItems,
      subtotal,
      discount,
      total,
      couponCode
    );

    // Return order details
    res.json({
      success: true,
      orderId,
      verificationCode: orderId.substring(0, 4).toUpperCase(),
      totalAmount: parseFloat(total),
      whatsappMessage,
    });

  } catch (error) {
    // Phase 1: Structured error logging
    console.error("❌ Order creation failed:", {
      error: error.message,
      ip: req.ip,
      itemCount: req.body.items?.length
    });
    
    res.status(500).json({
      success: false,
      error: "Failed to create order. Please try again.",
    });
  }
};

// Helper: Build WhatsApp message server-side
function buildWhatsAppMessage(orderId, items, subtotal, discount, total, couponCode) {
  const date = new Date().toLocaleDateString();
  
  let msg = `🛒 MorishCart Order\n`;
  msg += `Order ID: ${orderId}\n`;
  msg += `Date: ${date}\n\n`;
  msg += `*ITEMS:*\n`;
  
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.productName} × ${item.quantity} — ₦${item.lineTotal.toFixed(2)}\n`;
  });
  
  msg += `\n----------------------\n`;
  msg += `Subtotal: ₦${subtotal.toFixed(2)}\n`;
  
  if (discount > 0) {
    msg += `Coupon: ${couponCode} (-₦${discount.toFixed(2)})\n`;
  }
  
  msg += `*TOTAL: ₦${total.toFixed(2)}*\n`;
  msg += `📋 Ref: ${orderId.substring(0, 4).toUpperCase()}\n`;
  msg += `----------------------\n\n`;
  msg += `Delivery Required: Yes / No\n`;
  msg += `Payment Method: Cash / Transfer\n\n`;
  msg += `Please confirm availability.`;
  
  return msg;
}
