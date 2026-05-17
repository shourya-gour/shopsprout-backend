const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit contact form (public)
router.post('/', (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    const result = db.prepare(
      'INSERT INTO contacts (name, email, company, message) VALUES (?, ?, ?, ?)'
    ).run(name, email, company, message);
    res.status(201).json({ message: 'Message sent successfully', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all contacts (admin only)
router.get('/', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update contact status (admin only)
router.put('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { status } = req.body;
    db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Contact updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact (admin only)
router.delete('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;