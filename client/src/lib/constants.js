// client/src/lib/constants.js
// ============================================

export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DISBURSED: 'disbursed',
  ACTIVE: 'active',
  CLOSED: 'closed',
  DEFAULTED: 'defaulted',
  WRITTEN_OFF: 'written_off',
  RESTRUCTURED: 'restructured',
  REJECTED: 'rejected'
};

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLACKLISTED: 'blacklisted',
  DECEASED: 'deceased'
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' }
];

export const LOAN_PRODUCTS = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'emergency', label: 'Emergency Loan' },
  { value: 'asset_financing', label: 'Asset Financing' },
  { value: 'other', label: 'Other' }
];

export const INTEREST_TYPES = [
  { value: 'flat', label: 'Flat Rate' },
  { value: 'reducing_balance', label: 'Reducing Balance' },
  { value: 'compound', label: 'Compound' }
];

export const REPAYMENT_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'bullet', label: 'Bullet (One Payment)' }
];

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'loan_officer', label: 'Loan Officer' },
  { value: 'collector', label: 'Collector' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'auditor', label: 'Auditor' }
];

export const ID_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'other', label: 'Other' }
];