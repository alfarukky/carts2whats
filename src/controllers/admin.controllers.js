import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

// Show registration page
export function showRegisterPage(req, res) {
  res.render("register");
}

// Handle admin registration
export async function registerAdmin(req, res) {
  try {
    const { firstName, lastName, email, adminCode, password, confirmPassword } =
      req.body;

    // Validations
    if (
      !firstName ||
      !lastName ||
      !email ||
      !adminCode ||
      !password ||
      !confirmPassword
    ) {
      req.flash("error", "All fields are required.");
      return res.redirect("/api/auth/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/api/auth/register");
    }

    // Admin Code Check
    if (adminCode !== process.env.ADMIN_ACCESS_CODE) {
      req.flash("error", "Invalid admin access code.");
      return res.redirect("/api/auth/register");
    }

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT * FROM admin_users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      req.flash("error", "Email already exists.");
      return res.redirect("/api/auth/register");
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await pool.query(
      `INSERT INTO admin_users (first_name, last_name, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword],
    );

    // Success message
    req.flash("success", "Admin account created successfully! Please log in.");
    return res.redirect("/api/auth/login");
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    req.flash("error", "Something went wrong during registration.");
    return res.redirect("/api/auth/register");
  }
}

// Show login page
export function showLoginPage(req, res) {
  res.render("login");
}

// Handle admin login
export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/api/auth/login");
    }

    // Check if user exists
    const [rows] = await pool.query(
      "SELECT * FROM admin_users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/api/auth/login");
    }

    const admin = rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/api/auth/login");
    }

    // Save admin session
    req.session.admin = {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
    };

    req.flash("success", `Welcome back ${admin.first_name}!`);
    return res.redirect("/");
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    req.flash("error", "Something went wrong during login.");
    return res.redirect("/api/auth/login");
  }
}

// // Handle logout
export function logoutAdmin(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      req.flash("error", "Failed to log out.");
      return res.redirect("/");
    }

    res.clearCookie("connect.sid"); // extra safety
    return res.redirect("/api/auth/login");
  });
}
