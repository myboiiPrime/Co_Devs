const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

console.log('Testing routes one by one...');

try {
  console.log('1. Testing auth routes...');
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Auth routes failed:', error.message);
  process.exit(1);
}

try {
  console.log('2. Testing document routes...');
  const documentRoutes = require('./src/routes/documents');
  app.use('/api/documents', documentRoutes);
  console.log('✅ Document routes loaded successfully');
} catch (error) {
  console.error('❌ Document routes failed:', error.message);
  process.exit(1);
}

try {
  console.log('3. Testing AI routes...');
  const aiRoutes = require('./src/routes/ai');
  app.use('/api/ai', aiRoutes);
  console.log('✅ AI routes loaded successfully');
} catch (error) {
  console.error('❌ AI routes failed:', error.message);
  process.exit(1);
}

console.log('4. All routes loaded, starting server...');

const PORT = 5004;
app.listen(PORT, () => {
  console.log(`✅ Debug server running on port ${PORT}`);
});