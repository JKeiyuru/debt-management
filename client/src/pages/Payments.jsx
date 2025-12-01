// ============================================
// client/src/pages/Payments.jsx - UPDATED WITH FULL FUNCTIONALITY
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Calendar,
  TrendingUp,
  Wallet,
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const response = await api.get('/payments/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'mobile_money': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Wallet className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPayments}</p>
                </div>
                <Wallet className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Payments Today</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.paymentsToday}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(stats.collectionToday)}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.totalCollected).split(' ')[1]}
                  </p>
                  <p className="text-xs text-gray-500">KES</p>
                </div>
                <DollarSign className="h-12 w-12 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Payment</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.totalCollected / (stats.totalPayments || 1)).split(' ')[1].split('.')[0]}
                  </p>
                  <p className="text-xs text-gray-500">KES</p>
                </div>
                <Calendar className="h-12 w-12 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Payments History</CardTitle>
            <Button 
              onClick={() => navigate('/payments/new')} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by payment number, loan, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">Record your first payment to get started</p>
              <Button onClick={() => navigate('/payments/new')}>
                <Plus className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500"
                  onClick={() => navigate(`/payments/${payment._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{payment.paymentNumber}</p>
                        <p className="text-sm text-gray-600">{payment.loan?.loanNumber}</p>
                        <p className="text-xs text-gray-500">
                          {payment.customer?.personalInfo?.firstName} {payment.customer?.personalInfo?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        +{formatCurrency(payment.amount).split(' ')[1]}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">KES</p>
                      <div className="flex items-center gap-2 justify-end mt-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <Badge variant="outline" className="capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{formatDate(payment.paymentDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;