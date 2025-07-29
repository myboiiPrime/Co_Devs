const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const CollaborationSession = require('../models/CollaborationSession');
const Document = require('../models/Document');
const User = require('../models/User');
const workspaceService = require('../services/workspaceService');
const terminalService = require('../services/terminalService');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Create new collaboration session (no JWT required)
router.post('/create', async (req, res) => {
  try {
    const { username, sessionName } = req.body;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Find or create user record
    let user = await User.findOne({ username: username.trim() });
    if (!user) {
      // Create a temporary user record for this session
      user = new User({
        username: username.trim(),
        email: `${username.trim()}@temp.com`,
        password: 'temppass123', // Changed to meet 6+ character requirement
        isTemporary: true
      });
      await user.save();
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create a default document for the session
    const document = new Document({
      title: sessionName || 'Collaborative Session',
      content: `// Welcome to ${sessionName || 'your collaborative session'}!
// This is a shared workspace where multiple users can code together.

console.log('Hello from the collaborative session!');

// You can write code here and see real-time changes from other users
function welcomeMessage() {
  return 'Welcome to collaborative coding with Co-Devs!';
}

// Try editing this file with multiple users to see the magic happen!
// Use the terminal below to run your code and see the results.

welcomeMessage();
`,
      language: 'javascript',
      owner: user._id,
      collaborators: [user._id],
      isPublic: false
    });
    await document.save();

    // Create isolated workspace
    const workspaceDir = await workspaceService.createCollaborationWorkspace(
      sessionId, 
      document.content, 
      document.language
    );

    // Create the collaboration session
    const session = new CollaborationSession({
      sessionId: sessionId,
      name: sessionName || 'Collaborative Session',
      description: `A collaborative coding session created by ${username}`,
      owner: user._id,
      participants: [{
        user: user._id,
        role: 'owner',
        joinedAt: new Date()
      }],
      documentId: document._id,
      workspaceDir: workspaceDir, // Added missing workspaceDir field
      isActive: true,
      settings: {
        maxParticipants: 10,
        allowAnonymous: true,
        permissions: {
          canEdit: true,
          canExecute: true,
          canManageFiles: true
        }
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    await session.save();

    // Generate JWT token for socket authentication
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Session created successfully',
      sessionId: sessionId,
      sessionName: sessionName || 'Collaborative Session',
      owner: username,
      token, // Add token for socket authentication
      workspaceCreated: !!workspaceDir
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create session' });
  }
});

// Simple username-based session join (no JWT required)
router.post('/:sessionId/join-simple', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    })
    .populate('owner', 'username email')
    .populate('participants.user', 'username email');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ error: 'Session is not active' });
    }

    // Check if username matches session owner
    const isOwner = session.owner.username === username;
    
    // Check if username is in allowed participants
    const isAllowedParticipant = session.participants.some(p => 
      p.user.username === username
    );

    if (!isOwner && !isAllowedParticipant) {
      return res.status(403).json({ 
        error: 'Access denied. You are not authorized to join this session.',
        isOwner: false,
        allowedUsers: session.participants.map(p => p.user.username)
      });
    }

    // Find or create user record
    let user = await User.findOne({ username });
    if (!user) {
      // Create a temporary user record for this session
      user = new User({
        username,
        email: `${username}@temp.com`,
        password: 'temppass123', // Changed to meet 6+ character requirement
        isTemporary: true
      });
      await user.save();
    }

    // Generate JWT token for socket authentication
    const token = generateToken(user._id);

    res.json({
      message: 'Successfully joined collaboration session',
      sessionId: session.sessionId,
      username,
      isOwner,
      token, // Add token for socket authentication
      sessionInfo: {
        title: session.documentId?.title || 'Untitled',
        owner: session.owner.username,
        participants: session.participants.length
      }
    });
  } catch (error) {
    console.error('Simple join session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session info without authentication (for join form)
router.get('/:sessionId/info', async (req, res) => {
  try {
    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    })
    .populate('owner', 'username')
    .populate('documentId', 'title language');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: session.sessionId,
      title: session.documentId?.title || 'Untitled',
      language: session.documentId?.language || 'javascript',
      owner: session.owner.username,
      isActive: session.isActive,
      participantCount: session.participants.length,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('Get session info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add user to session (owner only)
router.post('/:sessionId/add-user', async (req, res) => {
  try {
    const { username, ownerUsername } = req.body;
    
    if (!username || !ownerUsername) {
      return res.status(400).json({ error: 'Username and owner username are required' });
    }

    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    })
    .populate('owner', 'username')
    .populate('participants.user', 'username');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify the requester is the session owner
    if (session.owner.username !== ownerUsername) {
      return res.status(403).json({ error: 'Only session owner can remove users' });
    }

    // Check if user already exists in session
    const existingParticipant = session.participants.find(p => 
      p.user.username === username
    );
    
    if (existingParticipant) {
      return res.status(400).json({ error: 'User is already in the session' });
    }

    // Find or create user
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({
        username,
        email: `${username}@temp.local`,
        password: 'temppass123', // Fixed: Changed to meet 6+ character requirement
        isTemporary: true
      });
      await user.save();
    }

    // Add user to session
    session.participants.push({
      user: user._id,
      role: 'collaborator',
      joinedAt: new Date()
    });

    await session.save();

    res.json({
      message: `User ${username} added to session successfully`,
      participants: session.participants.map(p => ({
        username: p.user.username,
        role: p.role,
        joinedAt: p.joinedAt
      }))
    });
  } catch (error) {
    console.error('Add user to session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove user from session (owner only)
router.post('/:sessionId/remove-user', async (req, res) => {
  try {
    const { username, ownerUsername } = req.body;
    
    if (!username || !ownerUsername) {
      return res.status(400).json({ error: 'Username and owner username are required' });
    }

    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    })
    .populate('owner', 'username')
    .populate('participants.user', 'username');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify the requester is the session owner
    if (session.owner.username !== ownerUsername) {
      return res.status(403).json({ error: 'Only session owner can remove users' });
    }

    // Cannot remove the owner
    if (username === session.owner.username) {
      return res.status(400).json({ error: 'Cannot remove session owner' });
    }

    // Remove user from participants
    session.participants = session.participants.filter(p => 
      p.user.username !== username
    );

    await session.save();

    res.json({
      message: `User ${username} removed from session successfully`,
      participants: session.participants.map(p => ({
        username: p.user.username,
        role: p.role,
        joinedAt: p.joinedAt
      }))
    });
  } catch (error) {
    console.error('Remove user from session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get collaboration session info
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    })
    .populate('owner', 'username email avatar')
    .populate('participants.user', 'username email avatar')
    .populate('documentId', 'title language content');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check access
    if (!session.hasAccess(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get workspace info
    const workspaceSize = await workspaceService.getWorkspaceSize(session.sessionId);
    const activeTerminals = terminalService.getSessionTerminals(session.sessionId);

    res.json({
      ...session.toObject(),
      workspaceSize,
      activeTerminals
    });
  } catch (error) {
    console.error('Get collaboration session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Join collaboration session
router.post('/:sessionId/join', auth, async (req, res) => {
  try {
    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ error: 'Session is not active' });
    }

    // Add user as participant
    await session.addParticipant(req.user.userId);

    res.json({
      message: 'Successfully joined collaboration session',
      sessionId: session.sessionId
    });
  } catch (error) {
    console.error('Join collaboration session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave collaboration session
router.post('/:sessionId/leave', auth, async (req, res) => {
  try {
    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Remove user from participants
    await session.removeParticipant(req.user.userId);

    res.json({
      message: 'Successfully left collaboration session'
    });
  } catch (error) {
    console.error('Leave collaboration session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// File system operations
router.get('/:sessionId/files', auth, async (req, res) => {
  try {
    const { path = '' } = req.query;
    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session || !session.hasAccess(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const files = await workspaceService.listFiles(session.sessionId, path);
    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:sessionId/files/read', auth, async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session || !session.hasAccess(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = await workspaceService.readFile(session.sessionId, path);
    res.json({ content });
  } catch (error) {
    console.error('Read file error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:sessionId/files/write', auth, async (req, res) => {
  try {
    const { path, content } = req.body;
    if (!path || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }

    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session || !session.hasAccess(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await workspaceService.writeFile(session.sessionId, path, content);
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('Write file error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:sessionId/files', auth, async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session || !session.hasAccess(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await workspaceService.deleteFile(session.sessionId, path);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// End collaboration session
router.delete('/:sessionId', auth, async (req, res) => {
  try {
    const session = await CollaborationSession.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only owner can end the session
    if (session.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only session owner can end the session' });
    }

    // Cleanup terminals
    terminalService.cleanupSession(session.sessionId);
    
    // Cleanup workspace
    await workspaceService.cleanupWorkspace(session.sessionId);
    
    // Mark session as inactive
    session.isActive = false;
    await session.save();

    res.json({
      message: 'Collaboration session ended successfully'
    });
  } catch (error) {
    console.error('End collaboration session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List workspaces for a user (no auth required for now - using username)
router.get('/workspaces/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ workspaces: [] }); // Return empty array if user not found
    }

    // Find sessions where user is owner or participant
    const sessions = await CollaborationSession.find({
      $or: [
        { owner: user._id },
        { 'participants.user': user._id }
      ]
    })
    .populate('owner', 'username')
    .populate('participants.user', 'username')
    .populate('documentId', 'title language')
    .sort({ createdAt: -1 });

    // Transform sessions to workspace format
    const workspaces = sessions.map(session => {
      const isOwner = session.owner._id.toString() === user._id.toString();
      const participants = session.participants.map(p => ({
        id: p.user._id,
        username: p.user.username
      }));

      return {
        sessionId: session.sessionId,
        name: session.name,
        description: session.description,
        owner: session.owner.username,
        isOwner,
        isActive: session.isActive,
        participantCount: session.participants.length,
        language: session.documentId?.language || 'javascript',
        createdAt: session.createdAt.toISOString(),
        participants
      };
    });

    res.json({ workspaces });
  } catch (error) {
    console.error('List workspaces error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;