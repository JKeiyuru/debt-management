// server/server.js - UPDATED WITH DOCUMENTS ROUTE
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const loanRoutes = require('./routes/loans');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const loanContractRoutes = require('./routes/loanContracts');
const enhancedReportRoutes = require('./routes/enhancedReports');
const documentRoutes = require('./routes/documents'); // ✨ NEW

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/loan-contracts', loanContractRoutes);
app.use('/api/reports/enhanced', enhancedReportRoutes);
app.use('/api/documents', documentRoutes); // ✨ NEW

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Document management: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Enabled' : '❌ Disabled (Add Cloudinary credentials)'}`);
});