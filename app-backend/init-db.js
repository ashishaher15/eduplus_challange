import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function initializeDatabase() {
  // Create connection without database selected
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  try {
    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS polling_db');
    console.log('Database created successfully');
    
    // Switch to the new database
    await connection.query('USE polling_db');
    
    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        votes INT DEFAULT 0
      );
    `);
    console.log('Tables created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initializeDatabase();