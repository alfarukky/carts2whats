import { pool } from "../config/db.js";
import { badgeClasses } from "../utils/admin.utils.js";

/* ===============================
   PUBLIC + ADMIN: List Products
================================ */
export async function listProducts(req, res) {
  try {
    const { category, sort } = req.query;

    let query = "SELECT * FROM products";
    const params = [];

    // FILTER: Category
    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    // SORTING
    if (sort === "price_asc") {
      query += " ORDER BY price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY price DESC";
    } else {
      // Default: newest first
      query += " ORDER BY id DESC";
    }

    const [products] = await pool.query(query, params);

    products.forEach(product => {
      product.badgeClass = product.badge && badgeClasses[product.badge] ? badgeClasses[product.badge] : '';
    });

    res.render("product", {
      title: "All Products – morishCart",
      products,
      badgeClasses,
      admin: req.session.admin || null,
      filters: { category, sort }, // 👈 important
    });
  } catch (err) {
    console.error("LIST PRODUCTS ERROR:", err);
    req.flash("error", "Failed to load products.");
    return res.redirect("/");
  }
}

/* ===============================
   ADMIN: Show Add Product Form
================================ */
export function showAddProductForm(req, res) {
  res.render("addProduct", {
    title: "Add New Product – morishCart",
    admin: req.session.admin,
  });
}

/* ===============================
   ADMIN: Add Product
================================ */
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
      video_url,
      is_out_of_stock,
    } = req.body;

    if (!name || !category || !price || !req.file) {
      req.flash("error", "Please fill all required fields.");
      return res.redirect("back");
    }

    if (video_url && !video_url.startsWith("http")) {
      req.flash("error", "Video URL must be a valid link.");
      return res.redirect("back");
    }

    await pool.query(
      `
      INSERT INTO products 
      (name, category, badge, description, price, old_price, rating, reviews, image, video_url, is_out_of_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        category,
        badge || "none",
        description,
        price,
        old_price || null,
        rating || 0,
        reviews || 0,
        req.file.optimizedName || req.file.filename,
        video_url || null,
        is_out_of_stock === "1" ? 1 : 0,
      ],
    );

    req.flash("success", "Product added successfully!");
    res.redirect("/api/products");
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    req.flash("error", "Failed to add product.");
    res.redirect("back");
  }
}

/* ===============================
   ADMIN: Show Edit Product Form
================================ */
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
    res.redirect("back");
  }
}

/* ===============================
   ADMIN: Update Product
================================ */
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
      video_url,
      is_out_of_stock,
    } = req.body;

    if (video_url && !video_url.startsWith("http")) {
      req.flash("error", "Video URL must be a valid link.");
      return res.redirect("back");
    }

    let query = `
      UPDATE products
      SET name = ?, category = ?, badge = ?, description = ?,
          price = ?, old_price = ?, rating = ?, reviews = ?, video_url = ?, is_out_of_stock = ?
    `;

    const params = [
      name,
      category,
      badge,
      description,
      price,
      old_price || null,
      rating || 0,
      reviews || 0,
      video_url || null,
      is_out_of_stock === "1" ? 1 : 0,
    ];

    if (req.file) {
      query += ", image = ?";
      params.push(req.file.optimizedName || req.file.filename);
    }

    query += " WHERE id = ?";
    params.push(req.params.id);

    await pool.query(query, params);

    req.flash("success", "Product updated successfully!");
    res.redirect("/api/products");
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    req.flash("error", "Failed to update product.");
    res.redirect("back");
  }
}

/* ===============================
   ADMIN: Delete Product
================================ */
export async function deleteProduct(req, res) {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);

    req.flash("success", "Product deleted successfully.");
    res.redirect("/api/products");
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    req.flash("error", "Deletion failed.");
    res.redirect("back");
  }
}

/* ===============================
   ADMIN: Toggle Popular
================================ */
export async function togglePopular(req, res) {
  try {
    const [[product]] = await pool.query(
      "SELECT is_popular FROM products WHERE id = ?",
      [req.params.id],
    );

    const newStatus = product.is_popular ? 0 : 1;

    await pool.query("UPDATE products SET is_popular = ? WHERE id = ?", [
      newStatus,
      req.params.id,
    ]);

    req.flash(
      "success",
      newStatus
        ? "Product added to Popular Section!"
        : "Product removed from Popular Section.",
    );

    res.redirect("/api/products");
  } catch (err) {
    console.error("TOGGLE POPULAR ERROR:", err);
    req.flash("error", "Failed to update popular status.");
    res.redirect("back");
  }
}

/* ===============================
   ADMIN: Toggle Stock Status
================================ */
export async function toggleStock(req, res) {
  try {
    const [[product]] = await pool.query(
      "SELECT is_out_of_stock FROM products WHERE id = ?",
      [req.params.id],
    );

    const newStatus = product.is_out_of_stock ? 0 : 1;

    await pool.query("UPDATE products SET is_out_of_stock = ? WHERE id = ?", [
      newStatus,
      req.params.id,
    ]);

    req.flash(
      "success",
      newStatus
        ? "Product marked as Out of Stock!"
        : "Product restocked successfully!",
    );

    res.redirect("/api/products");
  } catch (err) {
    console.error("TOGGLE STOCK ERROR:", err);
    req.flash("error", "Failed to update stock status.");
    res.redirect("back");
  }
}
