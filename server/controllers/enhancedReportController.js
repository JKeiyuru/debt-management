// server/controllers/enhancedReportController.js
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/auditLogger');
const { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } = require('date-fns');

// @desc    Get Portfolio at Risk (PAR) Report
// @route   GET /api/reports/par
// @access  Private
exports.getPARReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Calculate total portfolio value
    const portfolioValue = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $group: { _id: null, total: { $sum: '$balances.totalBalance' } } }
    ]);

    const totalPortfolio = portfolioValue[0]?.total || 0;

    // PAR 1-30 days
    const par1 = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] },
          'delinquency.daysPastDue': { $gte: 1, $lt: 31 }
        } 
      },
      { 
        $group: { 
          _id: null, 
          amount: { $sum: '$balances.totalBalance' },
          count: { $sum: 1 }
        } 
      }
    ]);

    // PAR 31-60 days
    const par30 = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] },
          'delinquency.daysPastDue': { $gte: 31, $lt: 61 }
        } 
      },
      { 
        $group: { 
          _id: null, 
          amount: { $sum: '$balances.totalBalance' },
          count: { $sum: 1 }
        } 
      }
    ]);

    // PAR 61-90 days
    const par60 = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] },
          'delinquency.daysPastDue': { $gte: 61, $lt: 91 }
        } 
      },
      { 
        $group: { 
          _id: null, 
          amount: { $sum: '$balances.totalBalance' },
          count: { $sum: 1 }
        } 
      }
    ]);

    // PAR 90+ days
    const par90 = await Loan.aggregate([
      { 
        $match: { 
          status: { $in: ['disbursed', 'active'] },
          'delinquency.daysPastDue': { $gte: 91 }
        } 
      },
      { 
        $group: { 
          _id: null, 
          amount: { $sum: '$balances.totalBalance' },
          count: { $sum: 1 }
        } 
      }
    ]);

    const par1Data = par1[0] || { amount: 0, count: 0 };
    const par30Data = par30[0] || { amount: 0, count: 0 };
    const par60Data = par60[0] || { amount: 0, count: 0 };
    const par90Data = par90[0] || { amount: 0, count: 0 };

    const totalPAR = {
      amount: par1Data.amount + par30Data.amount + par60Data.amount + par90Data.amount,
      loans: par1Data.count + par30Data.count + par60Data.count + par90Data.count
    };

    // PAR Trend (last 6 months)
    const parTrend = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const monthStart = startOfMonth(subMonths(new Date(), 5 - i));
        const monthEnd = endOfMonth(monthStart);
        
        return Loan.aggregate([
          {
            $match: {
              status: { $in: ['disbursed', 'active', 'closed'] },
              disbursementDate: { $lte: monthEnd }
            }
          },
          {
            $project: {
              month: monthStart,
              totalBalance: '$balances.totalBalance',
              daysPastDue: '$delinquency.daysPastDue',
              par1: {
                $cond: [
                  { $and: [{ $gte: ['$delinquency.daysPastDue', 1] }, { $lt: ['$delinquency.daysPastDue', 31] }] },
                  '$balances.totalBalance',
                  0
                ]
              },
              par30: {
                $cond: [
                  { $and: [{ $gte: ['$delinquency.daysPastDue', 31] }, { $lt: ['$delinquency.daysPastDue', 61] }] },
                  '$balances.totalBalance',
                  0
                ]
              },
              par60: {
                $cond: [
                  { $and: [{ $gte: ['$delinquency.daysPastDue', 61] }, { $lt: ['$delinquency.daysPastDue', 91] }] },
                  '$balances.totalBalance',
                  0
                ]
              },
              par90: {
                $cond: [
                  { $gte: ['$delinquency.daysPastDue', 91] },
                  '$balances.totalBalance',
                  0
                ]
              }
            }
          },
          {
            $group: {
              _id: '$month',
              totalPortfolio: { $sum: '$totalBalance' },
              par1Amount: { $sum: '$par1' },
              par30Amount: { $sum: '$par30' },
              par60Amount: { $sum: '$par60' },
              par90Amount: { $sum: '$par90' }
            }
          }
        ]).then(results => {
          const data = results[0] || { totalPortfolio: 1, par1Amount: 0, par30Amount: 0, par60Amount: 0, par90Amount: 0 };
          return {
            month: monthStart.toLocaleString('default', { month: 'short' }),
            par1: ((data.par1Amount / data.totalPortfolio) * 100).toFixed(2),
            par30: ((data.par30Amount / data.totalPortfolio) * 100).toFixed(2),
            par60: ((data.par60Amount / data.totalPortfolio) * 100).toFixed(2),
            par90: ((data.par90Amount / data.totalPortfolio) * 100).toFixed(2)
          };
        });
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalPortfolio,
        par1: {
          amount: par1Data.amount,
          loans: par1Data.count,
          percentage: totalPortfolio > 0 ? ((par1Data.amount / totalPortfolio) * 100).toFixed(2) : 0
        },
        par30: {
          amount: par30Data.amount,
          loans: par30Data.count,
          percentage: totalPortfolio > 0 ? ((par30Data.amount / totalPortfolio) * 100).toFixed(2) : 0
        },
        par60: {
          amount: par60Data.amount,
          loans: par60Data.count,
          percentage: totalPortfolio > 0 ? ((par60Data.amount / totalPortfolio) * 100).toFixed(2) : 0
        },
        par90: {
          amount: par90Data.amount,
          loans: par90Data.count,
          percentage: totalPortfolio > 0 ? ((par90Data.amount / totalPortfolio) * 100).toFixed(2) : 0
        },
        totalPAR: {
          amount: totalPAR.amount,
          loans: totalPAR.loans,
          percentage: totalPortfolio > 0 ? ((totalPAR.amount / totalPortfolio) * 100).toFixed(2) : 0
        },
        parTrend
      }
    });
  } catch (error) {
    console.error('Get PAR report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching PAR report',
      error: error.message
    });
  }
};

// @desc    Get Loan Aging Report
// @route   GET /api/reports/aging
// @access  Private
exports.getLoanAgingReport = async (req, res) => {
  try {
    const agingBrackets = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      {
        $bucket: {
          groupBy: '$delinquency.daysPastDue',
          boundaries: [0, 1, 31, 61, 91, 10000],
          default: 'other',
          output: {
            count: { $sum: 1 },
            amount: { $sum: '$balances.totalBalance' }
          }
        }
      }
    ]);

    const totalPortfolio = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $group: { _id: null, total: { $sum: '$balances.totalBalance' } } }
    ]);

    const total = totalPortfolio[0]?.total || 1;

    const labeledBrackets = agingBrackets.map((bracket, index) => {
      const labels = ['Current', '1-30 days', '31-60 days', '61-90 days', '90+ days'];
      return {
        range: labels[index] || 'Other',
        count: bracket.count,
        amount: bracket.amount,
        percentage: ((bracket.amount / total) * 100).toFixed(1)
      };
    });

    res.status(200).json({
      success: true,
      data: labeledBrackets
    });
  } catch (error) {
    console.error('Get aging report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching aging report',
      error: error.message
    });
  }
};

// @desc    Get Expected vs Actual Collections
// @route   GET /api/reports/collections/expected-vs-actual
// @access  Private
exports.getExpectedVsActual = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    // Calculate expected payments
    const expectedPayments = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $unwind: '$repaymentSchedule' },
      {
        $match: {
          'repaymentSchedule.dueDate': { $gte: start, $lte: end },
          'repaymentSchedule.status': { $ne: 'paid' }
        }
      },
      {
        $group: {
          _id: null,
          expected: { $sum: '$repaymentSchedule.totalDue' }
        }
      }
    ]);

    // Calculate actual collections
    const actualCollections = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: 'cleared'
        }
      },
      {
        $group: {
          _id: null,
          actual: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate missed payments
    const missedPayments = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $unwind: '$repaymentSchedule' },
      {
        $match: {
          'repaymentSchedule.dueDate': { $lt: new Date() },
          'repaymentSchedule.status': 'pending'
        }
      },
      {
        $group: {
          _id: null,
          missed: { $sum: { $subtract: ['$repaymentSchedule.totalDue', '$repaymentSchedule.totalPaid'] } }
        }
      }
    ]);

    // Calculate partial payments
    const partialPayments = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $unwind: '$repaymentSchedule' },
      {
        $match: {
          'repaymentSchedule.status': 'partial'
        }
      },
      {
        $group: {
          _id: null,
          partial: { $sum: '$repaymentSchedule.totalPaid' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        expected: expectedPayments[0]?.expected || 0,
        actual: actualCollections[0]?.actual || 0,
        missed: missedPayments[0]?.missed || 0,
        partial: partialPayments[0]?.partial || 0,
        collectionRate: expectedPayments[0]?.expected 
          ? ((actualCollections[0]?.actual || 0) / expectedPayments[0].expected * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get expected vs actual error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expected vs actual report',
      error: error.message
    });
  }
};

// @desc    Get Collector Performance Report
// @route   GET /api/reports/collector-performance
// @access  Private
exports.getCollectorPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    const performance = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: 'cleared'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recordedBy',
          foreignField: '_id',
          as: 'collector'
        }
      },
      { $unwind: '$collector' },
      {
        $group: {
          _id: '$recordedBy',
          name: { $first: '$collector.fullName' },
          recovered: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'loans',
          let: { collectorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$loanOfficer', '$$collectorId'] },
                status: { $in: ['disbursed', 'active'] }
              }
            },
            {
              $group: {
                _id: null,
                outstanding: { $sum: '$balances.totalBalance' },
                clients: { $sum: 1 }
              }
            }
          ],
          as: 'portfolio'
        }
      },
      {
        $project: {
          name: 1,
          recovered: 1,
          count: 1,
          outstanding: { $ifNull: [{ $arrayElemAt: ['$portfolio.outstanding', 0] }, 0] },
          clients: { $ifNull: [{ $arrayElemAt: ['$portfolio.clients', 0] }, 0] },
          percentage: {
            $multiply: [
              {
                $divide: [
                  '$recovered',
                  { $add: ['$recovered', { $ifNull: [{ $arrayElemAt: ['$portfolio.outstanding', 0] }, 1] }] }
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { recovered: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get collector performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collector performance',
      error: error.message
    });
  }
};

// @desc    Get Revenue Breakdown
// @route   GET /api/reports/revenue
// @access  Private
exports.getRevenueBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    // Interest earned from payments
    const interestEarned = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: 'cleared'
        }
      },
      {
        $group: {
          _id: null,
          interest: { $sum: '$allocation.interest' }
        }
      }
    ]);

    // Fees from new loans
    const feesCollected = await Loan.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          processingFees: { $sum: '$fees.processingFee' },
          legalFees: { $sum: '$fees.legalFee' },
          insuranceFees: { $sum: '$fees.insuranceFee' },
          otherFees: { $sum: '$fees.otherFees' }
        }
      }
    ]);

    // Penalties collected
    const penaltiesCollected = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: 'cleared'
        }
      },
      {
        $group: {
          _id: null,
          penalties: { $sum: '$allocation.penalty' }
        }
      }
    ]);

    const fees = feesCollected[0] || { processingFees: 0, legalFees: 0, insuranceFees: 0, otherFees: 0 };
    const interest = interestEarned[0]?.interest || 0;
    const penalties = penaltiesCollected[0]?.penalties || 0;

    const total = interest + fees.processingFees + fees.legalFees + fees.insuranceFees + fees.otherFees + penalties;

    res.status(200).json({
      success: true,
      data: {
        interestEarned: interest,
        processingFees: fees.processingFees,
        legalFees: fees.legalFees,
        insuranceFees: fees.insuranceFees,
        otherFees: fees.otherFees,
        penalties,
        total
      }
    });
  } catch (error) {
    console.error('Get revenue breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue breakdown',
      error: error.message
    });
  }
};

// @desc    Get Loan Forecasting
// @route   GET /api/reports/forecasting
// @access  Private
exports.getLoanForecasting = async (req, res) => {
  try {
    // Future collections (next 3 months)
    const futureCollections = await Loan.aggregate([
      { $match: { status: { $in: ['disbursed', 'active'] } } },
      { $unwind: '$repaymentSchedule' },
      {
        $match: {
          'repaymentSchedule.status': { $ne: 'paid' },
          'repaymentSchedule.dueDate': {
            $gte: new Date(),
            $lte: endOfMonth(subMonths(new Date(), -3))
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$repaymentSchedule.dueDate' }
          },
          expected: { $sum: '$repaymentSchedule.totalDue' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Expected defaults based on delinquency patterns
    const defaultRisk = await Loan.aggregate([
      {
        $match: {
          status: { $in: ['disbursed', 'active'] },
          'delinquency.daysPastDue': { $gt: 30 }
        }
      },
      {
        $group: {
          _id: null,
          atRisk: { $sum: '$balances.totalBalance' },
          loans: { $sum: 1 }
        }
      }
    ]);

    // Historical collection rate
    const historicalRate = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth(subMonths(new Date(), 6)) },
          status: 'cleared'
        }
      },
      {
        $group: {
          _id: null,
          collected: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        futureCollections,
        defaultRisk: defaultRisk[0] || { atRisk: 0, loans: 0 },
        historicalCollectionRate: historicalRate[0]?.collected || 0
      }
    });
  } catch (error) {
    console.error('Get forecasting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecasting data',
      error: error.message
    });
  }
};

module.exports = {
  getPARReport,
  getLoanAgingReport,
  getExpectedVsActual,
  getCollectorPerformance,
  getRevenueBreakdown,
  getLoanForecasting
};