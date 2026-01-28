import { Router } from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { validateCSRF } from "../middleware/csrf.middleware.js";
import {
  listCoupons,
  showCreateForm,
  createNewCoupon,
  toggleCouponStatus,
  removeCoupon,
  validateCouponCode,
} from "../controllers/coupon.controllers.js";

const couponRoute = Router();

// Admin routes (require authentication)
couponRoute.get("/", isLoggedIn, listCoupons);
couponRoute.get("/create", isLoggedIn, showCreateForm);
couponRoute.post("/create", isLoggedIn, validateCSRF, createNewCoupon);
couponRoute.post("/:id/toggle", isLoggedIn, validateCSRF, toggleCouponStatus);
couponRoute.post("/:id/delete", isLoggedIn, validateCSRF, removeCoupon);

// Public API route for coupon validation
couponRoute.post("/validate", validateCouponCode);

export default couponRoute;
