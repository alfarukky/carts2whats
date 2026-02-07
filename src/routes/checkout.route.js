import { Router } from "express";
import { showCheckout, createOrder } from '../controllers/checkout.controllers.js';
import rateLimit from 'express-rate-limit';

const checkoutRoute = Router();

// Phase 2: Rate limiting (10 orders per minute per IP)
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many orders. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

checkoutRoute.get("/", showCheckout);
checkoutRoute.post("/create", checkoutLimiter, createOrder);

export default checkoutRoute;
