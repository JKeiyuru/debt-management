// client/src/App.jsx - UPDATED WITH PWA SUPPORT
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

// PWA Components
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';
import PWAUpdatePrompt from './components/pwa/PWAUpdatePrompt';
import { OfflineIndicator } from './components/pwa/PWAUpdatePrompt';
import { usePWA } from './hooks/usePWA';

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
import LoanContractGenerator from './pages/LoanContractGenerator';

function AppContent() {
  const { isOnline, needsUpdate, updateApp } = usePWA();

  return (
    <>
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

          <Route path="contracts/new" element={<LoanContractGenerator />} />
<Route path="contracts/:id" element={<LoanContractGenerator />} />
          
          {/* Payment routes */}
          <Route path="payments" element={<Payments />} />
          <Route path="payments/new" element={<PaymentForm />} />
          <Route path="payments/:id" element={<PaymentReceiptPage />} />
          
          {/* Report routes */}
          <Route path="reports" element={<Reports />} />
          <Route path="reports/enhanced" element={<EnhancedReports />} />
          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* PWA Components */}
      <OfflineIndicator isOnline={isOnline} />
      <PWAInstallPrompt />
      {needsUpdate && <PWAUpdatePrompt onUpdate={updateApp} />}
      
      <Toaster />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;