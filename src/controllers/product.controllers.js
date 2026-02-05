import { pool } from '../config/db.js';
import { badgeClasses } from '../utils/admin.utils.js';
import {
  sanitizeInput,
  validatePrice,
  validateRating,
  validateFileUpload,
} from '../utils/helpers.utils.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate structured data for SEO
function generateProductSchema(products) {
  return JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": product.name,
      "image": `/uploads/${product.image}`,
      "offers": {
        "@type": "Offer",
        "price": product.price.toString(),
        "priceCurrency": "NGN",
        "availability": product.is_out_of_stock 
          ? "https://schema.org/OutOfStock" 
          : "https://schema.org/InStock"
      }
    }))
  });
}

// Helper function to delete image files
async function deleteImageFile(filename) {
  if (!filename) return;

  const uploadsDir = path.join(__dirname, '../public/uploads');

  try {
    // Delete original file
    await fs.unlink(path.join(uploadsDir, filename));
  } catch (err) {
    console.error('Failed to delete image:', filename, err.message);
  }

  // Delete optimized file if it exists (starts with 'opt-')
  if (!filename.startsWith('opt-')) {
    try {
      const optFilename = 'opt-' + filename.replace(/\.\w+$/, '.webp');
      await fs.unlink(path.join(uploadsDir, optFilename));
    } catch (err) {
      // Optimized file might not exist, ignore error
    }
  }
}
/* ===============================
   PUBLIC + ADMIN: List Products
================================ */
export async function listProducts(req, res) {
  try {
    const { category, sort, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM products';
    let query = 'SELECT * FROM products';
    const params = [];
    const countParams = [];

    // FILTER: Category
    if (category) {
      query += ' WHERE category = ?';
      countQuery += ' WHERE category = ?';
      params.push(category);
      countParams.push(category);
    }

    // SORTING
    if (sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else {
      // Default: newest first
      query += ' ORDER BY id DESC';
    }

    // PAGINATION
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [totalResult] = await pool.query(countQuery, countParams);
    const [products] = await pool.query(query, params);
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    products.forEach((product) => {
      product.badgeClass =
        product.badge && badgeClasses[product.badge]
          ? badgeClasses[product.badge]
          : '';
    });

    const structuredData = generateProductSchema(products);
    const shouldAnimate = products.length < 50;

    res.render('product', {
      title: 'All Products – morishCart',
      products,
      categories,
      structuredData,
      shouldAnimate,
      badgeClasses,
      admin: req.session.admin || null,
      filters: { category, sort },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
    });
  } catch (err) {
    console.error('LIST PRODUCTS ERROR:', err);
    req.flash('error', 'Failed to load products.');
    return res.redirect('/');
  }
}

/* ===============================
   ADMIN: Show Add Product Form
================================ */
export function showAddProductForm(req, res) {
  pool.query('SELECT * FROM categories ORDER BY name')
    .then(([categories]) => {
      res.render('addProduct', {
        title: 'Add New Product – morishCart',
        categories,
        admin: req.session.admin,
      });
    })
    .catch(err => {
      console.error('Categories fetch error:', err);
      res.render('addProduct', {
        title: 'Add New Product – morishCart',
        categories: [],
        admin: req.session.admin,
      });
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
    // Check if file was uploaded
    if (!req.file) {
      req.flash('error', 'Product image is required.');
      return res.redirect('/api/products/add');
    }

    // Validate required fields
    if (!name || name.trim().length === 0) {
      req.flash('error', 'Product name is required.');
      return res.redirect('/api/products/add');
    }

    if (!category) {
      req.flash('error', 'Product category is required.');
      return res.redirect('/api/products/add');
    }

    // Validate price
    if (!price || !validatePrice(price)) {
      req.flash('error', 'Valid price is required.');
      return res.redirect('/api/products/add');
    }

    // Validate rating if provided
    if (rating && !validateRating(rating)) {
      req.flash('error', 'Rating must be between 1 and 5.');
      return res.redirect('/api/products/add');
    }

    // Validate file upload
    const fileValidation = validateFileUpload(req.file);
    if (!fileValidation.valid) {
      req.flash('error', fileValidation.error);
      return res.redirect('/api/products/add');
    }

    // Validate video URL if provided
    if (video_url && !video_url.startsWith('http')) {
      req.flash('error', 'Video URL must be a valid link.');
      return res.redirect('/api/products/add');
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name).substring(0, 100);
    const sanitizedDescription = description
      ? sanitizeInput(description).substring(0, 1000)
      : '';
    const sanitizedVideoUrl = video_url ? sanitizeInput(video_url) : null;

    // Validate and clamp rating (0-5, 1 decimal place)
    const validRating = rating
      ? Math.max(0, Math.min(5, Math.round(parseFloat(rating) * 10) / 10))
      : 0;

    // Validate and clamp reviews (0-10000, integer only)
    const validReviews = reviews
      ? Math.max(0, Math.min(10000, parseInt(reviews)))
      : 0;

    const queryParams = [
      sanitizedName,
      category,
      badge || 'none',
      sanitizedDescription,
      parseFloat(price),
      old_price ? parseFloat(old_price) : null,
      validRating,
      validReviews,
      req.file.optimizedName || req.file.filename,
      sanitizedVideoUrl,
      is_out_of_stock === '1' ? 1 : 0,
    ];

    await pool.query(
      `INSERT INTO products 
      (name, category, badge, description, price, old_price, rating, reviews, image, video_url, is_out_of_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      queryParams,
    );

    req.flash('success', 'Product added successfully!');
    res.redirect('/api/products');
  } catch (err) {
    console.error('ADD PRODUCT ERROR:', err);
    req.flash('error', 'Failed to add product.');
    res.redirect('/api/products/add');
  }
}

/* ===============================
   ADMIN: Show Edit Product Form
================================ */
export async function showEditProductForm(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [
      req.params.id,
    ]);

    if (!rows.length) {
      req.flash('error', 'Product not found.');
      return res.redirect('/api/products');
    }

    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');

    res.render('editProduct', {
      title: 'Edit Product – morishCart',
      product: rows[0],
      categories,
      admin: req.session.admin,
    });
  } catch (err) {
    console.error('SHOW EDIT ERROR:', err);
    req.flash('error', 'Cannot load product.');
    res.redirect('back');
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

    // Check if product exists and get current image
    const [existingProduct] = await pool.query(
      'SELECT image FROM products WHERE id = ?',
      [req.params.id],
    );

    if (!existingProduct.length) {
      req.flash('error', 'Product not found.');
      return res.redirect('/api/products');
    }

    // Validate required fields
    if (!name || name.trim().length === 0) {
      req.flash('error', 'Product name is required.');
      return res.redirect('back');
    }

    if (!category) {
      req.flash('error', 'Product category is required.');
      return res.redirect('back');
    }

    // Validate price
    if (!price || !validatePrice(price)) {
      req.flash('error', 'Valid price is required.');
      return res.redirect('back');
    }

    // Validate rating if provided
    if (rating && !validateRating(rating)) {
      req.flash('error', 'Rating must be between 1 and 5.');
      return res.redirect('back');
    }

    // Validate file upload if provided
    if (req.file) {
      const fileValidation = validateFileUpload(req.file);
      if (!fileValidation.valid) {
        req.flash('error', fileValidation.error);
        return res.redirect('back');
      }
    }

    // Validate video URL if provided
    if (video_url && !video_url.startsWith('http')) {
      req.flash('error', 'Video URL must be a valid link.');
      return res.redirect('back');
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name).substring(0, 100);
    const sanitizedDescription = description
      ? sanitizeInput(description).substring(0, 1000)
      : '';
    const sanitizedVideoUrl = video_url ? sanitizeInput(video_url) : null;

    // Validate and clamp rating (0-5, 1 decimal place)
    const validRating = rating
      ? Math.max(0, Math.min(5, Math.round(parseFloat(rating) * 10) / 10))
      : 0;

    // Validate and clamp reviews (0-10000, integer only)
    const validReviews = reviews
      ? Math.max(0, Math.min(10000, parseInt(reviews)))
      : 0;

    let query = `
      UPDATE products
      SET name = ?, category = ?, badge = ?, description = ?,
          price = ?, old_price = ?, rating = ?, reviews = ?, video_url = ?, is_out_of_stock = ?
    `;

    const params = [
      sanitizedName,
      category,
      badge,
      sanitizedDescription,
      parseFloat(price),
      old_price ? parseFloat(old_price) : null,
      validRating,
      validReviews,
      sanitizedVideoUrl,
      is_out_of_stock === '1' ? 1 : 0,
    ];

    // If new image uploaded, delete old image and update query
    if (req.file) {
      // Delete old image file
      await deleteImageFile(existingProduct[0].image);

      query += ', image = ?';
      params.push(req.file.optimizedName || req.file.filename);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);

    req.flash('success', 'Product updated successfully!');
    res.redirect('/api/products');
  } catch (err) {
    console.error('UPDATE PRODUCT ERROR:', err);
    req.flash('error', 'Failed to update product.');
    res.redirect('back');
  }
}

/* ===============================
   ADMIN: Delete Product
================================ */
export async function deleteProduct(req, res) {
  try {
    // Check if product exists and get image filename
    const [product] = await pool.query(
      'SELECT image FROM products WHERE id = ?',
      [req.params.id],
    );

    if (!product.length) {
      req.flash('error', 'Product not found.');
      return res.redirect('/api/products');
    }

    // Delete image file before deleting product
    await deleteImageFile(product[0].image);

    // Delete product from database
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

    req.flash('success', 'Product deleted successfully.');
    res.redirect('/api/products');
  } catch (err) {
    console.error('DELETE PRODUCT ERROR:', err);
    req.flash('error', 'Deletion failed.');
    res.redirect('/api/products');
  }
}

/* ===============================
   ADMIN: Toggle Popular
================================ */
export async function togglePopular(req, res) {
  try {
    // Check if product exists and get current status
    const [product] = await pool.query(
      'SELECT is_popular FROM products WHERE id = ?',
      [req.params.id],
    );

    if (!product.length) {
      req.flash('error', 'Product not found.');
      return res.redirect('/api/products');
    }

    const newStatus = product[0].is_popular ? 0 : 1;

    await pool.query('UPDATE products SET is_popular = ? WHERE id = ?', [
      newStatus,
      req.params.id,
    ]);

    req.flash(
      'success',
      newStatus
        ? 'Product added to Popular Section!'
        : 'Product removed from Popular Section.',
    );

    res.redirect('/api/products');
  } catch (err) {
    console.error('TOGGLE POPULAR ERROR:', err);
    req.flash('error', 'Failed to update popular status.');
    res.redirect('/api/products');
  }
}

/* ===============================
   ADMIN: Toggle Stock Status
================================ */
export async function toggleStock(req, res) {
  try {
    // Check if product exists and get current status
    const [product] = await pool.query(
      'SELECT is_out_of_stock FROM products WHERE id = ?',
      [req.params.id],
    );

    if (!product.length) {
      req.flash('error', 'Product not found.');
      return res.redirect('/api/products');
    }

    const newStatus = product[0].is_out_of_stock ? 0 : 1;

    await pool.query('UPDATE products SET is_out_of_stock = ? WHERE id = ?', [
      newStatus,
      req.params.id,
    ]);

    req.flash(
      'success',
      newStatus
        ? 'Product marked as Out of Stock!'
        : 'Product restocked successfully!',
    );

    res.redirect('/api/products');
  } catch (err) {
    console.error('TOGGLE STOCK ERROR:', err);
    req.flash('error', 'Failed to update stock status.');
    res.redirect('/api/products');
  }
}
