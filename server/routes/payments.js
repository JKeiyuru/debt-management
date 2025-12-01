const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getAllPayments,
  getPayment,
  reversePayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, checkPermission } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats route
router.get('/stats', getPaymentStats);

// Payment routes
router.route('/')
  .get(getAllPayments)
  .post(checkPermission('canProcessPayments'), recordPayment);

router.get('/:id', getPayment);
router.post('/:id/reverse', checkPermission('canDeleteLoans'), reversePayment);

module.exports = router;