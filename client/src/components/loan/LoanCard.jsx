import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  User,
  Eye,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

const LoanCard = ({ loan, onClick, onQuickAction }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      disbursed: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-purple-100 text-purple-800 border-purple-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      defaulted: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    if (status === 'defaulted' || loan.delinquency?.daysPastDue > 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return null;
  };

  const calculateProgress = () => {
    if (loan.totalAmount === 0) return 0;
    const paid = loan.totalAmount - loan.balances.totalBalance;
    return (paid / loan.totalAmount) * 100;
  };

  // Only show payment button for loans that can receive payments
  const canReceivePayment = ['disbursed', 'active'].includes(loan.status);

  return (
    <Card 
      className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500 overflow-hidden"
      onClick={(e) => {
        // Only trigger onClick if not clicking on buttons
        if (!e.target.closest('button')) {
          onClick();
        }
      }}
    >
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                  {loan.loanNumber}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {loan.loanProduct.name}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(loan.status)} flex items-center gap-1`}>
              {getStatusIcon(loan.status)}
              <span className="capitalize">{loan.status}</span>
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 rounded-lg px-3 py-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {loan.customer?.personalInfo?.firstName} {loan.customer?.personalInfo?.lastName}
            </span>
          </div>
        </div>

        {/* Amount & Progress Section */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Principal Amount</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(loan.principal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Outstanding</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(loan.balances.totalBalance)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Repayment Progress</span>
              <span>{calculateProgress().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="font-semibold text-gray-900">{loan.interestRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">Term</p>
                <p className="font-semibold text-gray-900">
                  {loan.term.value} {loan.term.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Delinquency Warning */}
          {loan.delinquency?.daysPastDue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {loan.delinquency.daysPastDue} days overdue
                </p>
                <p className="text-xs text-red-600">
                  {loan.delinquency.missedPayments} missed payment(s)
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {canReceivePayment && onQuickAction && (
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction(loan);
                }}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Record Payment
              </Button>
            )}
          </div>
        </div>

        {/* Footer with dates */}
        <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 flex justify-between border-t">
          <span>Created: {formatDate(loan.createdAt)}</span>
          {loan.disbursementDate && (
            <span>Disbursed: {formatDate(loan.disbursementDate)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCard;