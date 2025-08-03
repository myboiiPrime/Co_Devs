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
// Use the terminal below for development tasks.

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
      workspaceDir: workspaceDir,
      isActive: true,
      settings: {
        maxTerminals: 5,
        allowedShells: ['bash', 'cmd', 'powershell', 'python', 'node'],
        fileSystemAccess: true,
        maxParticipants: 10,
        allowAnonymous: true,
        permissions: {
          canEdit: true,
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

    // NEW: Additional email validation - check if user's email exists in participants
    let emailValidationPassed = false;
    if (!isOwner && !isAllowedParticipant) {
      // Find user by username to get their email
      const userByUsername = await User.findOne({ username });
      if (userByUsername) {
        // Check if this user's email matches any participant's email
        const participantEmails = await Promise.all(
          session.participants.map(async (p) => {
            const participantUser = await User.findById(p.user);
            return participantUser ? participantUser.email : null;
          })
        );
        
        // Also check owner's email
        const ownerUser = await User.findById(session.owner);
        const ownerEmail = ownerUser ? ownerUser.email : null;
        
        emailValidationPassed = participantEmails.includes(userByUsername.email) || 
                               (ownerEmail && ownerEmail === userByUsername.email);
      }
    }

    if (!isOwner && !isAllowedParticipant && !emailValidationPassed) {
      return res.status(403).json({ 
        error: 'Access denied. Your email is not authorized to join this session.',
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
    console.log('🔵 ADD USER: Starting add user process', {
      sessionId: req.params.sessionId,
      username,
      ownerUsername
    });
    
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

    console.log('🔵 ADD USER: Session found', {
      sessionId: session.sessionId,
      owner: session.owner.username,
      currentParticipants: session.participants.map(p => ({
        username: p.user.username,
        role: p.role,
        userId: p.user._id
      }))
    });

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
      console.log('🔵 ADD USER: Creating new user', { username });
      user = new User({
        username,
        email: `${username}@temp.com`,
        password: 'temppass123', // Fixed: Changed to meet 6+ character requirement
        isTemporary: true
      });
      await user.save();
      console.log('🔵 ADD USER: New user created', { 
        userId: user._id, 
        username: user.username,
        email: user.email 
      });
    } else {
      console.log('🔵 ADD USER: Existing user found', { 
        userId: user._id, 
        username: user.username 
      });
    }

    // Add user to session
    session.participants.push({
      user: user._id,
      role: 'editor',
      joinedAt: new Date()
    });

    await session.save();

    // Re-populate to get fresh data
    await session.populate('participants.user', 'username');

    console.log('🔵 ADD USER: User added to session', {
      newParticipants: session.participants.map(p => ({
        username: p.user.username,
        role: p.role,
        userId: p.user._id
      }))
    });

    const responseParticipants = session.participants.map(p => ({
      username: p.user.username,
      role: p.role,
      joinedAt: p.joinedAt
    }));

    console.log('🔵 ADD USER: Sending response', { responseParticipants });

    res.json({
      message: `User ${username} added to session successfully`,
      participants: responseParticipants
    });
  } catch (error) {
    console.error('🔴 ADD USER ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove user from session (owner only)
router.post('/:sessionId/remove-user', async (req, res) => {
  try {
    const { username, ownerUsername } = req.body;
    console.log('🔴 REMOVE USER: Starting remove user process', {
      sessionId: req.params.sessionId,
      username,
      ownerUsername
    });
    
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

    console.log('🔴 REMOVE USER: Session found', {
      sessionId: session.sessionId,
      owner: session.owner.username,
      currentParticipants: session.participants.map(p => ({
        username: p.user.username,
        role: p.role,
        userId: p.user._id
      }))
    });

    // Verify the requester is the session owner
    if (session.owner.username !== ownerUsername) {
      return res.status(403).json({ error: 'Only session owner can remove users' });
    }

    // Cannot remove the owner
    if (username === session.owner.username) {
      return res.status(400).json({ error: 'Cannot remove session owner' });
    }

    // Find the user to remove
    const userToRemove = session.participants.find(p => p.user.username === username);
    console.log('🔴 REMOVE USER: User to remove', userToRemove ? {
      username: userToRemove.user.username,
      role: userToRemove.role,
      userId: userToRemove.user._id
    } : 'NOT FOUND');

    // Remove user from participants
    session.participants = session.participants.filter(p => 
      p.user.username !== username
    );

    await session.save();

    // Re-populate to get fresh data
    await session.populate('participants.user', 'username');

    console.log('🔴 REMOVE USER: User removed from session', {
      remainingParticipants: session.participants.map(p => ({
        username: p.user.username,
        role: p.role,
        userId: p.user._id
      }))
    });

    const responseParticipants = session.participants.map(p => ({
      username: p.user.username,
      role: p.role,
      joinedAt: p.joinedAt
    }));

    console.log('🔴 REMOVE USER: Sending response', { responseParticipants });

    res.json({
      message: `User ${username} removed from session successfully`,
      participants: responseParticipants
    });
  } catch (error) {
    console.error('🔴 REMOVE USER ERROR:', error);
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
    terminalService.cleanupSession(session.sessionId);
    
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
        name: session.documentId?.title || 'Untitled Workspace',
        description: `${session.documentId?.language || 'Mixed'} collaborative workspace`,
        owner: session.owner.username,
        isOwner,
        isActive: session.isActive,
        participantCount: session.participants.length,
        language: session.documentId?.language || 'javascript',
        createdAt: session.createdAt,
        participants
      };
    });

    res.json({ workspaces });
  } catch (error) {
    console.error('List workspaces error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete workspace/session (owner only, no auth required - using username)
router.delete('/workspaces/:sessionId/:username', async (req, res) => {
  try {
    const { sessionId, username } = req.params;
    
    if (!sessionId || !username) {
      return res.status(400).json({ error: 'Session ID and username are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find session
    const session = await CollaborationSession.findOne({ sessionId })
      .populate('owner', 'username');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is the owner
    if (session.owner._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only session owner can delete the session' });
    }

    // Cleanup terminals
    terminalService.cleanupSession(session.sessionId);
    
    // Cleanup workspace
    await workspaceService.cleanupWorkspace(session.sessionId);
    
    // Delete the session completely
    await CollaborationSession.findByIdAndDelete(session._id);

    res.json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;