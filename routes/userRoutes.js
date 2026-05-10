const express = require('express');
const router = express.Router();

// GET /api/users - list users (placeholder)
router.get('/users', (req, res) => {
  res.json({ message: 'User routes are working' });
});

module.exports = router;
