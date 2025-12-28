import { pool } from './db.js';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  
  try {
    await createAllTables();
    await createSuperAdmin();
    await seedPromoCards();
    console.log('✅ Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createAllTables() {
  // Admin users table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      badge ENUM('none', 'hot', 'sale', 'promo', 'new') DEFAULT 'none',
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      old_price DECIMAL(10,2) NULL,
      rating INT DEFAULT 5,
      reviews INT DEFAULT 0,
      image VARCHAR(255),
      is_popular TINYINT(1) DEFAULT 0,
      video_url VARCHAR(255) NULL,
      is_out_of_stock TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Coupons table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      type ENUM('percentage', 'fixed') NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      expires_at TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (code),
      INDEX (is_active)
    )
  `);

  // Order verifications table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS order_verifications (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(12) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      signature VARCHAR(16) NOT NULL,
      status ENUM('pending', 'verified', 'cancelled') DEFAULT 'pending',
      customer_name VARCHAR(100) NULL,
      customer_phone VARCHAR(20) NULL,
      coupon_code VARCHAR(20) NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (order_id),
      INDEX (status),
      INDEX (created_at),
      INDEX (customer_phone)
    )
  `);

  // Posts table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT,
      content LONGTEXT,
      meta_description TEXT,
      featured_image VARCHAR(255),
      og_image VARCHAR(255),
      type ENUM('article', 'event') DEFAULT 'article',
      event_date DATE NULL,
      event_end_date DATE NULL,
      event_location VARCHAR(255) NULL,
      whatsapp_template TEXT NULL,
      status ENUM('draft', 'published') DEFAULT 'draft',
      author_id INT,
      view_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (slug),
      INDEX (status),
      INDEX (type),
      INDEX (created_at)
    )
  `);

  // Promo cards table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS promo_cards (
      id INT PRIMARY KEY,
      title VARCHAR(255),
      subtitle VARCHAR(255),
      small_text VARCHAR(255),
      image VARCHAR(255),
      button_link VARCHAR(255)
    )
  `);

  console.log('✅ All tables created/verified');
}

async function createSuperAdmin() {
  const email = "admin@carts2whats.com";
  const password = "Admin123!";
  
  // Check if admin exists
  const [rows] = await pool.execute(
    "SELECT * FROM admin_users WHERE email = ?",
    [email]
  );

  if (rows.length > 0) {
    console.log("✓ Super admin already exists.");
    return;
  }

  // Create super admin
  const hashed = await bcrypt.hash(password, 10);

  await pool.execute(
    `INSERT INTO admin_users (first_name, last_name, email, password_hash)
     VALUES (?, ?, ?, ?)`,
    ["Super", "Admin", email, hashed]
  );

  console.log("✓ Super admin created:", email);
}

async function seedPromoCards() {
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM promo_cards");
  
  if (rows[0].count === 0) {
    await pool.execute(`
      INSERT INTO promo_cards (id, title, subtitle, small_text, image, button_link)
      VALUES 
        (1, 'Special Offer', 'Limited Time Deal', 'Save Big Today', 'product1.jpg', '/api/products'),
        (2, 'Fresh Products', 'Quality Guaranteed', 'Best Selection', 'product2.jpg', '/api/products'),
        (3, 'Great Savings', 'Everyday Low Prices', 'Shop Now', 'product3.jpg', '/api/products')
    `);
    console.log("✓ Default promo cards created");
  }
}
