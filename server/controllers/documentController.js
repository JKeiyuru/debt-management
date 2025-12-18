// server/controllers/documentController.js
const Document = require('../models/Document');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/auditLogger');
const cloudinary = require('../config/cloudinary');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const {
      name,
      category,
      entityType,
      entityId,
      description
    } = req.body;

    // Validate entity exists
    let entity;
    if (entityType === 'Loan') {
      entity = await Loan.findById(entityId);
    } else if (entityType === 'Customer') {
      entity = await Customer.findById(entityId);
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: `${entityType} not found`
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // File is already uploaded to Cloudinary via multer middleware
    const document = await Document.create({
      name: name || req.file.originalname,
      category,
      entityType,
      entityId,
      description,
      fileUrl: req.file.path, // Cloudinary URL
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryId: req.file.filename, // For deletion later
      uploadedBy: req.user.id
    });

    // Add document reference to entity
    if (entityType === 'Loan') {
      await Loan.findByIdAndUpdate(entityId, {
        $push: { documents: document._id }
      });
    } else if (entityType === 'Customer') {
      await Customer.findByIdAndUpdate(entityId, {
        $push: { documents: document._id }
      });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      entity: 'Document',
      entityId: document._id,
      details: `Document uploaded: ${document.name} for ${entityType}`
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// @desc    Get documents for entity
// @route   GET /api/documents/:entityType/:entityId
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { category } = req.query;

    const query = { entityType, entityId };
    if (category) query.category = category;

    const documents = await Document.find(query)
      .populate('uploadedBy', 'fullName email')
      .sort('-uploadedAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: { documents }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'fullName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only allow updating name, category, description
    const { name, category, description } = req.body;

    document = await Document.findByIdAndUpdate(
      req.params.id,
      { name, category, description },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      userId: req.user.id,
      action: 'DOCUMENT_UPDATED',
      entity: 'Document',
      entityId: document._id,
      details: `Document updated: ${document.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await cloudinary.uploader.destroy(document.cloudinaryId);
    }

    // Remove reference from entity
    if (document.entityType === 'Loan') {
      await Loan.findByIdAndUpdate(document.entityId, {
        $pull: { documents: document._id }
      });
    } else if (document.entityType === 'Customer') {
      await Customer.findByIdAndUpdate(document.entityId, {
        $pull: { documents: document._id }
      });
    }

    await document.deleteOne();

    await createAuditLog({
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      entity: 'Document',
      entityId: document._id,
      details: `Document deleted: ${document.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Increment download count
    document.downloads += 1;
    await document.save();

    // Return the Cloudinary URL for download
    res.status(200).json({
      success: true,
      data: { 
        url: document.fileUrl,
        name: document.name
      }
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
};