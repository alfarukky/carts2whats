import bcrypt from 'bcrypt';

export async function createSuperAdmin(connection) {
  const email = 'admin@carts2whats.com';
  const password = 'Admin123!';

  // Check if admin exists
  const [rows] = await connection.query(
    'SELECT * FROM admin_users WHERE email = ?',
    [email]
  );

  if (rows.length > 0) {
    console.log('✓ Super admin already exists.');
    return;
  }

  // Create super admin
  const hashed = await bcrypt.hash(password, 10);

  await connection.query(
    `INSERT INTO admin_users (first_name, last_name, email, password_hash)
     VALUES (?, ?, ?, ?)`,
    ['Super', 'Admin', email, hashed]
  );

  console.log('✓ Super admin created:', email);
}
