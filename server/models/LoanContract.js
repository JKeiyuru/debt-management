// server/models/LoanContract.js
const mongoose = require('mongoose');

const loanContractSchema = new mongoose.Schema({
  contractNumber: {
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
  
  // Business Information
  businessInfo: {
    name: String,
    logo: String,
    address: String,
    phone: String,
    email: String
  },
  
  // Contract Terms
  terms: {
    loanAmount: Number,
    interestRate: Number,
    interestType: String,
    totalAmount: Number,
    disbursedAmount: Number,
    repaymentPeriod: String,
    repaymentSchedule: String,
    installmentAmount: Number,
    firstInstallmentDate: Date,
    finalInstallmentDate: Date,
    penaltyRate: String,
    gracePeriod: String
  },
  
  // Fees
  fees: {
    processingFee: Number,
    legalFee: Number,
    insuranceFee: Number,
    otherFees: Number,
    total: Number
  },
  
  // Collateral
  collateral: {
    hasCollateral: Boolean,
    type: String,
    value: Number,
    identifier: String,
    location: String
  },
  
  // Custom Clauses
  clauses: [String],
  
  // Legal Terms
  defaultDefinition: String,
  defaultAction: String,
  dataConsentText: String,
  
  // Signature Information
  signatures: {
    borrower: {
      signed: Boolean,
      signedDate: Date,
      signedBy: String,
      ipAddress: String
    },
    lender: {
      signed: Boolean,
      signedDate: Date,
      signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    witness: {
      name: String,
      signed: Boolean,
      signedDate: Date
    }
  },
  
  // Document Storage
  pdfUrl: String,
  documentVersion: {
    type: Number,
    default: 1
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'signed', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Tracking
  sentDate: Date,
  sentVia: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'in_person']
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate contract number
loanContractSchema.pre('save', async function(next) {
  if (!this.contractNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await mongoose.model('LoanContract').countDocuments();
    const sequence = (count + 1).toString().padStart(5, '0');
    
    this.contractNumber = `CON${year}${month}${sequence}`;
  }
  next();
});

module.exports = mongoose.model('LoanContract', loanContractSchema);
