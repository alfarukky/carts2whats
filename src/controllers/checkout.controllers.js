import {
  generateOrderId,
  createOrderVerification,
} from "../utils/orderVerification.utils.js";

export const showCheckout = (req, res) => {
  res.render("checkout", {
    title: "Order Confirmation - MorishCart",
  });
};

export const createOrder = async (req, res) => {
  try {
    const { totalAmount, couponCode, discountAmount } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid total amount",
      });
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // Prepare coupon data if provided
    const couponData = couponCode
      ? {
          code: couponCode,
          discount: parseFloat(discountAmount) || 0,
        }
      : null;

    // Create verification record
    const result = await createOrderVerification(
      orderId,
      parseFloat(totalAmount),
      couponData,
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to create order verification",
      });
    }

    // Return order details for WhatsApp message
    res.json({
      success: true,
      orderId: result.orderId,
      verificationCode: result.signature.substring(0, 4).toUpperCase(),
      totalAmount: parseFloat(totalAmount),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
