import {
  getAllCoupons,
  createCoupon,
  updateCouponStatus,
  deleteCoupon,
  validateCoupon,
} from "../utils/coupon.utils.js";

// List all coupons
export const listCoupons = async (req, res) => {
  const coupons = await getAllCoupons().catch(() => []);

  res.render("couponsList", {
    title: "Manage Coupons",
    coupons,
  });
};

// Show create coupon form
export const showCreateForm = (req, res) => {
  res.render("createCoupon", {
    title: "Create Coupon",
  });
};

// Create new coupon
export const createNewCoupon = async (req, res) => {
  try {
    const { code, type, value, min_order_amount, expires_at } = req.body;

    if (!code || !type || !value) {
      req.flash("error", "Code, type, and value are required");
      return res.redirect("/api/admin/coupons/create");
    }

    const result = await createCoupon({
      code,
      type,
      value: parseFloat(value),
      min_order_amount: parseFloat(min_order_amount) || 0,
      expires_at: expires_at || null,
    });

    if (result.success) {
      req.flash("success", "Coupon created successfully");
      res.redirect("/api/admin/coupons");
    } else {
      req.flash("error", result.error);
      res.redirect("/api/admin/coupons/create");
    }
  } catch (error) {
    console.error("Error in createNewCoupon:", error);
    req.flash("error", "Error creating coupon");
    res.redirect("/api/admin/coupons/create");
  }
};

// Toggle coupon status
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await updateCouponStatus(id, is_active === "1");

    if (result.success) {
      req.flash(
        "success",
        `Coupon ${is_active === "1" ? "enabled" : "disabled"} successfully`,
      );
    } else {
      req.flash("error", "Error updating coupon status");
    }

    res.redirect("/api/admin/coupons");
  } catch (error) {
    console.error("Error in toggleCouponStatus:", error);
    req.flash("error", "Error updating coupon");
    res.redirect("/api/admin/coupons");
  }
};

// Delete coupon
export const removeCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteCoupon(id);

    if (result.success) {
      req.flash("success", "Coupon deleted successfully");
    } else {
      req.flash("error", "Error deleting coupon");
    }

    res.redirect("/api/admin/coupons");
  } catch (error) {
    console.error("Error in removeCoupon:", error);
    req.flash("error", "Error deleting coupon");
    res.redirect("/api/admin/coupons");
  }
};

// Validate coupon (API endpoint)
export const validateCouponCode = async (req, res) => {
  try {
    const { code, total } = req.body;

    if (!code || !total) {
      return res.json({ valid: false, message: "Code and total are required" });
    }

    const result = await validateCoupon(code, parseFloat(total));
    res.json(result);
  } catch (error) {
    console.error("Error in validateCouponCode:", error);
    res.json({ valid: false, message: "Error validating coupon" });
  }
};
