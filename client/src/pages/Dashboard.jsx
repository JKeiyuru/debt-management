import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Wallet,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Badge } from '../components/ui/badge';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
        <p className="text-blue-100">Here's what's happening with your portfolio today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {data?.portfolio.totalValue?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {data?.portfolio.activeLoans} active loans
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Collections</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {data?.collections.today.amount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {data?.collections.today.count} payments
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overdue Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.delinquency.overdueLoans || 0}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  PAR: {data?.delinquency.parRate}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.customers.total || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {data?.customers.active} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Loans</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/loans')}
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivity.loans?.length > 0 ? (
                data.recentActivity.loans.map((loan) => (
                  <div
                    key={loan._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/loans/${loan._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{loan.loanNumber}</p>
                        <p className="text-sm text-gray-500">
                          {loan.customer.personalInfo.firstName} {loan.customer.personalInfo.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        KES {loan.principal.toLocaleString()}
                      </p>
                      <Badge variant={
                        loan.status === 'approved' ? 'default' :
                        loan.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {loan.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent loans</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/payments')}
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivity.payments?.length > 0 ? (
                data.recentActivity.payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.paymentNumber}</p>
                        <p className="text-sm text-gray-500">
                          {payment.customer.personalInfo.firstName} {payment.customer.personalInfo.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +KES {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/customers/new')}
              className="h-24 flex-col bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Users className="h-6 w-6 mb-2" />
              Add Customer
            </Button>
            <Button
              onClick={() => navigate('/loans/new')}
              className="h-24 flex-col bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <Briefcase className="h-6 w-6 mb-2" />
              New Loan
            </Button>
            <Button
              onClick={() => navigate('/payments')}
              className="h-24 flex-col bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Wallet className="h-6 w-6 mb-2" />
              Record Payment
            </Button>
            <Button
              onClick={() => navigate('/reports')}
              className="h-24 flex-col bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;