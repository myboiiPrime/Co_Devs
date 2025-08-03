const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  shareDocument
} = require('../controllers/documentController');

// @route   GET /api/documents
router.get('/', auth, getDocuments);

// @route   POST /api/documents
router.post('/', auth, createDocument);

// @route   GET /api/documents/:id
router.get('/:id', auth, getDocument);

// @route   PUT /api/documents/:id
router.put('/:id', auth, updateDocument);

// @route   DELETE /api/documents/:id
router.delete('/:id', auth, deleteDocument);

// @route   POST /api/documents/:id/share
router.post('/:id/share', auth, shareDocument);

module.exports = router;