// server.js - Main application file
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL client setup
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  database: process.env.POSTGRES_DB || 'neetcodedb',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Initialize tables if they don't exist
async function initDB() {
  try {
    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create problems table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        url VARCHAR(500),
        difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');

    // Add some default categories if none exist
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoryCount.rows[0].count) === 0) {
      const defaultCategories = [
        'Arrays & Hashing',
        'Two Pointers',
        'Sliding Window',
        'Stack',
        'Binary Search',
        'Linked List',
        'Trees',
        'Tries',
        'Heap / Priority Queue',
        'Backtracking',
        'Graphs',
        'Dynamic Programming',
        'Greedy',
        'Intervals',
        'Math & Geometry',
        'Bit Manipulation'
      ];

      for (const category of defaultCategories) {
        await pool.query('INSERT INTO categories (name) VALUES ($1)', [category]);
      }
      console.log('Default categories added');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Initialize the database on startup
initDB();

// API Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new category
app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Category already exists' });
    }
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', category: result.rows[0] });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all problems
app.get('/api/problems', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get problems by category
app.get('/api/categories/:id/problems', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      WHERE category_id = $1
      ORDER BY p.id
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching problems by category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new problem
app.post('/api/problems', async (req, res) => {
  const { name, url, difficulty, category_id, notes } = req.body;
  
  if (!name || !category_id) {
    return res.status(400).json({ error: 'Problem name and category are required' });
  }
  
  try {
    // Check if category exists
    const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Category does not exist' });
    }
    
    const result = await pool.query(
      'INSERT INTO problems (name, url, difficulty, category_id, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, url, difficulty, category_id, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating problem:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a problem
app.delete('/api/problems/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM problems WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json({ message: 'Problem deleted successfully', problem: result.rows[0] });
  } catch (err) {
    console.error('Error deleting problem:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update problem completion status
app.patch('/api/problems/:id/completion', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  if (completed === undefined) {
    return res.status(400).json({ error: 'Completed status is required' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE problems SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating problem completion status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset all problem progress
app.post('/api/problems/reset-progress', async (req, res) => {
  try {
    await pool.query('UPDATE problems SET completed = FALSE');
    res.json({ message: 'All progress reset successfully' });
  } catch (err) {
    console.error('Error resetting progress:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
