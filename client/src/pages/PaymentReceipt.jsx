// ============================================
// client/src/pages/PaymentReceipt.jsx - NEW PAGE
// ============================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PaymentReceipt } from '../components/payment/PaymentReceipt';

const PaymentReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/payments/${id}`);
      setPayment(response.data.data.payment);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment not found</h3>
        <Button onClick={() => navigate('/payments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/payments')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
      </Button>
      <PaymentReceipt payment={payment} />
    </div>
  );
};

export default PaymentReceiptPage;