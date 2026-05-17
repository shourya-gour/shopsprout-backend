const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all services (public)
router.get('/', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services WHERE is_active = 1').all();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single service (public)
router.get('/:id', (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create service (admin only)
router.post('/', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { title, description, price, duration } = req.body;
    const result = db.prepare(
      'INSERT INTO services (title, description, price, duration) VALUES (?, ?, ?, ?)'
    ).run(title, description, price, duration);
    res.status(201).json({ message: 'Service created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update service (admin only)
router.put('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { title, description, price, duration, is_active } = req.body;
    db.prepare(
      'UPDATE services SET title=?, description=?, price=?, duration=?, is_active=? WHERE id=?'
    ).run(title, description, price, duration, is_active, req.params.id);
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete service (admin only)
router.delete('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;