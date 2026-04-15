const express = require('express');
const cors = require('cors');
const path = require('path');  // ← ADD यह
require('dotenv').config();

const app = express();

// Routes
const authRoutes = require('./routes/auth');
const vulnerabilitiesRoutes = require('./routes/vulnerabilities');
const reportsRoutes = require('./routes/reports');
const authMiddleware = require('./middleware/auth');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Backend is running! ✅',
    timestamp: new Date()
  });
});

// Auth Routes (No protection needed)
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/vulnerabilities', authMiddleware, vulnerabilitiesRoutes);
app.use('/api/reports', authMiddleware, reportsRoutes);

// Serve static files from frontend build  ← ADD यह
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback - सभी non-API routes को index.html भेजो  ← ADD यह
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});