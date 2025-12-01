const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  addNote,
  addGuarantor,
  getCustomerStats
} = require('../controllers/customerController');
const { protect, checkPermission } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats route (should be before :id routes)
router.get('/stats', getCustomerStats);

// CRUD routes
router.route('/')
  .get(getAllCustomers)
  .post(checkPermission('canEditCustomers'), createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(checkPermission('canEditCustomers'), updateCustomer)
  .delete(checkPermission('canDeleteLoans'), deleteCustomer);

// Additional routes
router.post('/:id/notes', addNote);
router.post('/:id/guarantors', checkPermission('canEditCustomers'), addGuarantor);

module.exports = router;