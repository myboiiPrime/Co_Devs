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
      console.log('🐛 SOCKET AUTH: Received token:', token ? 'Token present' : 'No token');
      
      if (!token) {
        console.error('❌ SOCKET AUTH: No token provided');
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🐛 SOCKET AUTH: Token decoded successfully, userId:', decoded.userId);
      
      const user = await User.findById(decoded.userId).select('-password');
      console.log('🐛 SOCKET AUTH: User found:', user ? user.username : 'No user');
      
      if (!user) {
        console.error('❌ SOCKET AUTH: User not found for ID:', decoded.userId);
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      console.log('✅ SOCKET AUTH: Authentication successful for user:', user.username);
      next();
    } catch (error) {
      console.error('❌ SOCKET AUTH: Authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.user.username}`);

    // Add catch-all event listener for debugging
    socket.onAny(async (eventName, ...args) => {
      console.log(`🐛 BACKEND: Received event "${eventName}" with args:`, args);
      
      // WORKAROUND: Handle join-collaboration directly in catch-all listener
      if (eventName === 'join-collaboration') {
        console.log('🎯 WORKAROUND: Handling join-collaboration in catch-all listener');
        const data = args[0];
        console.log('🎯 WORKAROUND: Session ID:', data?.sessionId);
        console.log('🎯 WORKAROUND: Socket info:', { 
          id: socket.id, 
          userId: socket.userId, 
          username: socket.user?.username 
        });
        
        // CRITICAL FIX: Join the socket to the session room for chat functionality
        const sessionId = data?.sessionId;
        if (sessionId) {
          socket.join(`session:${sessionId}`);
          console.log('🎯 WORKAROUND: Socket joined session room:', `session:${sessionId}`);
          
          // Update connection to track current session
          const connection = activeConnections.get(socket.userId);
          if (connection) {
            connection.currentSession = sessionId;
            console.log('🎯 WORKAROUND: Updated connection currentSession:', sessionId);
          }
        }
        
        // Fetch actual session data from database
        try {
          const session = await CollaborationSession.findOne({ sessionId })
            .populate('owner', 'username')
            .populate('documentId', 'title')
            .populate('participants.user', 'username');
          
          if (session) {
            console.log('🎯 WORKAROUND: Found session in database:', {
              sessionId: session.sessionId,
              documentTitle: session.documentId?.title,
              owner: session.owner?.username,
              participantCount: session.participants?.length
            });
            
            // Respond with actual session data
            socket.emit('session-joined', {
              session: {
                sessionId: session.sessionId,
                name: session.documentId?.title || 'Untitled Session',
                owner: { username: session.owner?.username || 'Unknown' },
                createdAt: session.createdAt
              },
              participants: session.participants || [],
              terminals: session.terminalSessions || []
            });
          } else {
            console.log('🎯 WORKAROUND: Session not found in database, using fallback');
            // Fallback response if session not found
            socket.emit('session-joined', {
              session: {
                sessionId: data.sessionId,
                name: 'Session Not Found',
                owner: { username: 'unknown' },
                createdAt: new Date()
              },
              participants: [],
              terminals: []
            });
          }
        } catch (error) {
          console.error('🎯 WORKAROUND: Error fetching session data:', error);
          // Fallback response on error
          socket.emit('session-joined', {
            session: {
              sessionId: data.sessionId,
              name: 'Error Loading Session',
              owner: { username: 'unknown' },
              createdAt: new Date()
            },
            participants: [],
            terminals: []
          });
        }
        
        console.log('🎯 WORKAROUND: Emitted session-joined response');
      }
    });

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

    // Test event to verify socket communication
    socket.on('test-event', (data) => {
      console.log('🧪 TEST EVENT RECEIVED:', data);
      socket.emit('test-response', { message: 'Backend received test event', data });
    });

    // Simple test handler to verify handler registration works
    socket.on('simple-test', (data) => {
      console.log('🟢 SIMPLE TEST HANDLER WORKS!', data);
    });

    // STEP 1: Minimal join-collaboration handler - just test event reception
    socket.on('join-collaboration', async (data) => {
      console.log('🎯 STEP 1: join-collaboration event RECEIVED!', data);
      console.log('🎯 STEP 1: Socket info:', { 
        id: socket.id, 
        userId: socket.userId, 
        username: socket.user?.username 
      });
      
      // Immediately respond to confirm event was received
      socket.emit('session-joined', {
        session: {
          sessionId: data.sessionId,
          name: 'Test Session',
          owner: { username: 'test-owner' },
          createdAt: new Date()
        },
        participants: [],
        terminals: []
      });
      
      console.log('🎯 STEP 1: Emitted session-joined response');
    });

    // Create new terminal in session
    socket.on('create-terminal', async (data) => {
      console.log('🐛 CREATE-TERMINAL EVENT RECEIVED:', data);
      
      try {
        const { sessionId, shellType = 'bash', name = 'Terminal' } = data;
        
        console.log('🐛 Step 1: Extracting data:', { sessionId, shellType, name });
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session) {
          console.error('❌ Session not found:', sessionId);
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        console.log('🐛 Step 2: Session found:', {
          sessionId: session.sessionId,
          owner: session.owner,
          participants: session.participants.length,
          terminalCount: session.terminalSessions.length,
          settings: session.settings
        });
    
        if (!session.hasAccess(socket.userId)) {
          console.error('❌ Access denied for user:', socket.userId);
          socket.emit('error', { message: 'Access denied' });
          return;
        }
        
        console.log('🐛 Step 3: Access granted for user:', socket.userId);
    
        // Check terminal limit
        if (session.terminalSessions.length >= session.settings.maxTerminals) {
          console.error('❌ Terminal limit reached:', {
            current: session.terminalSessions.length,
            max: session.settings.maxTerminals
          });
          socket.emit('error', { message: 'Maximum number of terminals reached' });
          return;
        }
        
        console.log('🐛 Step 4: Terminal limit check passed:', {
          current: session.terminalSessions.length,
          max: session.settings.maxTerminals
        });
    
        // Check if shell type is allowed
        const allowedShells = (session.settings.allowedShells && session.settings.allowedShells.length > 0) 
          ? session.settings.allowedShells 
          : ['bash', 'cmd', 'powershell', 'python', 'node'];
    
        console.log('🐛 Step 5: Shell validation debug:', {
          shellType,
          allowedShells,
          sessionSettings: session.settings,
          isAllowed: allowedShells.includes(shellType)
        });
    
        if (!allowedShells.includes(shellType)) {
          console.error('❌ Shell type not allowed:', { shellType, allowedShells });
          socket.emit('error', { message: 'Shell type not allowed' });
          return;
        }
        
        console.log('🐛 Step 6: Shell type validation passed');
    
        const terminalId = `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🐛 Step 7: Generated terminal ID:', terminalId);
        
        // Create terminal
        console.log('🐛 Step 8: Creating terminal via terminalService...');
        const terminal = terminalService.createTerminal(
          sessionId,
          terminalId,
          shellType,
          session.workspaceDir,
          socket
        );
        console.log('🐛 Step 9: Terminal created via terminalService:', !!terminal);
    
        // Save terminal to session
        console.log('🐛 Step 10: Adding terminal to session...');
        await session.addTerminal({
          terminalId,
          name,
          shellType,
          createdBy: socket.userId
        });
        console.log('🐛 Step 11: Terminal added to session successfully');
    
        // In the create-terminal handler, after the session room emit:
        // Notify all participants
        console.log('🐛 Step 12: Emitting terminal-created event to session:', `session:${sessionId}`);
        const eventData = {
          terminalId,
          name,
          shellType,
          createdBy: {
            id: socket.user._id,
            username: socket.user.username
          }
        };
        console.log('🐛 Step 13: Event data:', eventData);
    
        // Emit to session room
        io.to(`session:${sessionId}`).emit('terminal-created', eventData);
        console.log('🐛 Step 14: terminal-created event emitted to session room');
    
        // ALSO emit directly to the requesting socket as a fallback
        socket.emit('terminal-created', eventData);
        console.log('🐛 Step 15: terminal-created event emitted directly to requesting socket');
    
        console.log(`✅ Terminal created successfully: ${terminalId} by ${socket.user.username}`);
      } catch (error) {
        console.error('❌ Create terminal error:', error);
        console.error('❌ Error stack:', error.stack);
        socket.emit('error', { message: 'Failed to create terminal: ' + error.message });
      }
    });

    // Handle terminal input
    socket.on('terminal-input', (data) => {
      try {
        const { sessionId, terminalId, input } = data;
        
        // Remove collaboration session check - allow all terminal input
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

        // Destroy terminal
        terminalService.destroyTerminal(sessionId, terminalId);
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

    // Get existing terminals for a session
    socket.on('get-session-terminals', async (data) => {
      try {
        const { sessionId } = data;
        console.log('🔍 Getting existing terminals for session:', sessionId);
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session) {
          console.log('❌ Session not found:', sessionId);
          socket.emit('error', { message: 'Session not found' });
          return;
        }
    
        // Get terminals from session
        const terminals = session.terminals || [];
        console.log('📋 Found terminals in session:', terminals.length);
        
        // Send existing terminals to the requesting client
        terminals.forEach(terminal => {
          const eventData = {
            terminalId: terminal.terminalId,
            name: terminal.name,
            shellType: terminal.shellType,
            createdBy: terminal.createdBy
          };
          
          console.log('📤 Sending existing terminal:', eventData);
          socket.emit('terminal-created', eventData);
        });
        
        console.log('✅ Sent all existing terminals to client');
        
      } catch (error) {
        console.error('❌ Get session terminals error:', error);
        socket.emit('error', { message: 'Failed to get terminals: ' + error.message });
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

    // Chat functionality
    socket.on('send-chat-message', async (data) => {
      try {
        console.log('🔵 BACKEND: Received send-chat-message event:', data);
        console.log('🔵 BACKEND: Socket user:', socket.user?.username);
        console.log('🔵 BACKEND: Socket userId:', socket.userId);
        
        const { sessionId, content } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          console.log('❌ BACKEND: Access denied for chat message');
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        console.log('🔵 BACKEND: Session found, creating message data');
        const messageData = {
          id: Date.now() + Math.random(),
          user: {
            id: socket.user._id,
            username: socket.user.username
          },
          content: content.trim(),
          timestamp: new Date(),
          type: 'message'
        };

        console.log('🔵 BACKEND: Message data created:', messageData);

        // Save message to session
        if (!session.chatMessages) {
          session.chatMessages = [];
        }
        session.chatMessages.push(messageData);
        await session.save();

        console.log('🔵 BACKEND: Message saved to database');

        // Broadcast to all users in the session
        io.to(`session:${sessionId}`).emit('chat-message', messageData);
        console.log('🟢 BACKEND: Chat message broadcasted to session:', sessionId);

      } catch (error) {
        console.error('❌ BACKEND: Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('get-chat-history', async (data) => {
      try {
        const { sessionId } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const messages = session.chatMessages || [];
        socket.emit('chat-history', { messages });

      } catch (error) {
        console.error('Chat history error:', error);
        socket.emit('error', { message: 'Failed to load chat history' });
      }
    });

    socket.on('user-typing', async (data) => {
      try {
        const { sessionId } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          return;
        }

        // Broadcast typing indicator to other users
        socket.to(`session:${sessionId}`).emit('user-typing', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

      } catch (error) {
        console.error('User typing error:', error);
      }
    });

    socket.on('user-stopped-typing', async (data) => {
      try {
        const { sessionId } = data;
        
        const session = await CollaborationSession.findOne({ sessionId });
        if (!session || !session.hasAccess(socket.userId)) {
          return;
        }

        // Broadcast stop typing indicator to other users
        socket.to(`session:${sessionId}`).emit('user-stopped-typing', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

      } catch (error) {
        console.error('User stopped typing error:', error);
      }
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