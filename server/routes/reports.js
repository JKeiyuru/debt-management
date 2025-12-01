const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getCollectionReport,
  getDelinquencyReport,
  getPortfolioAnalysis,
  exportData
} = require('../controllers/reportController');
const { protect, checkPermission } = require('../middleware/auth');

// All routes are protected and require view reports permission
router.use(protect);
router.use(checkPermission('canViewReports'));

router.get('/dashboard', getDashboardOverview);
router.get('/collections', getCollectionReport);
router.get('/delinquency', getDelinquencyReport);
router.get('/portfolio', getPortfolioAnalysis);
router.get('/export/:type', exportData);

module.exports = router;