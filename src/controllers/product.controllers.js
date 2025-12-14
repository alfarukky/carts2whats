import { title } from "process";
import { pool } from "../config/db.js";
import { badgeClasses } from "../utils/admin.utils.js";

// PUBLIC + ADMIN: Show all products
export async function listProducts(req, res) {
  try {
    const [products] = await pool.query(
      "SELECT * FROM products ORDER BY id DESC",
    );

    res.render("product", {
      title: "All Products – morishCart",
      products,
      badgeClasses,
      admin: req.session.admin || null,
    });
  } catch (err) {
    console.error("LIST PRODUCTS ERROR:", err);
    req.flash("error", "Failed to load products.");
    return res.redirect("/");
  }
}

// ADMIN: Show add form
export function showAddProductForm(req, res) {
  res.render("addProduct", {
    title: "Add New Product – morishCart",
    admin: req.session.admin,
  });
}

// ADMIN: Add new product
export async function addProduct(req, res) {
  try {
    const {
      name,
      category,
      badge,
      description,
      price,
      old_price,
      rating,
      reviews,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    await pool.query(
      `
      INSERT INTO products 
      (name, category, badge, description, price, old_price, rating, reviews, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        category,
        badge,
        description,
        price,
        old_price,
        rating,
        reviews,
        req.file.filename,
      ],
    );

    req.flash("success", "Product added successfully!");
    res.redirect("/api/products");
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    req.flash("error", "Failed to add product.");
    return res.redirect("back");
  }
}

// ADMIN: Show edit form
export async function showEditProductForm(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (!rows.length) {
      req.flash("error", "Product not found.");
      return res.redirect("/api/products");
    }

    res.render("editProduct", {
      title: "Edit Product – morishCart",
      product: rows[0],
      admin: req.session.admin,
    });
  } catch (err) {
    console.error("SHOW EDIT ERROR:", err);
    req.flash("error", "Cannot load product.");
    return res.redirect("back");
  }
}

// ADMIN: Update product
export async function updateProduct(req, res) {
  try {
    const {
      name,
      category,
      badge,
      description,
      price,
      old_price,
      rating,
      reviews,
    } = req.body;

    const id = req.params.id;

    let query = `
      UPDATE products 
      SET name = ?, category = ?, badge = ?, description = ?, 
          price = ?, old_price = ?, rating = ?, reviews = ?
    `;

    const params = [
      name,
      category,
      badge,
      description,
      price,
      old_price || null,
      rating,
      reviews,
    ];

    if (req.file) {
      query += ", image = ?";
      params.push(req.file.filename);
    }

    query += " WHERE id = ?";
    params.push(id);

    await pool.query(query, params);

    req.flash("success", "Product updated successfully!");

    // Redirect to product list (admin workflow)
    return res.redirect("/api/products");
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    req.flash("error", "Failed to update product.");
    return res.redirect("back");
  }
}

// ADMIN: Delete product
export async function deleteProduct(req, res) {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);

    req.flash("success", "Product deleted sucessfully.");
    return res.redirect("/api/products");
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    req.flash("error", "Deletion failed.");
    return res.redirect("back");
  }
}

// ADMIN: Mark/Unmark product as popular
export async function togglePopular(req, res) {
  try {
    const id = req.params.id;

    const [[product]] = await pool.query(
      "SELECT is_popular FROM products WHERE id = ?",
      [id],
    );

    const newStatus = product.is_popular ? 0 : 1;

    await pool.query("UPDATE products SET is_popular = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    req.flash(
      "success",
      newStatus ? "Product added to Popular Section!" : "Removed from Popular.",
    );

    return res.redirect("/api/products");
  } catch (err) {
    console.error("TOGGLE POPULAR ERROR:", err);
    req.flash("error", "Failed to update popular status.");
    return res.redirect("back");
  }
}
