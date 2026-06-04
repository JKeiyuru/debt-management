require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'reubenmainadms@gmail.com';
    const hashedPassword = await bcrypt.hash('DMS@admin.1', 10);

    const existing = await mongoose.connection.db
      .collection('users').findOne({ email: adminEmail });

    if (existing) {
      await mongoose.connection.db.collection('users').updateOne(
        { email: adminEmail },
        { $set: { password: hashedPassword, isActive: true,
            permissions: { canCreateLoans: true, canApproveLoans: true,
              canDeleteLoans: true, canManageUsers: true,
              canViewReports: true, canProcessPayments: true,
              canEditCustomers: true } } }
      );
      console.log('✅ Admin password updated');
    } else {
      await mongoose.connection.db.collection('users').insertOne({
        fullName: 'Admin User', email: adminEmail,
        password: hashedPassword, role: 'admin',
        phone: '+254700000000', branch: 'Main Branch', isActive: true,
        permissions: { canCreateLoans: true, canApproveLoans: true,
          canDeleteLoans: true, canManageUsers: true,
          canViewReports: true, canProcessPayments: true,
          canEditCustomers: true },
        createdAt: new Date(), updatedAt: new Date()
      });
      console.log('✅ Admin user created');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedAdmin();