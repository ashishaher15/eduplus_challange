import { pool } from '../config/dbConfig.js';
import { validateRegistration, validateLogin, validatePasswordUpdate } from '../utils/validators.js';

export const register = async (req, res) => {
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
    // Note: Storing passwords in plaintext is insecure and should never be done in production
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
      role
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  const validation = validateLogin(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check password (plaintext comparison - insecure, but per requirements)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Return user info without password
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const updatePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  
  // Validate input
  const validation = validatePasswordUpdate(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    // Find user by ID
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Check old password (plaintext comparison - insecure, but per requirements)
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};