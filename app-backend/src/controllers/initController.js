import { pool } from '../config/dbConfig.js';

export const initDatabase = async (req, res) => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'store_owner') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        owner_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_user_id) REFERENCES users(id)
      );
    `);
    
    // Create ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        user_id INT NOT NULL,
        rating DECIMAL(3,2) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    
    // Check if users table is empty
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    
    // Add sample users if table is empty
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO users (name, email, address, password, role) VALUES
        ('Test User', 'user@example.com', '123 User St', 'password123', 'user'),
        ('Admin User', 'admin@example.com', '456 Admin Ave', 'admin123', 'admin'),
        ('Store Owner', 'store@example.com', '789 Store Blvd', 'store123', 'store_owner');
      `);
      
      // Add a sample store for the store owner
      await pool.query(`
        INSERT INTO stores (name, email, address, owner_user_id) 
        SELECT 'Sample Store', 'store@example.com', '789 Store Blvd', id 
        FROM users WHERE email = 'store@example.com';
      `);
      
      // Add some sample ratings
      await pool.query(`
        INSERT INTO ratings (store_id, user_id, rating, comment)
        SELECT 
          (SELECT id FROM stores LIMIT 1),
          (SELECT id FROM users WHERE email = 'user@example.com'),
          4.5,
          'Great store!'
      `);
    }
    
    res.json({ message: 'Database initialized successfully' });
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
};