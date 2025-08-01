const mongoose = require('mongoose');
require('dotenv').config(); // Remove the path parameter to use default .env location

// Import models
const User = require('../src/models/User');
const CollaborationSession = require('../src/models/CollaborationSession');

async function checkDatabaseData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboration-platform';
    console.log('🔗 Full MongoDB URI from env:', process.env.MONGODB_URI);
    console.log('🔗 Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);

    // List all collections
    console.log('\n=== DATABASE COLLECTIONS ===');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

    // Check what collection names the models are using
    console.log('\n=== MODEL COLLECTION NAMES ===');
    console.log(`User model uses collection: ${User.collection.name}`);
    console.log(`CollaborationSession model uses collection: ${CollaborationSession.collection.name}`);

    // Check users
    console.log('\n=== USERS ===');
    const users = await User.find({}).select('_id username email isTemporary');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user._id}: ${user.username} (${user.email}) ${user.isTemporary ? '[TEMP]' : ''}`);
    });

    // Check sessions
    console.log('\n=== SESSIONS ===');
    const sessions = await CollaborationSession.find({}).select('_id sessionId owner createdAt');
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach(session => {
      console.log(`- ${session._id}: ${session.sessionId}`);
      console.log(`  Owner ID: ${session.owner}`);
      console.log(`  Created: ${session.createdAt}`);
    });

    // Check sessions with populated owner
    console.log('\n=== SESSIONS WITH POPULATED OWNER ===');
    const populatedSessions = await CollaborationSession.find({})
      .populate('owner', 'username email')
      .select('_id sessionId owner createdAt');
    
    populatedSessions.forEach(session => {
      console.log(`- Session: ${session.sessionId}`);
      console.log(`  Owner: ${session.owner ? `${session.owner.username} (${session.owner.email})` : 'NULL/MISSING'}`);
      console.log(`  Created: ${session.createdAt}`);
      console.log('---');
    });

    // Check for orphaned sessions (sessions with invalid owner references)
    console.log('\n=== CHECKING FOR ORPHANED SESSIONS ===');
    const userIds = users.map(u => u._id.toString());
    const orphanedSessions = sessions.filter(session => 
      session.owner && !userIds.includes(session.owner.toString())
    );
    
    if (orphanedSessions.length > 0) {
      console.log(`❌ Found ${orphanedSessions.length} orphaned sessions:`);
      orphanedSessions.forEach(session => {
        console.log(`- ${session.sessionId}: references non-existent user ${session.owner}`);
      });
    } else {
      console.log('✅ No orphaned sessions found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkDatabaseData();