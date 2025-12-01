const express = require('express');
const router = express.Router();
const {
  createLoan,
  getAllLoans,
  getLoan,
  updateLoan,
  approveLoan,
  disburseLoan,
  getLoanStats
} = require('../controllers/loanController');
const { protect, checkPermission } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats route
router.get('/stats', getLoanStats);

// CRUD routes
router.route('/')
  .get(getAllLoans)
  .post(checkPermission('canCreateLoans'), createLoan);

router.route('/:id')
  .get(getLoan)
  .put(checkPermission('canCreateLoans'), updateLoan);

// Loan actions
router.post('/:id/approve', checkPermission('canApproveLoans'), approveLoan);
router.post('/:id/disburse', checkPermission('canApproveLoans'), disburseLoan);

module.exports = router;