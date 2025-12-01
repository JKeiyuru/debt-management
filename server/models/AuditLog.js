const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTERED',
      'USER_UPDATED',
      'PASSWORD_CHANGED',
      'PROFILE_UPDATED',
      'CUSTOMER_CREATED',
      'CUSTOMER_UPDATED',
      'CUSTOMER_DELETED',
      'LOAN_CREATED',
      'LOAN_APPROVED',
      'LOAN_DISBURSED',
      'LOAN_UPDATED',
      'LOAN_RESTRUCTURED',
      'LOAN_WRITTEN_OFF',
      'PAYMENT_RECORDED',
      'PAYMENT_UPDATED',
      'PAYMENT_DELETED',
      'REPORT_GENERATED',
      'REPORT_EXPORTED',
      'SETTINGS_UPDATED'
    ]
  },
  entity: {
    type: String,
    required: true,
    enum: ['User', 'Customer', 'Loan', 'Payment', 'Report', 'Settings']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: false
});

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);