const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    default: '// Welcome to the collaborative code editor!\n// Start typing to begin...',
    // Add content size validation
    validate: {
      validator: function(content) {
        // Check if content size exceeds 10MB (leaving 6MB buffer for other fields)
        const sizeInBytes = Buffer.byteLength(content || '', 'utf8');
        return sizeInBytes <= 10 * 1024 * 1024; // 10MB limit
      },
      message: 'Document content cannot exceed 10MB'
    }
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'html', 'css', 'java', 'cpp', 'typescript', 'json', 'markdown'],
    default: 'javascript'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'write'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  // Add size tracking
  contentSize: {
    type: Number,
    default: 0
  },
  activeUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cursor: {
      line: Number,
      column: Number
    },
    selection: {
      startLine: Number,
      startColumn: Number,
      endLine: Number,
      endColumn: Number
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Enhanced pre-save hook with size calculation
documentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  
  // Calculate and store content size
  if (this.content) {
    this.contentSize = Buffer.byteLength(this.content, 'utf8');
  }
  
  // Additional validation for total document size
  const estimatedDocSize = JSON.stringify(this.toObject()).length;
  if (estimatedDocSize > 15 * 1024 * 1024) { // 15MB warning (1MB buffer)
    console.warn(`Document approaching size limit: ${(estimatedDocSize / 1024 / 1024).toFixed(2)}MB`);
  }
  
  next();
});

// Add method to check document size
documentSchema.methods.getSizeInfo = function() {
  const contentSize = this.contentSize || 0;
  const totalSize = JSON.stringify(this.toObject()).length;
  
  return {
    contentSize: contentSize,
    contentSizeMB: (contentSize / 1024 / 1024).toFixed(2),
    totalSize: totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    remainingSpace: 16 * 1024 * 1024 - totalSize,
    remainingSpaceMB: ((16 * 1024 * 1024 - totalSize) / 1024 / 1024).toFixed(2)
  };
};

module.exports = mongoose.model('Document', documentSchema);