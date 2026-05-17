const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all projects (admin) or client's projects
router.get('/', auth, (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = db.prepare('SELECT * FROM projects').all();
    } else {
      projects = db.prepare('SELECT * FROM projects WHERE client_id = ?').all(req.user.id);
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', auth, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project (admin only)
router.post('/', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { client_id, title, description, budget, deadline } = req.body;
    const result = db.prepare(
      'INSERT INTO projects (client_id, title, description, budget, deadline) VALUES (?, ?, ?, ?, ?)'
    ).run(client_id, title, description, budget, deadline);
    res.status(201).json({ message: 'Project created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project (admin only)
router.put('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { title, description, status, budget, deadline, progress } = req.body;
    db.prepare(
      'UPDATE projects SET title=?, description=?, status=?, budget=?, deadline=?, progress=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(title, description, status, budget, deadline, progress, req.params.id);
    res.json({ message: 'Project updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
