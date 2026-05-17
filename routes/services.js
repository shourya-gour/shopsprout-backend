const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all services (public)
router.get('/', async (req, res) => {
  try {
    const services = await db.query('SELECT * FROM services WHERE is_active = 1');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single service (public)
router.get('/:id', async (req, res) => {
  try {
    const services = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (services.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(services[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create service (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { title, description, price, duration } = req.body;
    const result = await db.query(
      'INSERT INTO services (title, description, price, duration) VALUES (?, ?, ?, ?)',
      [title, description, price, duration]
    );
    res.status(201).json({ message: 'Service created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update service (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { title, description, price, duration, is_active } = req.body;
    await db.query(
      'UPDATE services SET title=?, description=?, price=?, duration=?, is_active=? WHERE id=?',
      [title, description, price, duration, is_active, req.params.id]
    );
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete service (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;