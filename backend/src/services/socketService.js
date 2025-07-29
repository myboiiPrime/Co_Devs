const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Document = require('../models/Document');
const CollaborationSession = require('../models/CollaborationSession');
const terminalService = require('./terminalService');
const workspaceService = require('./workspaceService');

// Store active connections
const activeConnections = new Map();

module.exports = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.user.username}`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true, 
      lastSeen: new Date() 
    });

    // Store connection
    activeConnections.set(socket.userId, {
      socket,
      user: socket.user,
      currentDocument: null,
      currentSession: null
    });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Document collaboration events
    socket.on('join-document', async (data) => {
      try {
        const { documentId } = data;
        const document = await Document.findById(documentId);
        
        if (!document) {
          socket.emit('error', { message: 'Document not found' });
          return;
        }

        // Check permissions
        if (!document.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Leave previous document if any
        const connection = activeConnections.get(socket.userId);
        if (connection.currentDocument) {
          socket.leave(`document:${connection.currentDocument}`);
          await removeUserFromDocument(connection.currentDocument, socket.userId);
        }

        // Join new document
        socket.join(`document:${documentId}`);
        connection.currentDocument = documentId;

        // Add user to document
        await addUserToDocument(documentId, socket.userId);

        // Send document data
        const populatedDocument = await Document.findById(documentId)
          .populate('owner', 'username email')
          .populate('collaborators.user', 'username email')
          .populate('activeUsers.user', 'username email');

        socket.emit('document-joined', {
          document: populatedDocument,
          activeUsers: populatedDocument.activeUsers
        });

        // Notify other users
        socket.to(`document:${documentId}`).emit('user-joined', {
          user: {
            id: socket.user._id,
            username: socket.user.username,
            email: socket.user.email
          },
          message: `${socket.user.username} joined the document`
        });

      } catch (error) {
        console.error('Join document error:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    socket.on('leave-document', async (data) => {
      try {
        const { documentId } = data;
        const connection = activeConnections.get(socket.userId);
        
        if (connection.currentDocument === documentId) {
          socket.leave(`document:${documentId}`);
          connection.currentDocument = null;
          
          await removeUserFromDocument(documentId, socket.userId);
          
          socket.to(`document:${documentId}`).emit('user-left', {
            user: {
              id: socket.user._id,
              username: socket.user.username
            },
            message: `${socket.user.username} left the document`
          });
        }
      } catch (error) {
        console.error('Leave document error:', error);
      }
    });

    socket.on('document-change', async (data) => {
      try {
        const { documentId, operation, content } = data;
        
        const connection = activeConnections.get(socket.userId);
        if (connection.currentDocument !== documentId) {
          socket.emit('error', { message: 'Not in document' });
          return;
        }

        // Update document
        await Document.findByIdAndUpdate(documentId, {
          content,
          lastModified: new Date(),
          lastModifiedBy: socket.userId
        });

        // Update user activity
        await updateUserActivity(documentId, socket.userId);

        // Broadcast to other users
        socket.to(`document:${documentId}`).emit('document-changed', {
          operation,
          content,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

      } catch (error) {
        console.error('Document change error:', error);
      }
    });

    socket.on('cursor-position', async (data) => {
      try {
        const { documentId, position } = data;
        
        const connection = activeConnections.get(socket.userId);
        if (connection.currentDocument !== documentId) {
          return;
        }

        // Update cursor position in database
        await Document.findOneAndUpdate(
          { 
            _id: documentId,
            'activeUsers.user': socket.userId 
          },
          {
            $set: {
              'activeUsers.$.cursor': position,
              'activeUsers.$.lastActivity': new Date()
            }
          }
        );

        // Broadcast to other users
        socket.to(`document:${documentId}`).emit('cursor-moved', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          },
          position
        });

      } catch (error) {
        console.error('Cursor position error:', error);
      }
    });

    // Collaboration session events
    socket.on('join-collaboration', async (data) => {
      try {
        const { sessionId } = data;
        
        const session = await CollaborationSession.findOne({ sessionId })
          .populate('owner', 'username email')
          .populate('participants.user', 'username email');
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        if (!session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Leave previous session if any
        const connection = activeConnections.get(socket.userId);
        if (connection.currentSession) {
          socket.leave(`session:${connection.currentSession}`);
        }

        // Join new session
        socket.join(`session:${sessionId}`);
        connection.currentSession = sessionId;

        // Add user to session if not already a participant
        if (!session.participants.some(p => p.user._id.toString() === socket.userId)) {
          await session.addParticipant(socket.userId);
        }

        // Send session data
        const updatedSession = await CollaborationSession.findOne({ sessionId })
          .populate('owner', 'username email')
          .populate('participants.user', 'username email');

        socket.emit('session-joined', {
          session: updatedSession,
          participants: updatedSession.participants
        });

        // Notify other participants
        socket.to(`session:${sessionId}`).emit('user-joined-session', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          },
          message: `${socket.user.username} joined the collaboration`
        });

      } catch (error) {
        console.error('Join collaboration error:', error);
        socket.emit('error', { message: 'Failed to join collaboration' });
      }
    });

    // Create new terminal in session
    socket.on('create-terminal', async (data) => {
      try {
        const { sessionId, shellType = 'bash', name = 'Terminal' } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        if (!session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Check terminal limit
        if (session.terminalSessions.length >= session.settings.maxTerminals) {
          socket.emit('error', { message: 'Maximum number of terminals reached' });
          return;
        }

        // Check if shell type is allowed
        if (!session.settings.allowedShells.includes(shellType)) {
          socket.emit('error', { message: 'Shell type not allowed' });
          return;
        }

        const terminalId = `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create terminal
        const terminal = terminalService.createTerminal(
          sessionId,
          terminalId,
          shellType,
          session.workspaceDir,
          socket
        );

        // Save terminal to session
        await session.addTerminal({
          terminalId,
          name,
          shellType,
          createdBy: socket.userId
        });

        // Notify all participants
        io.to(`session:${sessionId}`).emit('terminal-created', {
          terminalId,
          name,
          shellType,
          createdBy: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        console.log(`🖥️ Terminal created: ${terminalId} by ${socket.user.username}`);

      } catch (error) {
        console.error('Create terminal error:', error);
        socket.emit('error', { message: 'Failed to create terminal' });
      }
    });

    // Handle terminal input
    socket.on('terminal-input', (data) => {
      try {
        const { sessionId, terminalId, input } = data;
        
        // Verify user has access to session
        const connection = activeConnections.get(socket.userId);
        if (!connection || connection.currentSession !== sessionId) {
          socket.emit('error', { message: 'Not in collaboration session' });
          return;
        }

        terminalService.writeToTerminal(sessionId, terminalId, input);
        
        // Broadcast input to other users (for display purposes)
        socket.to(`session:${sessionId}`).emit('terminal-input-echo', {
          terminalId,
          input,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

      } catch (error) {
        console.error('Terminal input error:', error);
      }
    });

    // Handle terminal resize
    socket.on('terminal-resize', (data) => {
      try {
        const { sessionId, terminalId, cols, rows } = data;
        
        const connection = activeConnections.get(socket.userId);
        if (!connection || connection.currentSession !== sessionId) {
          return;
        }

        terminalService.resizeTerminal(sessionId, terminalId, cols, rows);
        
        // Broadcast resize to other users
        socket.to(`session:${sessionId}`).emit('terminal-resized', {
          terminalId,
          cols,
          rows
        });

      } catch (error) {
        console.error('Terminal resize error:', error);
      }
    });

    // Close terminal
    socket.on('close-terminal', async (data) => {
      try {
        const { sessionId, terminalId } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Remove terminal
        terminalService.removeTerminal(sessionId, terminalId);
        await session.removeTerminal(terminalId);

        // Notify all participants
        io.to(`session:${sessionId}`).emit('terminal-closed', {
          terminalId,
          closedBy: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        console.log(`🖥️ Terminal closed: ${terminalId} by ${socket.user.username}`);

      } catch (error) {
        console.error('Close terminal error:', error);
        socket.emit('error', { message: 'Failed to close terminal' });
      }
    });

    // Get terminal history
    socket.on('get-terminal-history', (data) => {
      try {
        const { terminalId } = data;
        const history = terminalService.getTerminalHistory(terminalId);
        socket.emit('terminal-history', { terminalId, history });
      } catch (error) {
        console.error('Get terminal history error:', error);
      }
    });

    // File system operations via socket
    socket.on('fs-list', async (data) => {
      try {
        const { sessionId, path = '' } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const files = await workspaceService.listFiles(sessionId, path);
        socket.emit('fs-list-result', { path, files });
      } catch (error) {
        console.error('FS list error:', error);
        socket.emit('error', { message: 'Failed to list files' });
      }
    });

    socket.on('fs-read', async (data) => {
      try {
        const { sessionId, path } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('fs-read-result', { 
            path, 
            success: false, 
            error: 'Access denied' 
          });
          return;
        }

        const content = await workspaceService.readFile(sessionId, path);
        socket.emit('fs-read-result', { path, content, success: true });
      } catch (error) {
        console.error('FS read error:', error);
        // CHANGE THIS LINE to emit consistent format
        socket.emit('fs-read-result', { 
          path: data.path, 
          success: false, 
          error: error.message || 'Failed to read file' 
        });
      }
    });

    socket.on('fs-write', async (data) => {
      try {
        const { sessionId, path, content } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        await workspaceService.writeFile(sessionId, path, content);
        
        // Notify other participants
        socket.to(`session:${sessionId}`).emit('fs-file-changed', {
          path,
          action: 'write',
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        socket.emit('fs-write-result', { path, success: true });
      } catch (error) {
        console.error('FS write error:', error);
        socket.emit('error', { message: 'Failed to write file' });
      }
    });

    socket.on('fs-create', async (data) => {
      try {
        const { sessionId, path, type } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        if (type === 'file') {
          await workspaceService.createFile(sessionId, path);
        } else if (type === 'folder') {
          await workspaceService.createDirectory(sessionId, path);
        }

        // Notify other participants
        socket.to(`session:${sessionId}`).emit('fs-item-created', {
          path,
          type,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        socket.emit('fs-create-result', { path, type, success: true });
      } catch (error) {
        console.error('FS create error:', error);
        socket.emit('fs-create-result', { 
          path: data.path, 
          type: data.type, 
          success: false, 
          error: error.message 
        });
      }
    });

    socket.on('fs-delete', async (data) => {
      try {
        const { sessionId, path } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        await workspaceService.deleteItem(sessionId, path);

        // Notify other participants
        socket.to(`session:${sessionId}`).emit('fs-item-deleted', {
          path,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        socket.emit('fs-delete-result', { path, success: true });
      } catch (error) {
        console.error('FS delete error:', error);
        socket.emit('fs-delete-result', { 
          path: data.path, 
          success: false, 
          error: error.message 
        });
      }
    });

    socket.on('fs-rename', async (data) => {
      try {
        const { sessionId, oldPath, newPath } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        await workspaceService.renameItem(sessionId, oldPath, newPath);

        // Notify other participants
        socket.to(`session:${sessionId}`).emit('fs-item-renamed', {
          oldPath,
          newPath,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        socket.emit('fs-rename-result', { oldPath, newPath, success: true });
      } catch (error) {
        console.error('FS rename error:', error);
        socket.emit('fs-rename-result', { 
          oldPath: data.oldPath, 
          newPath: data.newPath, 
          success: false, 
          error: error.message 
        });
      }
    });

    // Handle command execution (for non-interactive terminals)
    socket.on('execute-command', async (data) => {
      try {
        const { sessionId, terminalId, command } = data;

        const connection = activeConnections.get(socket.userId);
        if (!connection || connection.currentSession !== sessionId) {
          socket.emit('error', { message: 'Not in collaboration session' });
          return;
        }

        const session = await CollaborationSession.findOne({ sessionId });
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Execute command using workspace service
        const result = await terminalService.executeCommand(
          sessionId, 
          command, 
          session.workspaceDir
        );

        // Send result back to user
        socket.emit('command-result', {
          terminalId,
          result
        });

        // Broadcast command execution to other users
        socket.to(`session:${sessionId}`).emit('command-executed', {
          terminalId,
          command,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

      } catch (error) {
        console.error('Execute command error:', error);
        socket.emit('error', { message: 'Failed to execute command' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);

      const connection = activeConnections.get(socket.userId);
      if (connection) {
        // Handle document disconnection
        if (connection.currentDocument) {
          const documentId = connection.currentDocument;
          
          // Remove user from document
          await removeUserFromDocument(documentId, socket.userId);
          
          // Notify other users
          socket.to(`document:${documentId}`).emit('user-left', {
            user: {
              id: socket.user._id,
              username: socket.user.username
            },
            message: `${socket.user.username} left the document`
          });
        }

        // Handle collaboration session disconnection
        if (connection.currentSession) {
          const sessionId = connection.currentSession;
          
          // Remove socket from all terminals in the session
          const activeTerminals = terminalService.getSessionTerminals(sessionId);
          activeTerminals.forEach(terminalId => {
            terminalService.removeSocketFromTerminal(terminalId, socket);
          });
          
          // Notify other participants
          socket.to(`session:${sessionId}`).emit('user-left-session', {
            user: {
              id: socket.user._id,
              username: socket.user.username
            },
            message: `${socket.user.username} left the collaboration`
          });
        }
      }

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      });

      // Remove connection
      activeConnections.delete(socket.userId);
    });
  });

  // Helper functions
  async function addUserToDocument(documentId, userId) {
    try {
      await Document.findByIdAndUpdate(documentId, {
        $pull: { activeUsers: { user: userId } }
      });

      await Document.findByIdAndUpdate(documentId, {
        $push: {
          activeUsers: {
            user: userId,
            cursor: { line: 0, column: 0 },
            selection: null,
            lastActivity: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Add user to document error:', error);
    }
  }

  async function removeUserFromDocument(documentId, userId) {
    try {
      await Document.findByIdAndUpdate(documentId, {
        $pull: { activeUsers: { user: userId } }
      });
    } catch (error) {
      console.error('Remove user from document error:', error);
    }
  }

  async function updateUserActivity(documentId, userId) {
    try {
      await Document.findOneAndUpdate(
        { 
          _id: documentId,
          'activeUsers.user': userId 
        },
        {
          $set: {
            'activeUsers.$.lastActivity': new Date()
          }
        }
      );
    } catch (error) {
      console.error('Update user activity error:', error);
    }
  }
};