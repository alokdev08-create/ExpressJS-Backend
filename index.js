// 🌐 Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 📦 Custom modules
const config = require('./config'); // Centralized config loader
const connectToDatabase = require('./db'); // MongoDB connection logic

// 📁 Routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const notesRoutes = require('./routes/notes');

// 🛡️ Middleware
const { authenticatedToken } = require('./middleware/userUtils'); // JWT validation
const roleGuard = require('./middleware/roleGuard'); // Role-based access control

// 🚀 Initialize Express app
const app = express();
const PORT = config.port || 3000;

// 🔗 Connect to MongoDB
connectToDatabase(config.dbUri);

// 📂 Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create uploads folder if missing
}

// 🧩 Global middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for frontend-backend communication

// 🖼️ Serve static files from uploads folder
app.use('/uploads', express.static(uploadDir));

// 🔓 Public routes (no auth required)
app.use('/api/auth', authRoutes);

if (typeof contactRoutes === 'function') {
  app.use('/api/contact', contactRoutes);
  console.log('✅ Contact routes loaded successfully');
} else {
  console.warn('⚠️ contactRoutes is not a valid Express router');
}

// 🩺 Health check endpoint
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

// 🔐 Apply global auth middleware for protected routes
app.use(authenticatedToken); // Verifies JWT
app.use(roleGuard); // Checks user role

// 🛡️ Protected routes
app.use('/api/notes', notesRoutes);

// 🌍 Root route
app.get('/', (req, res) => {
  res.send('🟢 API is running');
});

// 🧪 Environment check
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
