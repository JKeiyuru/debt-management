// client/src/components/reports/DelinquencyReport.jsx
// ============================================
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const DelinquencyReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDelinquencyData();
  }, []);

  const fetchDelinquencyData = async () => {
    try {
      const response = await api.get('/reports/delinquency');
      setData(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!data) return null;

  const getBracketLabel = (bracket) => {
    const labels = {
      0: 'Current (0 days)',
      1: '1-29 days past due',
      30: '30-59 days past due',
      60: '60-89 days past due',
      90: '90+ days past due'
    };
    return labels[bracket._id] || 'Other';
  };

  const getBracketColor = (bracket) => {
    if (bracket._id === 0) return 'bg-green-100 text-green-800 border-green-200';
    if (bracket._id < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (bracket._id < 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delinquency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Delinquency Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {data.byDelinquencyStatus?.map((status) => (
              <Card key={status._id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 capitalize mb-1">
                    {status._id.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(status.totalBalance)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delinquency Brackets */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-4">Aging Breakdown</h3>
            {data.delinquencyBrackets?.map((bracket, index) => {
              const total = data.delinquencyBrackets.reduce((sum, b) => sum + b.count, 0);
              const percentage = ((bracket.count / total) * 100).toFixed(1);

              return (
                <div key={index} className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge className={getBracketColor(bracket)}>
                        {getBracketLabel(bracket)}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {bracket.count} loans ({percentage}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(bracket.totalBalance)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg: {formatCurrency(bracket.avgBalance)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Delinquent Loans */}
          {data.topDelinquentLoans?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Most Overdue Loans
              </h3>
              <div className="space-y-2">
                {data.topDelinquentLoans.map((loan) => (
                  <div key={loan._id} className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{loan.loanNumber}</p>
                        <p className="text-sm text-gray-600">
                          {loan.customer.personalInfo.firstName} {loan.customer.personalInfo.lastName}
                        </p>
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {loan.delinquency.daysPastDue} days overdue
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {formatCurrency(loan.balances.totalBalance)}
                        </p>
                        <Badge variant="destructive" className="mt-1">
                          {loan.delinquency.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};