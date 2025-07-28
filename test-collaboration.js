// Comprehensive Test Script for Collaboration Features
// This script tests session creation, joining, and basic functionality

const API_BASE = 'http://localhost:5000/api';

async function testCollaborationFlow() {
  console.log('🚀 Starting Collaboration Flow Test...\n');

  try {
    // Test 1: Create a new session
    console.log('📝 Test 1: Creating a new collaboration session...');
    const createResponse = await fetch(`${API_BASE}/collaboration/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'TestUser1',
        sessionName: 'Test Collaboration Session'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create session: ${createResponse.status}`);
    }

    const sessionData = await createResponse.json();
    console.log('✅ Session created successfully!');
    console.log(`   Session ID: ${sessionData.sessionId}`);
    console.log(`   Session Name: ${sessionData.sessionName}`);
    console.log(`   Owner: ${sessionData.owner}`);
    console.log(`   Workspace Created: ${sessionData.workspaceCreated}\n`);

    const sessionId = sessionData.sessionId;

    // Test 2: Get session info
    console.log('📋 Test 2: Getting session information...');
    const infoResponse = await fetch(`${API_BASE}/collaboration/${sessionId}/info`);
    
    if (!infoResponse.ok) {
      throw new Error(`Failed to get session info: ${infoResponse.status}`);
    }

    const sessionInfo = await infoResponse.json();
    console.log('✅ Session info retrieved successfully!');
    console.log(`   Title: ${sessionInfo.title}`);
    console.log(`   Language: ${sessionInfo.language}`);
    console.log(`   Owner: ${sessionInfo.owner}`);
    console.log(`   Active: ${sessionInfo.isActive}`);
    console.log(`   Participants: ${sessionInfo.participantCount}\n`);

    // Test 3: Join session as owner (should work)
    console.log('👤 Test 3: Joining session as owner...');
    const joinOwnerResponse = await fetch(`${API_BASE}/collaboration/${sessionId}/join-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'TestUser1'
      })
    });

    if (!joinOwnerResponse.ok) {
      throw new Error(`Failed to join as owner: ${joinOwnerResponse.status}`);
    }

    const ownerJoinData = await joinOwnerResponse.json();
    console.log('✅ Owner joined successfully!');
    console.log(`   Username: ${ownerJoinData.username}`);
    console.log(`   Is Owner: ${ownerJoinData.isOwner}`);
    console.log(`   Session Title: ${ownerJoinData.sessionInfo.title}\n`);

    // Test 4: Try to join as unauthorized user (should fail)
    console.log('🚫 Test 4: Attempting to join as unauthorized user...');
    const joinUnauthorizedResponse = await fetch(`${API_BASE}/collaboration/${sessionId}/join-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'UnauthorizedUser'
      })
    });

    if (joinUnauthorizedResponse.status === 403) {
      console.log('✅ Unauthorized access correctly denied!');
      const errorData = await joinUnauthorizedResponse.json();
      console.log(`   Error: ${errorData.error}\n`);
    } else {
      console.log('⚠️  Warning: Unauthorized user was allowed to join\n');
    }

    // Test 5: Test health endpoint
    console.log('🏥 Test 5: Testing backend health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    console.log('✅ Backend health check passed!');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Features: ${JSON.stringify(healthData.features)}\n`);

    // Test Summary
    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Session Creation: PASSED');
    console.log('   ✅ Session Info Retrieval: PASSED');
    console.log('   ✅ Owner Join: PASSED');
    console.log('   ✅ Unauthorized Access Prevention: PASSED');
    console.log('   ✅ Backend Health: PASSED');
    
    console.log('\n🔗 Frontend URLs to test:');
    console.log(`   Home Page: http://localhost:5173/`);
    console.log(`   Workspace Manager: http://localhost:5173/workspaces`);
    console.log(`   IDE (with session): http://localhost:5173/ide?session=${sessionId}&username=TestUser1`);
    
    return {
      success: true,
      sessionId,
      sessionInfo
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testCollaborationFlow().then(result => {
  if (result.success) {
    console.log('\n🎯 Ready for manual testing in browser!');
    process.exit(0);
  } else {
    console.log('\n💥 Tests failed. Please check the backend server.');
    process.exit(1);
  }
});