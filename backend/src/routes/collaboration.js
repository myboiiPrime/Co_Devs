const express = require('express');
const { v4: uuidv4 } = require('uuid');
const CollaborationSession = require('../models/CollaborationSession');
const Document = require('../models/Document');
const User = require('../models/User');
const workspaceService = require('../services/workspaceService');
const terminalService = require('../services/terminalService');
const auth = require('../middleware/auth');

const router = express.Router();

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
        email: `${username}@temp.local`,
        password: 'temp', // This won't be used for login
        isTemporary: true
      });
      await user.save();
    }

    res.json({
      message: 'Successfully joined collaboration session',
      sessionId: session.sessionId,
      username,
      isOwner,
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
      return res.status(403).json({ error: 'Only session owner can add users' });
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
        password: 'temp',
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

// Create new collaboration session
router.post('/create', auth, async (req, res) => {
  try {
    const { documentId, settings = {} } = req.body;
    
    // Verify document exists and user has access
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has access to the document
    const hasAccess = document.owner.toString() === req.user.userId ||
                     document.collaborators.some(collab => collab.user.toString() === req.user.userId) ||
                     document.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sessionId = uuidv4();
    
    // Create isolated workspace
    const workspaceDir = await workspaceService.createCollaborationWorkspace(
      sessionId, 
      document.content, 
      document.language
    );
    
    // Default settings
    const defaultSettings = {
      maxTerminals: 5,
      allowedShells: ['bash', 'cmd', 'powershell', 'python', 'node'],
      fileSystemAccess: true,
      ...settings
    };

    const session = new CollaborationSession({
      sessionId,
      documentId,
      owner: req.user.userId,
      workspaceDir,
      settings: defaultSettings,
      participants: [{ user: req.user.userId, role: 'owner' }]
    });

    await session.save();
    
    res.json({
      sessionId,
      workspaceDir,
      settings: defaultSettings,
      message: 'Collaboration session created successfully'
    });
  } catch (error) {
    console.error('Create collaboration session error:', error);
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

module.exports = router;