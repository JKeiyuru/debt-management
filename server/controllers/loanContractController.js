// server/controllers/loanContractController.js
// ============================================
const LoanContract = require('../models/LoanContract');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Create loan contract manually (called when user clicks "Generate Contract")
// @route   POST /api/loan-contracts
// @access  Private
exports.createLoanContract = async (req, res) => {
  try {
    const { loanId, contractData } = req.body;
    
    const loan = await Loan.findById(loanId).populate('customer');
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    const contract = await LoanContract.create({
      loan: loanId,
      customer: loan.customer._id,
      businessInfo: contractData.businessInfo,
      terms: contractData.terms,
      fees: contractData.fees,
      collateral: contractData.collateral,
      clauses: contractData.clauses,
      defaultDefinition: contractData.defaultDefinition,
      defaultAction: contractData.defaultAction,
      createdBy: req.user.id,
      status: 'draft'
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_CONTRACT_CREATED',
      entity: 'LoanContract',
      entityId: contract._id,
      details: `Contract created: ${contract.contractNumber}`
    });

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: { contract }
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating contract',
      error: error.message 
    });
  }
};

// @desc    Get all contracts
// @route   GET /api/loan-contracts
// @access  Private
exports.getAllContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, loanId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (loanId) query.loan = loanId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contracts = await LoanContract.find(query)
      .populate('loan', 'loanNumber principal')
      .populate('customer', 'personalInfo contactInfo')
      .populate('createdBy', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LoanContract.countDocuments(query);

    res.status(200).json({
      success: true,
      count: contracts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { contracts }
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
};

// @desc    Get single contract
// @route   GET /api/loan-contracts/:id
// @access  Private
exports.getContract = async (req, res) => {
  try {
    const contract = await LoanContract.findById(req.params.id)
      .populate('loan')
      .populate('customer')
      .populate('createdBy', 'fullName email')
      .populate('signatures.lender.signedBy', 'fullName');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { contract }
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contract',
      error: error.message
    });
  }
};

// @desc    Update contract
// @route   PUT /api/loan-contracts/:id
// @access  Private
exports.updateContract = async (req, res) => {
  try {
    let contract = await LoanContract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.status === 'signed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a signed contract'
      });
    }

    contract = await LoanContract.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user.id,
        documentVersion: contract.documentVersion + 1
      },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_CONTRACT_UPDATED',
      entity: 'LoanContract',
      entityId: contract._id,
      details: `Contract updated: ${contract.contractNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Contract updated successfully',
      data: { contract }
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contract',
      error: error.message
    });
  }
};

// @desc    Send contract to customer
// @route   POST /api/loan-contracts/:id/send
// @access  Private
exports.sendContract = async (req, res) => {
  try {
    const { method, recipient } = req.body; // method: email, sms, whatsapp

    const contract = await LoanContract.findById(req.params.id)
      .populate('customer')
      .populate('loan');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Here you would integrate with email/SMS service
    // For now, we'll just update the status

    contract.status = 'sent';
    contract.sentDate = new Date();
    contract.sentVia = method;
    await contract.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'LOAN_CONTRACT_SENT',
      entity: 'LoanContract',
      entityId: contract._id,
      details: `Contract sent via ${method}: ${contract.contractNumber}`
    });

    res.status(200).json({
      success: true,
      message: `Contract sent successfully via ${method}`,
      data: { contract }
    });
  } catch (error) {
    console.error('Send contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending contract',
      error: error.message
    });
  }
};

// @desc    Sign contract (borrower)
// @route   POST /api/loan-contracts/:id/sign
// @access  Public (with token or link)
exports.signContract = async (req, res) => {
  try {
    const { signature, ipAddress } = req.body;

    const contract = await LoanContract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.status !== 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Contract must be sent before signing'
      });
    }

    contract.signatures.borrower = {
      signed: true,
      signedDate: new Date(),
      signedBy: signature,
      ipAddress
    };
    contract.status = 'signed';

    await contract.save();

    await createAuditLog({
      userId: contract.createdBy,
      action: 'LOAN_CONTRACT_SIGNED',
      entity: 'LoanContract',
      entityId: contract._id,
      details: `Contract signed by borrower: ${contract.contractNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Contract signed successfully',
      data: { contract }
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing contract',
      error: error.message
    });
  }
};

// @desc    Generate PDF
// @route   GET /api/loan-contracts/:id/pdf
// @access  Private
exports.generatePDF = async (req, res) => {
  try {
    const contract = await LoanContract.findById(req.params.id)
      .populate('loan')
      .populate('customer');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Here you would integrate with PDF generation library (jsPDF, PDFKit, etc.)
    // For now, return contract data

    res.status(200).json({
      success: true,
      message: 'PDF generation endpoint - integrate with PDF library',
      data: { contract }
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};