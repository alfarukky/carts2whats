import { Router } from "express";
import {
  registerAdmin,
  showRegisterPage,
  showLoginPage,
  loginAdmin,
  logoutAdmin,
} from "../controllers/admin.controllers.js";

const adminRoute = Router();

// Show form
adminRoute.get("/register", showRegisterPage);

// Handle form submission
adminRoute.post("/register", registerAdmin);

// LOGIN
adminRoute.get("/login", showLoginPage);
adminRoute.post("/login", loginAdmin);

// LOGOUT
adminRoute.post("/logout", logoutAdmin);

export default adminRoute;
