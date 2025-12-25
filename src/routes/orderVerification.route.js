import { Router } from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import {
  verifyOrder,
  updateOrder,
  clearCustomer,
  listOrders,
  quickLookup,
} from "../controllers/orderVerification.controllers.js";

const orderVerificationRoute = Router();

// List all orders
orderVerificationRoute.get("/", isLoggedIn, listOrders);

// Quick order lookup
orderVerificationRoute.post("/lookup", isLoggedIn, quickLookup);

// Verify specific order
orderVerificationRoute.get("/:orderId/verify", isLoggedIn, verifyOrder);

// Update order
orderVerificationRoute.post("/:orderId/update", isLoggedIn, updateOrder);

// Clear customer info
orderVerificationRoute.post(
  "/:orderId/clear-customer",
  isLoggedIn,
  clearCustomer,
);

export default orderVerificationRoute;
