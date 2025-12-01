import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency, formatDate, getDaysPastDue } from '../../lib/utils';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const RepaymentSchedule = ({ schedule, loanStatus }) => {
  const getStatusBadge = (installment) => {
    const status = installment.status;
    const daysPastDue = getDaysPastDue(installment.dueDate);

    if (status === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }

    if (status === 'partial') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Partial
        </Badge>
      );
    }

    if (daysPastDue > 0 && loanStatus !== 'closed') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {daysPastDue}d Overdue
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getRowClassName = (installment) => {
    const daysPastDue = getDaysPastDue(installment.dueDate);
    
    if (installment.status === 'paid') {
      return 'bg-green-50/50';
    }
    
    if (daysPastDue > 0 && loanStatus !== 'closed') {
      return 'bg-red-50/50';
    }
    
    if (installment.status === 'partial') {
      return 'bg-orange-50/50';
    }
    
    return 'hover:bg-gray-50';
  };

  // Calculate summary statistics
  const summary = {
    totalInstallments: schedule.length,
    paidInstallments: schedule.filter(i => i.status === 'paid').length,
    totalDue: schedule.reduce((sum, i) => sum + i.totalDue, 0),
    totalPaid: schedule.reduce((sum, i) => sum + i.totalPaid, 0),
    totalPending: schedule.reduce((sum, i) => {
      if (i.status !== 'paid') {
        return sum + (i.totalDue - i.totalPaid);
      }
      return sum;
    }, 0),
    overdueCount: schedule.filter(i => {
      const daysPastDue = getDaysPastDue(i.dueDate);
      return daysPastDue > 0 && i.status !== 'paid' && loanStatus !== 'closed';
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.paidInstallments}/{summary.totalInstallments}
                </p>
                <p className="text-xs text-gray-500">installments</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalPaid).split(' ')[1]}
                </p>
                <p className="text-xs text-gray-500">KES</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.totalPending).split(' ')[1]}
                </p>
                <p className="text-xs text-gray-500">KES</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.overdueCount}
                </p>
                <p className="text-xs text-gray-500">installments</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Repayment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="p-3 text-sm font-semibold text-gray-700">#</th>
                  <th className="p-3 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Principal</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Interest</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Total Due</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Paid</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Balance</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((installment) => (
                  <tr 
                    key={installment.installmentNumber} 
                    className={`border-b transition-colors ${getRowClassName(installment)}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-700">
                            {installment.installmentNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(installment.dueDate)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm text-gray-700">
                        {installment.principalDue.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm text-gray-700">
                        {installment.interestDue.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {installment.totalDue.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-sm font-semibold ${
                        installment.totalPaid > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {installment.totalPaid.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {installment.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(installment)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan="2" className="p-3">
                    <span className="text-sm font-bold text-gray-900">TOTALS</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {schedule.reduce((sum, i) => sum + i.principalDue, 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {schedule.reduce((sum, i) => sum + i.interestDue, 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {summary.totalDue.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-bold text-green-600">
                      {summary.totalPaid.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-bold text-blue-600">
                      {summary.totalPending.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepaymentSchedule;