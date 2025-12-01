// client/src/components/payment/PaymentList.jsx
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { DollarSign, Search, Plus, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments', {
        params: { search: search || undefined, limit: 20 }
      });
      setPayments(response.data.data.payments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Button onClick={() => navigate('/payments/new')} className="bg-gradient-to-r from-green-500 to-emerald-500">
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/payments/${payment._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{payment.paymentNumber}</p>
                      <p className="text-sm text-gray-600">{payment.loan?.loanNumber}</p>
                      <p className="text-xs text-gray-500">
                        {payment.customer?.personalInfo?.firstName} {payment.customer?.personalInfo?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +{formatCurrency(payment.amount)}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{formatDate(payment.paymentDate)}</p>
                    </div>
                    <Badge className="mt-2 capitalize">{payment.paymentMethod.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentList;