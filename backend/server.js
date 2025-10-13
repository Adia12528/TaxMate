const path = require('path');
const app = require('./src/app');
const connectDB = require('./src/DB/db');
const express = require('express');

// Connect to MongoDB
connectDB();

// Serve frontend (static files)
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
