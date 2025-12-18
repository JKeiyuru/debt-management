// server/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Document category is required'],
    enum: [
      'contract',
      'identification',
      'security_collateral',
      'proof_of_income',
      'bank_statement',
      'business_registration',
      'title_deed',
      'logbook',
      'guarantor_documents',
      'payment_receipt',
      'other'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Loan', 'Customer']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  cloudinaryId: {
    type: String, // For deletion
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  downloads: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  tags: [String]
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ entityType: 1, entityId: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ uploadedAt: -1 });

// Virtual for file size in MB
documentSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);