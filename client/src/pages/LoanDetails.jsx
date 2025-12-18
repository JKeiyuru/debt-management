// client/src/pages/LoanDetails.jsx - UPDATED WITH DOCUMENTS TAB
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import RepaymentSchedule from '../components/loan/RepaymentSchedule';
import DocumentManager from '../components/document/DocumentManager';
import { ArrowLeft, CheckCircle, XCircle, Calendar, FileText, Eye } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loan, setLoan] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoan();
    fetchContract();
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

  const fetchContract = async () => {
    try {
      const response = await api.get(`/loan-contracts?loanId=${id}`);
      if (response.data.data.contracts.length > 0) {
        setContract(response.data.data.contracts[0]);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
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

  const handleViewContract = () => {
    if (contract) {
      navigate(`/contracts/${contract._id}?loanId=${id}`);
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
        <div className="flex items-center gap-2">
          {contract && (
            <Button variant="outline" onClick={handleViewContract}>
              <Eye className="mr-2 h-4 w-4" />
              View Contract
            </Button>
          )}
          <Badge className={
            loan.status === 'approved' ? 'bg-green-100 text-green-800' :
            loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            loan.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }>
            {loan.status}
          </Badge>
        </div>
      </div>

      {/* Contract Alert */}
      {contract && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Loan Contract Available</h3>
                  <p className="text-sm text-blue-700">
                    Contract {contract.contractNumber} • {contract.status}
                  </p>
                </div>
              </div>
              <Button onClick={handleViewContract}>
                <Eye className="mr-2 h-4 w-4" />
                View Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Loan Details Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="schedule">Repayment Schedule</TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            {contract && (
              <Badge className="ml-2 bg-blue-500 text-white">
                {contract ? '1+' : '0'}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
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
        </TabsContent>

        <TabsContent value="schedule">
          <RepaymentSchedule schedule={loan.repaymentSchedule} loanStatus={loan.status} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentManager entityType="Loan" entityId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanDetails;