require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@demo.com';
    const existing = await mongoose.connection.db.collection('users').findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await mongoose.connection.db.collection('users').insertOne({
      fullName: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '+254700000000',
      branch: 'Main Branch',
      isActive: true,
      permissions: {
        canCreateLoans: true,
        canApproveLoans: true,
        canDeleteLoans: true,
        canManageUsers: true,
        canViewReports: true,
        canProcessPayments: true,
        canEditCustomers: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  }
};

seedAdmin();
