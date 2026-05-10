require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files from the project root
app.use(express.static(__dirname));

// API routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);

// SPA fallback — serve index.html for any route not matched above
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
