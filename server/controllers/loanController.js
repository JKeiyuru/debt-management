// server/controllers/loanController.js - COMPLETE WITH CONTRACT GENERATION
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const LoanContract = require('../models/LoanContract'); // ✨ ADD THIS
const { createAuditLog } = require('../utils/auditLogger');
const { generateRepaymentSchedule, calculateTotalInterest, updateDelinquencyStatus } = require('../utils/loanCalculator');

// Generate unique loan number
const generateLoanNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await Loan.countDocuments();
  const sequence = (count + 1).toString().padStart(5, '0');
  
  return `LN${year}${month}${sequence}`;
};

// ✨ CREATE DEFAULT CONTRACT FUNCTION
const createDefaultContract = async (loan, userId) => {
  try {
    console.log('📝 Creating contract for loan:', loan.loanNumber);
    
    // Calculate totals
    const totalFees = 
      (loan.fees?.processingFee || 0) +
      (loan.fees?.insuranceFee || 0) +
      (loan.fees?.legalFee || 0) +
      (loan.fees?.otherFees || 0);
    
    const disbursedAmount = loan.principal - totalFees;
    
    // Create contract with loan data
    const contract = await LoanContract.create({
      loan: loan._id,
      customer: loan.customer,
      businessInfo: {
        name: process.env.BUSINESS_NAME || 'Your Debt Management Company',
        logo: process.env.BUSINESS_LOGO || '',
        address: process.env.BUSINESS_ADDRESS || 'P.O. Box 12345, Nairobi, Kenya',
        phone: process.env.BUSINESS_PHONE || '+254 700 000 000',
        email: process.env.BUSINESS_EMAIL || 'info@yourdebtsystem.com'
      },
      terms: {
        loanAmount: loan.principal,
        interestRate: loan.interestRate,
        interestType: loan.interestType,
        totalAmount: loan.totalAmount,
        disbursedAmount: disbursedAmount,
        repaymentPeriod: `${loan.term.value} ${loan.term.unit}`,
        repaymentSchedule: loan.repaymentFrequency,
        installmentAmount: loan.repaymentSchedule[0]?.totalDue || 0,
        firstInstallmentDate: loan.repaymentSchedule[0]?.dueDate,
        finalInstallmentDate: loan.repaymentSchedule[loan.repaymentSchedule.length - 1]?.dueDate,
        penaltyRate: loan.penaltyRules?.enabled ? `${loan.penaltyRules.rate}% per month` : 'None',
        gracePeriod: `${loan.gracePeriod || 0} days`
      },
      fees: {
        processingFee: loan.fees?.processingFee || 0,
        legalFee: loan.fees?.legalFee || 0,
        insuranceFee: loan.fees?.insuranceFee || 0,
        otherFees: loan.fees?.otherFees || 0,
        total: totalFees
      },
      collateral: {
        hasCollateral: loan.collateral && loan.collateral.length > 0,
        type: loan.collateral?.[0]?.type || '',
        value: loan.collateral?.[0]?.value || 0,
        identifier: loan.collateral?.[0]?.description || '',
        location: ''
      },
      clauses: [
        'The borrower must repay all installments on the due dates specified in the repayment schedule.',
        'The borrower must keep their contact information active and notify the lender of any changes.',
        'Late payment will attract a penalty as specified in the terms.',
        'The lender reserves the right to recover collateral in case of default.'
      ],
      defaultDefinition: 'Failure to pay two consecutive installments constitutes default.',
      defaultAction: 'The lender will initiate debt recovery procedures and may seize collateral.',
      dataConsentText: 'The borrower consents to the storage and processing of their personal data for loan management purposes.',
      createdBy: userId,
      status: 'draft'
    });

    console.log('✅ Contract auto-generated:', contract.contractNumber);
    return contract;
  } catch (error) {
    console.error('❌ Error creating default contract:', error);
    console.error('❌ Error details:', error.message);
    // Don't throw error - contract generation failure shouldn't block loan creation
    return null;
  }
};

// @desc    Create new loan
// @route   POST /api/loans
// @access  Private
exports.createLoan = async (req, res) => {
  try {
    console.log('📝 Creating loan with data:', req.body);

    const loanNumber = await generateLoanNumber();
    
    // Validate required fields
    if (!req.body.customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer is required'
      });
    }

    if (!req.body.principal || req.body.principal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid principal amount is required'
      });
    }

    // Check if customer exists and is active
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.status === 'blacklisted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create loan for blacklisted customer'
      });
    }

    if (customer.status === 'deceased') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create loan for deceased customer'
      });
    }

    // Generate repayment schedule
    const schedule = generateRepaymentSchedule({
      principal: req.body.principal,
      interestRate: req.body.interestRate,
      interestType: req.body.interestType,
      term: req.body.term,
      repaymentFrequency: req.body.repaymentFrequency,
      amortizationMethod: req.body.amortizationMethod,
      startDate: req.body.disbursementDate || new Date(),
      gracePeriod: req.body.gracePeriod || 0
    });

    console.log('📊 Generated schedule:', schedule.length, 'installments');

    // Calculate totals
    const totalInterest = schedule.reduce((sum, item) => sum + item.interestDue, 0);
    const totalAmount = req.body.principal + totalInterest;

    // Calculate total fees
    const totalFees = 
      (req.body.fees?.processingFee || 0) +
      (req.body.fees?.insuranceFee || 0) +
      (req.body.fees?.legalFee || 0) +
      (req.body.fees?.otherFees || 0);

    const loanData = {
      loanNumber,
      customer: req.body.customer,
      loanProduct: {
        name: req.body.loanProduct?.name || 'Personal Loan',
        type: req.body.loanProduct?.type || 'personal'
      },
      principal: req.body.principal,
      interestRate: req.body.interestRate,
      interestType: req.body.interestType || 'reducing_balance',
      term: req.body.term,
      repaymentFrequency: req.body.repaymentFrequency || 'monthly',
      amortizationMethod: req.body.amortizationMethod || 'equal_installments',
      gracePeriod: req.body.gracePeriod || 0,
      fees: {
        processingFee: req.body.fees?.processingFee || 0,
        insuranceFee: req.body.fees?.insuranceFee || 0,
        legalFee: req.body.fees?.legalFee || 0,
        otherFees: req.body.fees?.otherFees || 0
      },
      totalFees,
      repaymentSchedule: schedule,
      totalInterest,
      totalAmount,
      balances: {
        principalBalance: req.body.principal,
        interestBalance: totalInterest,
        feesBalance: totalFees,
        penaltyBalance: 0,
        totalBalance: totalAmount + totalFees
      },
      loanOfficer: req.body.loanOfficer || req.user.id,
      createdBy: req.user.id,
      branch: req.user.branch || 'Main Branch',
      status: 'pending'
    };

    console.log('💾 Creating loan with data...');

    const loan = await Loan.create(loanData);

    console.log('✅ Loan created:', loan.loanNumber);

    // Update customer credit info
    await Customer.findByIdAndUpdate(req.body.customer, {
      $inc: { 'creditInfo.activeLoans': 1 }
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_CREATED',
      entity: 'Loan',
      entityId: loan._id,
      details: `Loan created: ${loan.loanNumber}`
    });

    // 🆕 AUTO-GENERATE CONTRACT
    console.log('📄 Generating contract...');
    const contract = await createDefaultContract(loan, req.user.id);

    if (contract) {
      console.log('✅ Contract generated successfully:', contract.contractNumber);
    } else {
      console.log('⚠️ Contract generation failed or skipped');
    }

    // Populate customer data before returning
    const populatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'personalInfo contactInfo')
      .populate('loanOfficer', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      data: { 
        loan: populatedLoan,
        contract: contract ? { 
          id: contract._id, 
          contractNumber: contract.contractNumber 
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Create loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating loan',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
exports.getAllLoans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customer,
      search,
      sortBy = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (search) {
      query.$or = [
        { loanNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const loans = await Loan.find(query)
      .populate('customer', 'personalInfo contactInfo creditInfo')
      .populate('loanOfficer', 'fullName email')
      .populate('createdBy', 'fullName')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Loan.countDocuments(query);

    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { loans }
    });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loans',
      error: error.message
    });
  }
};

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('customer')
      .populate('loanOfficer', 'fullName email phone')
      .populate('createdBy', 'fullName email')
      .populate('lastModifiedBy', 'fullName')
      .populate('approvals.approvedBy', 'fullName')
      .populate('notes.createdBy', 'fullName');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { loan }
    });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan',
      error: error.message
    });
  }
};

// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Private
exports.updateLoan = async (req, res) => {
  try {
    let loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update loan that is not in pending status'
      });
    }

    loan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_UPDATED',
      entity: 'Loan',
      entityId: loan._id,
      details: `Loan updated: ${loan.loanNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Loan updated successfully',
      data: { loan }
    });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating loan',
      error: error.message
    });
  }
};

// @desc    Approve loan
// @route   POST /api/loans/:id/approve
// @access  Private
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending loans can be approved'
      });
    }

    loan.status = 'approved';
    loan.approvalDate = new Date();
    loan.approvals.push({
      approvedBy: req.user.id,
      status: 'approved',
      comments: req.body.comments,
      date: new Date()
    });

    await loan.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_APPROVED',
      entity: 'Loan',
      entityId: loan._id,
      details: `Loan approved: ${loan.loanNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Loan approved successfully',
      data: { loan }
    });
  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving loan',
      error: error.message
    });
  }
};

// @desc    Disburse loan
// @route   POST /api/loans/:id/disburse
// @access  Private
exports.disburseLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved loans can be disbursed'
      });
    }

    loan.status = 'disbursed';
    loan.disbursementDate = new Date();
    loan.disbursement = {
      amount: req.body.amount || loan.principal,
      date: new Date(),
      method: req.body.method,
      reference: req.body.reference,
      disbursedBy: req.user.id
    };

    // Calculate maturity date
    if (loan.term.unit === 'months') {
      loan.maturityDate = new Date();
      loan.maturityDate.setMonth(loan.maturityDate.getMonth() + loan.term.value);
    }

    await loan.save();

    // Update customer credit info
    await Customer.findByIdAndUpdate(loan.customer, {
      $inc: { 
        'creditInfo.totalBorrowed': loan.principal
      }
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_DISBURSED',
      entity: 'Loan',
      entityId: loan._id,
      details: `Loan disbursed: ${loan.loanNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Loan disbursed successfully',
      data: { loan }
    });
  } catch (error) {
    console.error('Disburse loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disbursing loan',
      error: error.message
    });
  }
};

// @desc    Get loan statistics
// @route   GET /api/loans/stats
// @access  Private
exports.getLoanStats = async (req, res) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: { $in: ['disbursed', 'active'] } });
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });
    const defaultedLoans = await Loan.countDocuments({ status: 'defaulted' });

    const portfolioValue = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $group: { _id: null, total: { $sum: '$balances.totalBalance' } } }
    ]);

    const totalDisbursed = await Loan.aggregate([
      { $match: { status: { $nin: ['pending', 'rejected'] } } },
      { $group: { _id: null, total: { $sum: '$principal' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLoans,
        activeLoans,
        pendingLoans,
        defaultedLoans,
        portfolioValue: portfolioValue[0]?.total || 0,
        totalDisbursed: totalDisbursed[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get loan stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan statistics',
      error: error.message
    });
  }
};