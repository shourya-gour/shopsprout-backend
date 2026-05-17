const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await db.query('SELECT * FROM projects');
    } else {
      projects = await db.query('SELECT * FROM projects WHERE client_id = ?', [req.user.id]);
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const projects = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(projects[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { client_id, title, description, budget, deadline } = req.body;
    const result = await db.query(
      'INSERT INTO projects (client_id, title, description, budget, deadline) VALUES (?, ?, ?, ?, ?)',
      [client_id, title, description, budget, deadline]
    );
    res.status(201).json({ message: 'Project created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { title, description, status, budget, deadline, progress } = req.body;
    await db.query(
      'UPDATE projects SET title=?, description=?, status=?, budget=?, deadline=?, progress=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title, description, status, budget, deadline, progress, req.params.id]
    );
    res.json({ message: 'Project updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;