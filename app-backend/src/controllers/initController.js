import { pool } from '../config/dbConfig.js';

export const initDatabase = async (req, res) => {
  try {
    // =============================
    // 1) Drop existing tables
    // =============================
    // The following lines will remove old tables so you can recreate them from scratch.
    // COMMENTED OUT: To prevent dropping tables on subsequent runs
    // If you need to reset the database, uncomment these lines temporarily
    
    // console.log('Dropping existing tables...');
    // await pool.query('DROP TABLE IF EXISTS applications CASCADE;');
    // await pool.query('DROP TABLE IF EXISTS companies CASCADE;');
    // await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    // console.log('All tables dropped successfully.');
    

    // =============================
    // 2) Create users table
    // =============================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('user', 'admin', 'contractor')) NOT NULL,
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // =============================
    // 3) Create companies table
    // =============================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        owner_user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_user_id) REFERENCES users(id)
      );
    `);

    // =============================
    // 4) Create applications table
    // =============================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating DECIMAL(3,2) NOT NULL,
        comment TEXT,
        proposal TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // =============================
    // 5) Migrate existing tables if needed
    // =============================
    // Check if proposal column exists in applications table
    const { rows: columnCheck } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'proposal'
    `);

    // Add proposal column if it doesn't exist
    if (columnCheck.length === 0) {
      console.log('Adding proposal column to applications table...');
      await pool.query('ALTER TABLE applications ADD COLUMN proposal TEXT');
      console.log('Proposal column added successfully.');
    }

    // =============================
    // 6) Seed sample data if empty
    // =============================
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (parseInt(rows[0].count, 10) === 0) {
      // Insert sample users
      await pool.query(`
        INSERT INTO users (name, email, address, password, role) VALUES
        ('Test User',      'user@example.com',       '123 User St',       'password123',    'user'),
        ('Admin User',     'admin@example.com',      '456 Admin Ave',     'admin123',       'admin'),
        ('Contractor',     'contractor@example.com', '789 Company Blvd',  'contractor123',  'contractor');
      `);

      // Insert a sample company for the contractor
      await pool.query(`
        INSERT INTO companies (name, email, address, owner_user_id)
        SELECT 'Sample Company', 'contractor@example.com', '789 Company Blvd', id
        FROM users
        WHERE email = 'contractor@example.com';
      `);

      // Insert a sample application/rating
      await pool.query(`
        INSERT INTO applications (company_id, user_id, rating, comment)
        SELECT
          (SELECT id FROM companies LIMIT 1),
          (SELECT id FROM users WHERE email = 'user@example.com'),
          4.5,
          'Great company!';
      `);
    }

    res.json({ message: 'Database initialized successfully' });
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
};
