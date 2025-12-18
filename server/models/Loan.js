const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  loanProduct: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['personal', 'business', 'emergency', 'asset_financing', 'other'],
      default: 'personal'
    }
  },
  principal: {
    type: Number,
    required: [true, 'Principal amount is required'],
    min: 0
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: 0,
    max: 100
  },
  interestType: {
    type: String,
    enum: ['flat', 'reducing_balance', 'compound'],
    default: 'reducing_balance'
  },
  term: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years'],
      default: 'months'
    }
  },
  repaymentFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'bullet'],
    default: 'monthly'
  },
  amortizationMethod: {
    type: String,
    enum: ['equal_installments', 'equal_principal', 'bullet', 'custom'],
    default: 'equal_installments'
  },
  gracePeriod: {
    type: Number,
    default: 0,
    min: 0
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    insuranceFee: {
      type: Number,
      default: 0
    },
    legalFee: {
      type: Number,
      default: 0
    },
    otherFees: {
      type: Number,
      default: 0
    }
  },
  totalFees: {
    type: Number,
    default: 0
  },
  totalInterest: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  disbursement: {
    amount: Number,
    date: Date,
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'mobile_money', 'cheque'],
      default: 'bank_transfer'
    },
    reference: String,
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  repaymentSchedule: [{
    installmentNumber: Number,
    dueDate: Date,
    principalDue: Number,
    interestDue: Number,
    totalDue: Number,
    principalPaid: {
      type: Number,
      default: 0
    },
    interestPaid: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    balance: Number,
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending'
    },
    daysPastDue: {
      type: Number,
      default: 0
    },
    penalty: {
      type: Number,
      default: 0
    }
  }],
  balances: {
    principalBalance: {
      type: Number,
      default: 0
    },
    interestBalance: {
      type: Number,
      default: 0
    },
    feesBalance: {
      type: Number,
      default: 0
    },
    penaltyBalance: {
      type: Number,
      default: 0
    },
    totalBalance: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'disbursed', 'active', 'closed', 'defaulted', 'written_off', 'restructured', 'rejected'],
    default: 'pending'
  },
  delinquency: {
    daysPastDue: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['current', 'early_arrears', 'late_arrears', 'default'],
      default: 'current'
    },
    missedPayments: {
      type: Number,
      default: 0
    }
  },
  collateral: [{
    type: String,
    description: String,
    value: Number,
    documents: [String]
  }],
  documents: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Document'
}],
  approvals: [{
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected'],
      required: true
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  penaltyRules: {
    enabled: {
      type: Boolean,
      default: true
    },
    rate: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['percentage_of_overdue', 'fixed_amount', 'percentage_of_principal'],
      default: 'percentage_of_overdue'
    },
    graceDays: {
      type: Number,
      default: 0
    }
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  disbursementDate: Date,
  maturityDate: Date,
  closedDate: Date,
  branch: String,
  loanOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes for performance
loanSchema.index({ loanNumber: 1 });
loanSchema.index({ customer: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ 'delinquency.status': 1 });
loanSchema.index({ disbursementDate: -1 });
loanSchema.index({ maturityDate: 1 });

// REMOVED THE PROBLEMATIC PRE-SAVE MIDDLEWARE
// All calculations are done in loanController.js

module.exports = mongoose.model('Loan', loanSchema);