// server/routes/documents.js
const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  downloadDocument
} = require('../controllers/documentController');
const { protect, checkPermission } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// All routes are protected
router.use(protect);

// Upload document
router.post(
  '/upload',
  upload.single('file'),
  uploadDocument
);

// Get documents for entity
router.get('/:entityType/:entityId', getDocuments);

// Single document operations
router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

// Download document
router.get('/:id/download', downloadDocument);

module.exports = router;