const express = require('express');
const router = express.Router();

// POST /api/auth/login - login (placeholder)
router.post('/login', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// POST /api/auth/register - register (placeholder)
router.post('/register', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

module.exports = router;
