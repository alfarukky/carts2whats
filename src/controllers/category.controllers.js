import { pool } from '../config/db.js';
import { sanitizeInput } from '../utils/helpers.utils.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for category image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `category-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const categoryImageUpload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and GIF images are allowed'));
    }
  }
});

// Show category management page
export async function showCategoryManagement(req, res) {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    
    res.render('categoryManagement', {
      title: 'Manage Categories – morishCart',
      categories,
      admin: req.session.admin,
    });
  } catch (err) {
    console.error('CATEGORY MANAGEMENT ERROR:', err);
    req.flash('error', 'Failed to load categories.');
    res.redirect('/');
  }
}

// Create new category
export async function createCategory(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      req.flash('error', 'Category name is required.');
      return res.redirect('/api/categories');
    }

    const sanitizedName = sanitizeInput(name).substring(0, 20);
    const imageName = req.file ? req.file.filename : null;

    await pool.query('INSERT INTO categories (name, image) VALUES (?, ?)', [sanitizedName, imageName]);

    req.flash('success', 'Category created successfully!');
    res.redirect('/api/categories');
  } catch (err) {
    console.error('CREATE CATEGORY ERROR:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'Category already exists.');
    } else {
      req.flash('error', 'Failed to create category.');
    }
    res.redirect('/api/categories');
  }
}

// Delete category (reassign products to "Others")
export async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.id;

    // Get category name
    const [category] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
    
    if (!category.length) {
      req.flash('error', 'Category not found.');
      return res.redirect('/api/categories');
    }

    const categoryName = category[0].name;

    // Prevent deletion of "Others" category
    if (categoryName === 'Others') {
      req.flash('error', 'Cannot delete the "Others" category.');
      return res.redirect('/api/categories');
    }

    // Reassign products to "Others" then delete category
    await pool.query('UPDATE products SET category = "Others" WHERE category = ?', [categoryName]);
    await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);

    req.flash('success', `Category "${categoryName}" deleted. Products moved to "Others".`);
    res.redirect('/api/categories');
  } catch (err) {
    console.error('DELETE CATEGORY ERROR:', err);
    req.flash('error', 'Failed to delete category.');
    res.redirect('/api/categories');
  }
}

// Toggle popular status
export async function togglePopular(req, res) {
  try {
    const categoryId = req.params.id;

    // Get current status
    const [category] = await pool.query('SELECT is_popular FROM categories WHERE id = ?', [categoryId]);
    
    if (!category.length) {
      req.flash('error', 'Category not found.');
      return res.redirect('/api/categories');
    }

    const newStatus = category[0].is_popular ? 0 : 1;

    // Check if we're trying to add more than 12 popular categories
    if (newStatus === 1) {
      const [popularCount] = await pool.query('SELECT COUNT(*) as count FROM categories WHERE is_popular = 1');
      if (popularCount[0].count >= 12) {
        req.flash('error', 'Maximum 12 categories can be marked as popular for homepage display.');
        return res.redirect('/api/categories');
      }
    }

    await pool.query('UPDATE categories SET is_popular = ? WHERE id = ?', [newStatus, categoryId]);

    req.flash('success', newStatus ? 'Category added to homepage!' : 'Category removed from homepage.');
    res.redirect('/api/categories');
  } catch (err) {
    console.error('TOGGLE POPULAR ERROR:', err);
    req.flash('error', 'Failed to update category status.');
    res.redirect('/api/categories');
  }
}

// Update category image only
export async function updateCategoryImage(req, res) {
  try {
    const categoryId = req.params.id;

    if (!req.file) {
      req.flash('error', 'Please select an image file.');
      return res.redirect('/api/categories');
    }

    // Get category to check if it exists
    const [category] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
    
    if (!category.length) {
      req.flash('error', 'Category not found.');
      return res.redirect('/api/categories');
    }

    // Update only the image field
    await pool.query('UPDATE categories SET image = ? WHERE id = ?', [req.file.filename, categoryId]);

    req.flash('success', `Image updated for "${category[0].name}" successfully!`);
    res.redirect('/api/categories');
  } catch (err) {
    console.error('UPDATE CATEGORY IMAGE ERROR:', err);
    req.flash('error', 'Failed to update category image.');
    res.redirect('/api/categories');
  }
}
