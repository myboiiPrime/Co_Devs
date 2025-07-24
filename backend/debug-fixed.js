const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing with fixed 404 handler...');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('1. Middleware added');

try {
  console.log('2. Testing database connection...');
  const connectDB = require('./src/config/database');
  connectDB();
  console.log('✅ Database connection initiated');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

// Routes
try {
  console.log('3. Loading routes...');
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/documents', require('./src/routes/documents'));
  app.use('/api/ai', require('./src/routes/ai'));
  console.log('✅ All routes loaded');
} catch (error) {
  console.error('❌ Routes failed:', error.message);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fixed server running',
    timestamp: new Date().toISOString()
  });
});

console.log('4. Adding error handling...');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

console.log('5. Adding 404 handler...');

// Fixed 404 handler - avoid using '*' wildcard
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

console.log('6. Starting server...');

const PORT = 5006;

app.listen(PORT, () => {
  console.log(`✅ Fixed server running on port ${PORT}`);
});