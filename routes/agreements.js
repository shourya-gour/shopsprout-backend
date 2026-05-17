const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit agreement (public)
router.post('/', (req, res) => {
  try {
    const { client_name, client_email, company, plan, revenue_percentage, monthly_retainer, signature } = req.body;
    
    if (!client_name || !client_email || !plan || !signature) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const result = db.prepare(`
      INSERT INTO agreements (client_name, client_email, company, plan, revenue_percentage, monthly_retainer, signature)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(client_name, client_email, company, plan, revenue_percentage, monthly_retainer, signature);

    res.status(201).json({ message: 'Agreement signed successfully!', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all agreements (admin only)
router.get('/', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const agreements = db.prepare('SELECT * FROM agreements ORDER BY agreed_at DESC').all();
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single agreement (admin only)
router.get('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const agreement = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id);
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });
    res.json(agreement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update agreement status (admin only)
router.put('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { status } = req.body;
    db.prepare('UPDATE agreements SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Agreement updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;