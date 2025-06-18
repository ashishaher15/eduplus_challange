import { pool } from '../config/dbConfig.js';
import { isValidRating } from '../utils/validators.js';

// Get all stores with search functionality and user's rating
export const getAllStores = async (req, res) => {
  try {
    const { userId, name, address } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Build the WHERE clause for search
    let whereClause = '';
    const params = [userId];
    
    if (name && address) {
      whereClause = 'WHERE s.name LIKE ? AND s.address LIKE ?';
      params.push(`%${name}%`, `%${address}%`);
    } else if (name) {
      whereClause = 'WHERE s.name LIKE ?';
      params.push(`%${name}%`);
    } else if (address) {
      whereClause = 'WHERE s.address LIKE ?';
      params.push(`%${address}%`);
    }
    
    const query = `
      SELECT 
        s.id, s.name, s.address, 
        COALESCE(AVG(r.rating), 0) AS averageRating, 
        (
          SELECT r2.rating 
          FROM ratings r2 
          WHERE r2.store_id = s.id AND r2.user_id = ? 
        ) AS userRating 
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      ${whereClause}
      GROUP BY s.id, s.name, s.address 
      ORDER BY s.name ASC
    `;
    
    const [stores] = await pool.query(query, params);
    
    res.json(stores);
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// Submit or update a rating for a store
export const submitRating = async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const storeId = req.params.storeId;
    
    // Validate inputs
    if (!userId || !storeId || rating === undefined) {
      return res.status(400).json({ error: 'User ID, store ID, and rating are required' });
    }
    
    if (!isValidRating(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }
    
    // Check if user has already rated this store
    const [existingRatings] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    let result;
    
    if (existingRatings.length > 0) {
      // Update existing rating
      [result] = await pool.query(
        'UPDATE ratings SET rating = ? WHERE id = ?',
        [rating, existingRatings[0].id]
      );
    } else {
      // Insert new rating
      [result] = await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }
    
    // Get updated store info with new average rating
    const [stores] = await pool.query(
      `SELECT 
        s.id, s.name, s.address, 
        COALESCE(AVG(r.rating), 0) AS averageRating, 
        (
          SELECT r2.rating 
          FROM ratings r2 
          WHERE r2.store_id = s.id AND r2.user_id = ? 
        ) AS userRating 
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE s.id = ? 
      GROUP BY s.id, s.name, s.address`,
      [userId, storeId]
    );
    
    res.json(stores[0] || { message: 'Rating submitted but store not found' });
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};