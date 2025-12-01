const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/auditLogger');
const { startOfMonth, endOfMonth, subMonths } = require('date-fns');

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    // Portfolio metrics
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: { $in: ['disbursed', 'active'] } });
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });
    
    const portfolioValue = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $group: { _id: null, total: { $sum: '$balances.totalBalance' } } }
    ]);

    const totalDisbursed = await Loan.aggregate([
      { $match: { status: { $nin: ['pending', 'rejected'] } } },
      { $group: { _id: null, total: { $sum: '$principal' } } }
    ]);

    // Collection metrics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const collectionsToday = await Payment.aggregate([
      { $match: { paymentDate: { $gte: todayStart }, status: 'cleared' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const monthStart = startOfMonth(new Date());
    const collectionsThisMonth = await Payment.aggregate([
      { $match: { paymentDate: { $gte: monthStart }, status: 'cleared' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Delinquency metrics
    const overdueLoans = await Loan.countDocuments({
      status: { $in: ['disbursed', 'active'] },
      'delinquency.daysPastDue': { $gt: 0 }
    });

    const portfolioAtRisk = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] },
          'delinquency.daysPastDue': { $gt: 0 }
        } 
      },
      { $group: { _id: null, total: { $sum: '$balances.totalBalance' } } }
    ]);

    // Customer metrics
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });

    // Recent activity
    const recentLoans = await Loan.find()
      .sort('-createdAt')
      .limit(5)
      .populate('customer', 'personalInfo')
      .select('loanNumber principal status createdAt');

    const recentPayments = await Payment.find()
      .sort('-paymentDate')
      .limit(5)
      .populate('customer', 'personalInfo')
      .populate('loan', 'loanNumber')
      .select('paymentNumber amount paymentDate');

    res.status(200).json({
      success: true,
      data: {
        portfolio: {
          totalLoans,
          activeLoans,
          pendingLoans,
          totalValue: portfolioValue[0]?.total || 0,
          totalDisbursed: totalDisbursed[0]?.total || 0
        },
        collections: {
          today: {
            amount: collectionsToday[0]?.total || 0,
            count: collectionsToday[0]?.count || 0
          },
          thisMonth: {
            amount: collectionsThisMonth[0]?.total || 0,
            count: collectionsThisMonth[0]?.count || 0
          }
        },
        delinquency: {
          overdueLoans,
          portfolioAtRisk: portfolioAtRisk[0]?.total || 0,
          parRate: portfolioValue[0]?.total 
            ? ((portfolioAtRisk[0]?.total || 0) / portfolioValue[0].total * 100).toFixed(2)
            : 0
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers
        },
        recentActivity: {
          loans: recentLoans,
          payments: recentPayments
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get collection report
// @route   GET /api/reports/collections
// @access  Private
exports.getCollectionReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const matchStage = {
      status: 'cleared'
    };

    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
      if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
    }

    let groupByFormat;
    switch (groupBy) {
      case 'day':
        groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } };
        break;
      case 'week':
        groupByFormat = { $week: '$paymentDate' };
        break;
      case 'month':
        groupByFormat = { $dateToString: { format: '%Y-%m', date: '$paymentDate' } };
        break;
      default:
        groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } };
    }

    const collections = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByFormat,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const summary = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          avgPayment: { $avg: '$amount' },
          maxPayment: { $max: '$amount' },
          minPayment: { $min: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        collections,
        summary: summary[0] || {}
      }
    });
  } catch (error) {
    console.error('Get collection report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection report',
      error: error.message
    });
  }
};

// @desc    Get delinquency report
// @route   GET /api/reports/delinquency
// @access  Private
exports.getDelinquencyReport = async (req, res) => {
  try {
    const delinquencyBrackets = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] }
        } 
      },
      {
        $bucket: {
          groupBy: '$delinquency.daysPastDue',
          boundaries: [0, 1, 30, 60, 90, 1000],
          default: 'other',
          output: {
            count: { $sum: 1 },
            totalBalance: { $sum: '$balances.totalBalance' },
            avgBalance: { $avg: '$balances.totalBalance' }
          }
        }
      }
    ]);

    const byDelinquencyStatus = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] }
        } 
      },
      {
        $group: {
          _id: '$delinquency.status',
          count: { $sum: 1 },
          totalBalance: { $sum: '$balances.totalBalance' }
        }
      }
    ]);

    const topDelinquentLoans = await Loan.find({
      status: { $in: ['disbursed', 'active'] },
      'delinquency.daysPastDue': { $gt: 0 }
    })
      .sort('-delinquency.daysPastDue')
      .limit(10)
      .populate('customer', 'personalInfo contactInfo')
      .select('loanNumber principal balances delinquency');

    res.status(200).json({
      success: true,
      data: {
        delinquencyBrackets,
        byDelinquencyStatus,
        topDelinquentLoans
      }
    });
  } catch (error) {
    console.error('Get delinquency report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delinquency report',
      error: error.message
    });
  }
};

// @desc    Get portfolio analysis
// @route   GET /api/reports/portfolio
// @access  Private
exports.getPortfolioAnalysis = async (req, res) => {
  try {
    const byStatus = await Loan.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPrincipal: { $sum: '$principal' },
          totalBalance: { $sum: '$balances.totalBalance' }
        }
      }
    ]);

    const byProduct = await Loan.aggregate([
      {
        $group: {
          _id: '$loanProduct.type',
          count: { $sum: 1 },
          totalPrincipal: { $sum: '$principal' },
          avgInterestRate: { $avg: '$interestRate' }
        }
      }
    ]);

    const byBranch = await Loan.aggregate([
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 },
          totalPrincipal: { $sum: '$principal' },
          totalBalance: { $sum: '$balances.totalBalance' }
        }
      }
    ]);

    // Loan performance
    const loanPerformance = await Loan.aggregate([
      { $match: { status: 'closed' } },
      {
        $group: {
          _id: null,
          totalClosed: { $sum: 1 },
          avgTerm: { $avg: '$term.value' },
          totalRepaid: { $sum: '$principal' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        byProduct,
        byBranch,
        performance: loanPerformance[0] || {}
      }
    });
  } catch (error) {
    console.error('Get portfolio analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio analysis',
      error: error.message
    });
  }
};

// @desc    Export data
// @route   GET /api/reports/export/:type
// @access  Private
exports.exportData = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'loans':
        data = await Loan.find()
          .populate('customer', 'personalInfo contactInfo')
          .lean();
        filename = `loans_export_${Date.now()}`;
        break;

      case 'payments':
        const paymentQuery = {};
        if (startDate || endDate) {
          paymentQuery.paymentDate = {};
          if (startDate) paymentQuery.paymentDate.$gte = new Date(startDate);
          if (endDate) paymentQuery.paymentDate.$lte = new Date(endDate);
        }
        data = await Payment.find(paymentQuery)
          .populate('customer', 'personalInfo')
          .populate('loan', 'loanNumber')
          .lean();
        filename = `payments_export_${Date.now()}`;
        break;

      case 'customers':
        data = await Customer.find().lean();
        filename = `customers_export_${Date.now()}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'REPORT_EXPORTED',
      entity: 'Report',
      details: `Data exported: ${type}`
    });

    if (format === 'csv') {
      // Convert to CSV (simplified - you might want to use a library)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      filename,
      data
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'object' ? JSON.stringify(value) : value
    ).join(',')
  );

  return [headers, ...rows].join('\n');
};