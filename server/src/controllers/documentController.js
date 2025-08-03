const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Get all documents for authenticated user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find documents where user is owner or collaborator
    const documents = await Document.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
        { isPublic: true }
      ]
    })
    .populate('owner', 'username email avatar')
    .populate('collaborators.user', 'username email avatar')
    .sort({ lastModified: -1 });

    res.json({
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        language: doc.language,
        owner: doc.owner,
        isPublic: doc.isPublic,
        lastModified: doc.lastModified,
        collaborators: doc.collaborators,
        version: doc.version
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
const createDocument = async (req, res) => {
  try {
    const { title, content, language, isPublic } = req.body;
    const userId = req.user.userId;

    const document = new Document({
      title,
      content: content || '// Welcome to the collaborative code editor!\n// Start typing to begin...',
      language: language || 'javascript',
      owner: userId,
      isPublic: isPublic || false
    });

    await document.save();
    await document.populate('owner', 'username email avatar');

    res.status(201).json({
      message: 'Document created successfully',
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        language: document.language,
        owner: document.owner,
        isPublic: document.isPublic,
        version: document.version,
        lastModified: document.lastModified,
        collaborators: document.collaborators
      }
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Server error creating document' });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;

    const document = await Document.findById(documentId)
      .populate('owner', 'username email avatar')
      .populate('collaborators.user', 'username email avatar')
      .populate('activeUsers.user', 'username email avatar');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    const hasAccess = document.isPublic || 
                     document.owner._id.toString() === userId ||
                     document.collaborators.some(collab => collab.user._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        language: document.language,
        owner: document.owner,
        collaborators: document.collaborators,
        isPublic: document.isPublic,
        version: document.version,
        lastModified: document.lastModified,
        activeUsers: document.activeUsers
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error fetching document' });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    const { title, content, language, isPublic } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check write permissions
    const canWrite = document.owner.toString() === userId ||
                    document.collaborators.some(collab => 
                      collab.user.toString() === userId && 
                      ['write', 'admin'].includes(collab.permission)
                    );

    if (!canWrite) {
      return res.status(403).json({ message: 'No write permission' });
    }

    // Update fields
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (language !== undefined) document.language = language;
    if (isPublic !== undefined && document.owner.toString() === userId) {
      document.isPublic = isPublic;
    }

    document.version += 1;
    await document.save();

    await document.populate('owner', 'username email avatar');
    await document.populate('collaborators.user', 'username email avatar');

    res.json({
      message: 'Document updated successfully',
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        language: document.language,
        owner: document.owner,
        collaborators: document.collaborators,
        isPublic: document.isPublic,
        version: document.version,
        lastModified: document.lastModified
      }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error updating document' });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can delete
    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only owner can delete document' });
    }

    await Document.findByIdAndDelete(documentId);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

// @desc    Share document with user
// @route   POST /api/documents/:id/share
// @access  Private
const shareDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    const { email, permission } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has admin permission
    const hasAdminAccess = document.owner.toString() === userId ||
                          document.collaborators.some(collab => 
                            collab.user.toString() === userId && 
                            collab.permission === 'admin'
                          );

    if (!hasAdminAccess) {
      return res.status(403).json({ message: 'Admin permission required' });
    }

    // Find user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a collaborator
    const existingCollaborator = document.collaborators.find(
      collab => collab.user.toString() === userToShare._id.toString()
    );

    if (existingCollaborator) {
      existingCollaborator.permission = permission;
    } else {
      document.collaborators.push({
        user: userToShare._id,
        permission: permission || 'write'
      });
    }

    await document.save();
    await document.populate('collaborators.user', 'username email avatar');

    res.json({
      message: 'Document shared successfully',
      collaborators: document.collaborators
    });
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ message: 'Server error sharing document' });
  }
};

module.exports = {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  shareDocument
};