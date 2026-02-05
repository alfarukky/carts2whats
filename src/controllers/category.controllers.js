import { pool } from '../config/db.js';
import { sanitizeInput } from '../utils/helpers.utils.js';

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

    const sanitizedName = sanitizeInput(name).substring(0, 100);

    await pool.query('INSERT INTO categories (name) VALUES (?)', [sanitizedName]);

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
