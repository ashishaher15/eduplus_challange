import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test the connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
    return false;
  }
}

export { pool, testConnection };