const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashed, role || 'client');

    res.status(201).json({ message: 'User registered successfully', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;