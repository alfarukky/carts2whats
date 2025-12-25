import { Router } from "express";
import { showCheckout, createOrder } from '../controllers/checkout.controllers.js';

const checkoutRoute = Router();

checkoutRoute.get("/", showCheckout);
checkoutRoute.post("/create", createOrder);

export default checkoutRoute;
