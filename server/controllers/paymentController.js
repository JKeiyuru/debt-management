const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/auditLogger');
const { differenceInDays } = require('date-fns');
const { calculatePenalty } = require('../utils/loanCalculator');

// Generate unique payment number
const generatePaymentNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await Payment.countDocuments();
  const sequence = (count + 1).toString().padStart(5, '0');
  
  return `PAY${year}${month}${sequence}`;
};

// Generate receipt number
const generateReceiptNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await Payment.countDocuments({ receiptIssued: true });
  const sequence = (count + 1).toString().padStart(5, '0');
  
  return `RCP${year}${month}${sequence}`;
};

// Allocate payment to loan components
const allocatePayment = (amount, loan) => {
  const allocation = {
    penalty: 0,
    fees: 0,
    interest: 0,
    principal: 0
  };

  let remaining = amount;

  // 1. Allocate to penalties first
  if (loan.balances.penaltyBalance > 0 && remaining > 0) {
    allocation.penalty = Math.min(remaining, loan.balances.penaltyBalance);
    remaining -= allocation.penalty;
  }

  // 2. Allocate to fees
  if (loan.balances.feesBalance > 0 && remaining > 0) {
    allocation.fees = Math.min(remaining, loan.balances.feesBalance);
    remaining -= allocation.fees;
  }

  // 3. Allocate to interest
  if (loan.balances.interestBalance > 0 && remaining > 0) {
    allocation.interest = Math.min(remaining, loan.balances.interestBalance);
    remaining -= allocation.interest;
  }

  // 4. Allocate to principal
  if (loan.balances.principalBalance > 0 && remaining > 0) {
    allocation.principal = Math.min(remaining, loan.balances.principalBalance);
    remaining -= allocation.principal;
  }

  return allocation;
};

// Update loan balances and schedule
const updateLoanAfterPayment = async (loan, payment) => {
  // Update balances
  loan.balances.penaltyBalance = Math.max(0, loan.balances.penaltyBalance - payment.allocation.penalty);
  loan.balances.feesBalance = Math.max(0, loan.balances.feesBalance - payment.allocation.fees);
  loan.balances.interestBalance = Math.max(0, loan.balances.interestBalance - payment.allocation.interest);
  loan.balances.principalBalance = Math.max(0, loan.balances.principalBalance - payment.allocation.principal);
  loan.balances.totalBalance = 
    loan.balances.penaltyBalance + 
    loan.balances.feesBalance + 
    loan.balances.interestBalance + 
    loan.balances.principalBalance;

  // Update repayment schedule
  let remainingPayment = payment.amount;

  for (let installment of loan.repaymentSchedule) {
    if (installment.status === 'paid' || remainingPayment <= 0) continue;

    const installmentDue = installment.totalDue - installment.totalPaid;
    const paymentToInstallment = Math.min(remainingPayment, installmentDue);

    // Allocate to interest first, then principal
    const interestRemaining = installment.interestDue - installment.interestPaid;
    const interestPayment = Math.min(paymentToInstallment, interestRemaining);
    installment.interestPaid += interestPayment;

    const principalPayment = paymentToInstallment - interestPayment;
    installment.principalPaid += principalPayment;

    installment.totalPaid += paymentToInstallment;
    remainingPayment -= paymentToInstallment;

    // Update installment status
    if (installment.totalPaid >= installment.totalDue) {
      installment.status = 'paid';
    } else if (installment.totalPaid > 0) {
      installment.status = 'partial';
    }
  }

  // Update loan status
  if (loan.balances.totalBalance <= 0) {
    loan.status = 'closed';
    loan.closedDate = new Date();
  } else if (loan.status === 'disbursed') {
    loan.status = 'active';
  }

  await loan.save();
};

// @desc    Record payment
// @route   POST /api/payments
// @access  Private
exports.recordPayment = async (req, res) => {
  try {
    const { loan: loanId, amount, paymentMethod, transactionReference, paymentDate, notes } = req.body;

    // Get loan
    const loan = await Loan.findById(loanId).populate('customer');
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot record payment for closed loan'
      });
    }

    // Allocate payment
    const allocation = allocatePayment(amount, loan);

    // Generate payment and receipt numbers
    const paymentNumber = await generatePaymentNumber();
    const receiptNumber = await generateReceiptNumber();

    // Create payment
    const payment = await Payment.create({
      paymentNumber,
      receiptNumber,
      loan: loanId,
      customer: loan.customer._id,
      amount,
      allocation,
      paymentMethod,
      transactionReference,
      paymentDate: paymentDate || new Date(),
      notes,
      receiptIssued: true,
      recordedBy: req.user.id,
      branch: req.user.branch
    });

    // Update loan
    await updateLoanAfterPayment(loan, payment);

    // Update customer credit info
    await Customer.findByIdAndUpdate(loan.customer._id, {
      $inc: { 'creditInfo.totalRepaid': amount }
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'PAYMENT_RECORDED',
      entity: 'Payment',
      entityId: payment._id,
      details: `Payment recorded: ${payment.paymentNumber} - KES ${amount}`
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('loan', 'loanNumber')
      .populate('customer', 'personalInfo')
      .populate('recordedBy', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment: populatedPayment }
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      loan,
      customer,
      status,
      startDate,
      endDate,
      sortBy = '-paymentDate'
    } = req.query;

    const query = {};

    if (loan) query.loan = loan;
    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate('loan', 'loanNumber status')
      .populate('customer', 'personalInfo contactInfo')
      .populate('recordedBy', 'fullName email')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('loan')
      .populate('customer')
      .populate('recordedBy', 'fullName email phone')
      .populate('reversalInfo.reversedBy', 'fullName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// @desc    Reverse payment
// @route   POST /api/payments/:id/reverse
// @access  Private/Admin
exports.reversePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.reversalInfo.reversed) {
      return res.status(400).json({
        success: false,
        message: 'Payment already reversed'
      });
    }

    // Get loan and reverse the payment
    const loan = await Loan.findById(payment.loan);
    
    // Restore balances
    loan.balances.penaltyBalance += payment.allocation.penalty;
    loan.balances.feesBalance += payment.allocation.fees;
    loan.balances.interestBalance += payment.allocation.interest;
    loan.balances.principalBalance += payment.allocation.principal;
    loan.balances.totalBalance += payment.amount;

    await loan.save();

    // Update payment
    payment.status = 'reversed';
    payment.reversalInfo = {
      reversed: true,
      reversedBy: req.user.id,
      reversedDate: new Date(),
      reason: req.body.reason
    };
    await payment.save();

    // Update customer credit info
    await Customer.findByIdAndUpdate(payment.customer, {
      $inc: { 'creditInfo.totalRepaid': -payment.amount }
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'PAYMENT_UPDATED',
      entity: 'Payment',
      entityId: payment._id,
      details: `Payment reversed: ${payment.paymentNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Payment reversed successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Reverse payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reversing payment',
      error: error.message
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const paymentsToday = await Payment.countDocuments({
      paymentDate: { $gte: todayStart }
    });

    const collectionToday = await Payment.aggregate([
      { $match: { paymentDate: { $gte: todayStart }, status: 'cleared' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalCollected = await Payment.aggregate([
      { $match: { status: 'cleared' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        paymentsToday,
        collectionToday: collectionToday[0]?.total || 0,
        totalCollected: totalCollected[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
};