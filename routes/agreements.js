const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit agreement (public)
router.post('/', async (req, res) => {
  try {
    const { client_name, client_email, company, plan, revenue_percentage, monthly_retainer, signature } = req.body;

    if (!client_name || !client_email || !plan || !signature) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const result = await db.query(
      'INSERT INTO agreements (client_name, client_email, company, plan, revenue_percentage, monthly_retainer, signature) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client_name, client_email, company, plan, revenue_percentage, monthly_retainer, signature]
    );

    res.status(201).json({ message: 'Agreement signed successfully!', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all agreements (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const agreements = await db.query('SELECT * FROM agreements ORDER BY agreed_at DESC');
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single agreement (admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const agreements = await db.query('SELECT * FROM agreements WHERE id = ?', [req.params.id]);
    if (agreements.length === 0) return res.status(404).json({ error: 'Agreement not found' });
    res.json(agreements[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update agreement status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { status } = req.body;
    await db.query('UPDATE agreements SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Agreement updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;