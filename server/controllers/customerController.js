const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    // Check if customer with same ID number already exists
    const existingCustomer = await Customer.findOne({
      'identification.idNumber': req.body.identification?.idNumber
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: `A customer with ID number ${req.body.identification.idNumber} already exists. Please use a different ID number.`,
        field: 'idNumber'
      });
    }

    const customerData = {
      ...req.body,
      createdBy: req.user.id,
      assignedOfficer: req.body.assignedOfficer || req.user.id
    };

    const customer = await Customer.create(customerData);

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_CREATED',
      entity: 'Customer',
      entityId: customer._id,
      details: `Customer created: ${customer.fullName}`
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Create customer error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return res.status(400).json({
        success: false,
        message: `A customer with this ${field.split('.').pop()} already exists: ${value}`,
        field: field.split('.').pop()
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      branch,
      sortBy = '-createdAt'
    } = req.query;

    const query = {};

    // Search by name, phone, or ID
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } },
        { 'identification.idNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by branch
    if (branch) {
      query.branch = branch;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const customers = await Customer.find(query)
      .populate('assignedOfficer', 'fullName email')
      .populate('createdBy', 'fullName')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { customers }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedOfficer', 'fullName email phone')
      .populate('createdBy', 'fullName email')
      .populate('lastModifiedBy', 'fullName')
      .populate('notes.createdBy', 'fullName');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if trying to change ID number to one that already exists
    if (req.body.identification?.idNumber && 
        req.body.identification.idNumber !== customer.identification.idNumber) {
      const existingCustomer = await Customer.findOne({
        'identification.idNumber': req.body.identification.idNumber,
        _id: { $ne: req.params.id }
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: `A customer with ID number ${req.body.identification.idNumber} already exists`,
          field: 'idNumber'
        });
      }
    }

    const oldValue = customer.toObject();

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: customer._id,
      details: `Customer updated: ${customer.fullName}`,
      oldValue,
      newValue: customer.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Update customer error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return res.status(400).json({
        success: false,
        message: `A customer with this ${field.split('.').pop()} already exists: ${value}`,
        field: field.split('.').pop()
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has active loans
    if (customer.creditInfo.activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with active loans'
      });
    }

    await customer.deleteOne();

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_DELETED',
      entity: 'Customer',
      entityId: customer._id,
      details: `Customer deleted: ${customer.fullName}`
    });

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// @desc    Add note to customer
// @route   POST /api/customers/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.notes.push({
      content: req.body.content,
      createdBy: req.user.id
    });

    await customer.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: customer._id,
      details: `Note added to customer: ${customer.fullName}`
    });

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
};

// @desc    Add guarantor to customer
// @route   POST /api/customers/:id/guarantors
// @access  Private
exports.addGuarantor = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.guarantors.push(req.body);
    await customer.save();

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: customer._id,
      details: `Guarantor added to customer: ${customer.fullName}`
    });

    res.status(200).json({
      success: true,
      message: 'Guarantor added successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Add guarantor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding guarantor',
      error: error.message
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const blacklistedCustomers = await Customer.countDocuments({ status: 'blacklisted' });
    
    const customersByBranch = await Customer.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } }
    ]);

    const recentCustomers = await Customer.find()
      .sort('-createdAt')
      .limit(5)
      .select('personalInfo contactInfo createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        blacklistedCustomers,
        customersByBranch,
        recentCustomers
      }
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};