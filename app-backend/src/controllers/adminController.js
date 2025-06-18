import { pool } from '../config/dbConfig.js';
import { validateRegistration } from '../utils/validators.js';

// Get all users with store information for store owners
export const getAllUsers = async (req, res) => {
  try {
    // First check if stores table exists
    const [tables] = await pool.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'stores'",
      [process.env.DB_NAME || 'polling_db']
    );
    
    let users;
    
    if (tables[0].count > 0) {
      // If stores table exists, use the original query
      [users] = await pool.query(
        `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
          s.id AS storeId, 
          COALESCE(AVG(r.rating), 0) AS storeAverageRating, 
          COUNT(r.id) AS ratingsCount 
        FROM users u 
        LEFT JOIN stores s ON u.id = s.owner_user_id 
        LEFT JOIN ratings r ON s.id = r.store_id 
        GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at, s.id 
        ORDER BY u.name ASC`
      );
    } else {
      // If stores table doesn't exist, use a simpler query
      [users] = await pool.query(
        `SELECT id, name, email, address, role, created_at,
          NULL AS storeId,
          0 AS storeAverageRating,
          0 AS ratingsCount
        FROM users
        ORDER BY name ASC`
      );
    }
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get all stores with ratings
export const getAllStores = async (req, res) => {
  try {
    // First check if stores table exists
    const [tables] = await pool.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'stores'",
      [process.env.DB_NAME || 'polling_db']
    );
    
    if (tables[0].count === 0) {
      // If stores table doesn't exist, return empty array
      return res.json([]);
    }
    
    // Check if ratings table exists
    const [ratingTables] = await pool.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'ratings'",
      [process.env.DB_NAME || 'polling_db']
    );
    
    let stores;
    
    if (ratingTables[0].count > 0) {
      // If ratings table exists, use the original query
      [stores] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address, 
          COALESCE(AVG(r.rating), 0) AS averageRating, 
          COUNT(r.id) AS ratingsCount 
        FROM stores s 
        LEFT JOIN ratings r ON s.id = r.store_id 
        GROUP BY s.id, s.name, s.email, s.address 
        ORDER BY s.name ASC`
      );
    } else {
      // If ratings table doesn't exist, use a simpler query
      [stores] = await pool.query(
        `SELECT id, name, email, address,
          0 AS averageRating,
          0 AS ratingsCount
        FROM stores
        ORDER BY name ASC`
      );
    }
    
    res.json(stores);
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const userId = req.params.id;
  
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, address, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
export const createUser = async (req, res) => {
  const { name, email, address, password, role } = req.body;
  
  // Validate input
  const validation = validateRegistration(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, password, role]
    );
    
    // Return user info without password
    const userId = result.insertId;
    res.status(201).json({
      id: userId,
      name,
      email,
      role,
      address
    });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Create new store
// Create new store
export const createStore = async (req, res) => {
  const { name, email, address, items, owner_user_id } = req.body;
  
  try {
    // Check if owner exists and is a store_owner
    const [owners] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "store_owner"',
      [owner_user_id]
    );
    
    if (owners.length === 0) {
      return res.status(400).json({ error: 'Invalid store owner ID or user is not a store owner' });
    }
    
    // Insert new store
    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_user_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_user_id]
    );
    
    // Return store info
    const storeId = result.insertId;
    res.status(201).json({
      id: storeId,
      name,
      email,
      address,
      owner_user_id,
      items: items || []
    });
  } catch (err) {
    console.error('Store creation error:', err);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

// Get store by owner ID
export const getStoreByOwnerId = async (req, res) => {
  const ownerId = req.params.ownerId;
  
  try {
    const [stores] = await pool.query(
      `SELECT s.*, COALESCE(AVG(r.rating), 0) AS averageRating, COUNT(r.id) AS ratingsCount 
       FROM stores s 
       LEFT JOIN ratings r ON s.id = r.store_id 
       WHERE s.owner_user_id = ? 
       GROUP BY s.id`,
      [ownerId]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found for this owner' });
    }
    
    res.json(stores[0]);
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

// Get users who have rated a specific store
export const getStoreRatingUsers = async (req, res) => {
  const storeId = req.params.storeId;
  
  try {
    // Check if store exists and belongs to the requesting user
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE id = ?',
      [storeId]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Get users who rated this store
    const [ratingUsers] = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at as rating_date
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    res.json(ratingUsers);
  } catch (err) {
    console.error('Error fetching rating users:', err);
    res.status(500).json({ error: 'Failed to fetch rating users' });
  }
};