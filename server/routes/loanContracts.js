const express = require('express');
const router = express.Router();
const {
  createLoanContract,
  getAllContracts,
  getContract,
  updateContract,
  sendContract,
  signContract,
  generatePDF
} = require('../controllers/loanContractController');
const { protect, checkPermission } = require('../middleware/auth');

// Protected routes
router.use(protect);

router.route('/')
  .get(getAllContracts)
  .post(checkPermission('canCreateLoans'), createLoanContract);

router.route('/:id')
  .get(getContract)
  .put(checkPermission('canCreateLoans'), updateContract);

router.post('/:id/send', checkPermission('canCreateLoans'), sendContract);
router.post('/:id/sign', signContract); // Can be public with token
router.get('/:id/pdf', generatePDF);

module.exports = router;