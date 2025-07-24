const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL;
  const defaultOrigins = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:4173"];
  
  if (clientUrl && !defaultOrigins.includes(clientUrl)) {
    return [...defaultOrigins, clientUrl];
  }
  
  return defaultOrigins;
};

const allowedOrigins = getAllowedOrigins();

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/collaboration', require('./routes/collaboration'));

// Socket.io connection handling
require('./services/socketService')(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Collaborative Code Editor API is running',
    timestamp: new Date().toISOString(),
    features: {
      collaboration: true,
      terminals: true,
      fileSystem: true,
      ai: true
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - Fixed: removed '*' wildcard pattern
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤝 Collaboration features enabled`);
  console.log(`🖥️ Terminal support enabled`);
});

module.exports = { app, server, io };