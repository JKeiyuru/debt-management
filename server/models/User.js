const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'loan_officer', 'collector', 'accountant', 'auditor'],
    default: 'loan_officer'
  },
  phone: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    default: 'Main Branch'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  permissions: {
    canCreateLoans: { type: Boolean, default: true },
    canApproveLoans: { type: Boolean, default: false },
    canDeleteLoans: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: true },
    canProcessPayments: { type: Boolean, default: true },
    canEditCustomers: { type: Boolean, default: true }
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Combined pre-save hook
userSchema.pre('save', async function() {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set permissions if role modified
  if (this.isModified('role')) {
    switch(this.role) {
      case 'admin':
        this.permissions = {
          canCreateLoans: true,
          canApproveLoans: true,
          canDeleteLoans: true,
          canManageUsers: true,
          canViewReports: true,
          canProcessPayments: true,
          canEditCustomers: true
        };
        break;
      case 'loan_officer':
        this.permissions = {
          canCreateLoans: true,
          canApproveLoans: true,
          canDeleteLoans: false,
          canManageUsers: false,
          canViewReports: true,
          canProcessPayments: true,
          canEditCustomers: true
        };
        break;
      case 'collector':
        this.permissions = {
          canCreateLoans: false,
          canApproveLoans: false,
          canDeleteLoans: false,
          canManageUsers: false,
          canViewReports: true,
          canProcessPayments: true,
          canEditCustomers: false
        };
        break;
      case 'accountant':
        this.permissions = {
          canCreateLoans: false,
          canApproveLoans: false,
          canDeleteLoans: false,
          canManageUsers: false,
          canViewReports: true,
          canProcessPayments: true,
          canEditCustomers: false
        };
        break;
      case 'auditor':
        this.permissions = {
          canCreateLoans: false,
          canApproveLoans: false,
          canDeleteLoans: false,
          canManageUsers: false,
          canViewReports: true,
          canProcessPayments: false,
          canEditCustomers: false
        };
        break;
    }
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
