const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 🌱 Load environment-specific config
const config = require('./config'); // Loads from config/index.js
const connectToDatabase = require('./db');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const { authenticatedToken } = require('./middleware/userUtils');
const roleGuard = require('./middleware/roleGuard');

const app = express();
const PORT = config.port || 3000;

// 🔗 Connect to MongoDB
connectToDatabase(config.dbUri);

// 🧩 Middleware
app.use(express.json());
app.use(cors());

// 🔓 Public routes
app.use('/api/auth', authRoutes);

// ✅ Public health check — no auth
app.get('/healthCheck', async (req, res) => {
  const dbState = mongoose.connection.readyState;

  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.json({
    status: '🟢 API is running',
    timestamp: new Date().toISOString(),
    database: statusMap[dbState] || 'Unknown',
  });
});

// 🔐 Global auth middleware for protected routes
app.use(authenticatedToken);
app.use(roleGuard);

// 🛡️ Protected routes
app.use('/api/notes', notesRoutes);

// 🌍 Root route
app.get('/', (req, res) => {
  res.send('🟢 API is running');
});

app.get('/envCheck', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    configLoaded: config,
  });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
