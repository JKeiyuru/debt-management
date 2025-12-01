import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoan();
  }, [id]);

  const fetchLoan = async () => {
    try {
      const response = await api.get(`/loans/${id}`);
      setLoan(response.data.data.loan);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/loans/${id}/approve`, { comments: 'Approved' });
      toast({
        title: 'Success',
        description: 'Loan approved successfully'
      });
      fetchLoan();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve loan',
        variant: 'destructive'
      });
    }
  };

  const handleDisburse = async () => {
    try {
      await api.post(`/loans/${id}/disburse`, {
        amount: loan.principal,
        method: 'bank_transfer',
        reference: `DISB-${Date.now()}`
      });
      toast({
        title: 'Success',
        description: 'Loan disbursed successfully'
      });
      fetchLoan();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to disburse loan',
        variant: 'destructive'
      });
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!loan) return <div className="text-center py-12">Loan not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/loans')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{loan.loanNumber}</h1>
            <p className="text-gray-600">
              {loan.customer.personalInfo.firstName} {loan.customer.personalInfo.lastName}
            </p>
          </div>
        </div>
        <Badge className={
          loan.status === 'approved' ? 'bg-green-100 text-green-800' :
          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          loan.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }>
          {loan.status}
        </Badge>
      </div>

      {/* Action Buttons */}
      {loan.status === 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve Loan
              </Button>
              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" /> Reject Loan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loan.status === 'approved' && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleDisburse} className="bg-blue-600 hover:bg-blue-700">
              Disburse Loan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              KES {loan.principal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {loan.interestRate}% p.a.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Loan Term</p>
            <p className="text-2xl font-bold text-gray-900">
              {loan.term.value} {loan.term.unit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Product Name</p>
              <p className="font-semibold">{loan.loanProduct.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product Type</p>
              <p className="font-semibold capitalize">{loan.loanProduct.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interest Type</p>
              <p className="font-semibold capitalize">{loan.interestType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Repayment Frequency</p>
              <p className="font-semibold capitalize">{loan.repaymentFrequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold">KES {loan.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="font-semibold text-blue-600">
                KES {loan.balances.totalBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repayment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Repayment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-right p-2">Principal</th>
                  <th className="text-right p-2">Interest</th>
                  <th className="text-right p-2">Total Due</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.repaymentSchedule.map((installment) => (
                  <tr key={installment.installmentNumber} className="border-b">
                    <td className="p-2">{installment.installmentNumber}</td>
                    <td className="p-2">
                      {new Date(installment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="text-right p-2">
                      {installment.principalDue.toLocaleString()}
                    </td>
                    <td className="text-right p-2">
                      {installment.interestDue.toLocaleString()}
                    </td>
                    <td className="text-right p-2 font-semibold">
                      {installment.totalDue.toLocaleString()}
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={
                        installment.status === 'paid' ? 'default' :
                        installment.status === 'partial' ? 'secondary' :
                        installment.status === 'overdue' ? 'destructive' : 'outline'
                      }>
                        {installment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanDetails;