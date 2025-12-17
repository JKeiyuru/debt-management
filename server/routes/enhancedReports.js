// server/routes/enhancedReports.js
const express = require('express');
const router = express.Router();
const {
  getPARReport,
  getLoanAgingReport,
  getExpectedVsActual,
  getCollectorPerformance,
  getRevenueBreakdown,
  getLoanForecasting
} = require('../controllers/enhancedReportController');
const { protect, checkPermission } = require('../middleware/auth');

// All routes are protected and require view reports permission
router.use(protect);
router.use(checkPermission('canViewReports'));

// Enhanced report routes
router.get('/par', getPARReport);
router.get('/aging', getLoanAgingReport);
router.get('/collections/expected-vs-actual', getExpectedVsActual);
router.get('/collector-performance', getCollectorPerformance);
router.get('/revenue', getRevenueBreakdown);
router.get('/forecasting', getLoanForecasting);

module.exports = router;