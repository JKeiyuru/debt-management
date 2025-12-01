// client/src/App.jsx - COMPLETE FINAL VERSION
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

// Auth components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CustomerForm from './pages/CustomerForm';
import Loans from './pages/Loans';
import LoanDetails from './pages/LoanDetails';
import LoanForm from './pages/LoanForm';
import Payments from './pages/Payments';
import PaymentForm from './components/payment/PaymentForm';
import PaymentReceiptPage from './pages/PaymentReceipt';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Customer routes */}
            <Route path="customers" element={<Customers />} />
            <Route path="customers/new" element={<CustomerForm />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customers/:id/edit" element={<CustomerForm />} />
            
            {/* Loan routes */}
            <Route path="loans" element={<Loans />} />
            <Route path="loans/new" element={<LoanForm />} />
            <Route path="loans/:id" element={<LoanDetails />} />
            
            {/* Payment routes */}
            <Route path="payments" element={<Payments />} />
            <Route path="payments/new" element={<PaymentForm />} />
            <Route path="payments/:id" element={<PaymentReceiptPage />} />
            
            {/* Report routes */}
            <Route path="reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;