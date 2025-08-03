const mongoose = require('mongoose');

const collaborationSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  terminalSessions: [{
    terminalId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Terminal'
    },
    shellType: {
      type: String,
      enum: ['bash', 'cmd', 'powershell', 'python', 'node'],
      default: 'bash'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatMessages: [{
    id: {
      type: String,
      required: true
    },
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      username: {
        type: String,
        required: true
      }
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'system'],
      default: 'message'
    }
  }],
  workspaceDir: {
    type: String,
    required: true
  },
  settings: {
    maxTerminals: {
      type: Number,
      default: 5
    },
    allowedShells: {
      type: [{
        type: String,
        enum: ['bash', 'cmd', 'powershell', 'python', 'node']
      }],
      default: ['bash', 'cmd', 'powershell', 'python', 'node']
    },
    fileSystemAccess: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Index for efficient queries
// collaborationSessionSchema.index({ sessionId: 1 }); // Remove this - sessionId already has unique index
collaborationSessionSchema.index({ documentId: 1 });
collaborationSessionSchema.index({ owner: 1 });
collaborationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
collaborationSessionSchema.methods.addParticipant = function(userId, role = 'editor') {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({ user: userId, role });
  }
  
  return this.save();
};

collaborationSessionSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => 
    p.user.toString() !== userId.toString()
  );
  
  return this.save();
};

collaborationSessionSchema.methods.addTerminal = function(terminalData) {
  if (this.terminalSessions.length >= this.settings.maxTerminals) {
    throw new Error('Maximum number of terminals reached');
  }
  
  this.terminalSessions.push(terminalData);
  return this.save();
};

collaborationSessionSchema.methods.removeTerminal = function(terminalId) {
  this.terminalSessions = this.terminalSessions.filter(t => 
    t.terminalId !== terminalId
  );
  
  return this.save();
};

collaborationSessionSchema.methods.hasAccess = function(userId) {
  console.log('🐛 HASACCESS DEBUG: Input userId:', userId, typeof userId);
  console.log('🐛 HASACCESS DEBUG: Owner:', this.owner, typeof this.owner);
  console.log('🐛 HASACCESS DEBUG: Owner toString:', this.owner.toString());
  console.log('🐛 HASACCESS DEBUG: Participants array:', this.participants);
  console.log('🐛 HASACCESS DEBUG: Participants structure:', this.participants.map(p => ({
    participant: p,
    user: p.user,
    userType: typeof p.user,
    userToString: p.user ? p.user.toString() : 'NO USER'
  })));
  
  const isOwner = this.owner.toString() === userId.toString();
  const isParticipant = this.participants.some(p => {
    const participantUserId = p.user ? p.user.toString() : null;
    console.log('🐛 HASACCESS DEBUG: Comparing participant:', participantUserId, 'with userId:', userId);
    return participantUserId === userId.toString();
  });
  
  console.log('🐛 HASACCESS DEBUG: Final result - isOwner:', isOwner, 'isParticipant:', isParticipant);
  
  return isOwner || isParticipant;
};

module.exports = mongoose.model('CollaborationSession', collaborationSessionSchema);