const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
    required: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0
  },
  allocation: {
    penalty: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    interest: {
      type: Number,
      default: 0
    },
    principal: {
      type: Number,
      default: 0
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mobile_money', 'cheque', 'card'],
    required: true
  },
  transactionReference: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'cleared', 'bounced', 'reversed'],
    default: 'cleared'
  },
  notes: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String
  },
  receiptIssued: {
    type: Boolean,
    default: false
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branch: {
    type: String
  },
  reversalInfo: {
    reversed: {
      type: Boolean,
      default: false
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reversedDate: Date,
    reason: String
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ loan: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);