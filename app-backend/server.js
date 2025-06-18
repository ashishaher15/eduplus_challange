// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { testConnection } from './src/config/dbConfig.js';
import authRoutes from './src/routes/authRoutes.js';
import initRoutes from './src/routes/initRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import { initDatabase } from './src/controllers/initController.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/init', initRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Auth API is running' });
});

// Start server after testing DB connection
testConnection().then(async (connected) => {
  if (connected) {
    // Auto-initialize database on server start
    try {
      console.log('🔄 Initializing database...');
      await initDatabase(null, { json: () => console.log('✅ Database initialized successfully') });
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } else {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  }
});