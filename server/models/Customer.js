const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      default: 'single'
    },
    profilePhoto: {
      type: String,
      default: ''
    }
  },
  contactInfo: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'Kenya' }
    }
  },
  identification: {
    idType: {
      type: String,
      enum: ['national_id', 'passport', 'drivers_license', 'other'],
      required: true
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required'],
      unique: true,
      trim: true
    },
    idIssueDate: Date,
    idExpiryDate: Date,
    idDocument: String // URL to uploaded document
  },
  employment: {
    status: {
      type: String,
      enum: ['employed', 'self_employed', 'unemployed', 'retired'],
      default: 'employed'
    },
    employer: String,
    occupation: String,
    monthlyIncome: {
      type: Number,
      default: 0
    },
    employmentDate: Date,
    businessName: String,
    businessType: String
  },
  nextOfKin: {
    name: String,
    relationship: String,
    phone: String,
    address: String
  },
  guarantors: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    idNumber: String,
    relationship: String,
    address: String,
    occupation: String,
    addedDate: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  creditInfo: {
    creditScore: {
      type: Number,
      min: 0,
      max: 1000,
      default: 0
    },
    totalBorrowed: {
      type: Number,
      default: 0
    },
    totalRepaid: {
      type: Number,
      default: 0
    },
    activeLoans: {
      type: Number,
      default: 0
    },
    defaultedLoans: {
      type: Number,
      default: 0
    },
    latePayments: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'deceased'],
    default: 'active'
  },
  branch: {
    type: String,
    default: 'Main Branch'
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
  tags: [String],
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

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.middleName ? this.personalInfo.middleName + ' ' : ''}${this.personalInfo.lastName}`;
});

// Virtual for age
customerSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Indexes for faster searches
customerSchema.index({ 'personalInfo.firstName': 'text', 'personalInfo.lastName': 'text' });
customerSchema.index({ 'contactInfo.phone': 1 });
customerSchema.index({ 'contactInfo.email': 1 });
customerSchema.index({ 'identification.idNumber': 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ branch: 1 });

// Ensure virtuals are included in JSON
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);