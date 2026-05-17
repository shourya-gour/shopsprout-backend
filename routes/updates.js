const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all updates for a project
router.get('/:project_id', auth, async (req, res) => {
  try {
    const updates = await db.query(
      'SELECT * FROM project_updates WHERE project_id = ? ORDER BY created_at DESC',
      [req.params.project_id]
    );
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add update to project (admin only)
router.post('/:project_id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { message } = req.body;
    const result = await db.query(
      'INSERT INTO project_updates (project_id, message) VALUES (?, ?)',
      [req.params.project_id, message]
    );
    res.status(201).json({ message: 'Update added', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete update (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    await db.query('DELETE FROM project_updates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;