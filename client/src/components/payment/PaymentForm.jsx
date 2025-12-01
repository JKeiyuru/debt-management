import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  DollarSign, 
  CreditCard, 
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../ui/use-toast';

const PaymentForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    loan: searchParams.get('loanId') || '',
    amount: '',
    paymentMethod: 'cash',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  useEffect(() => {
    if (formData.loan) {
      fetchLoanDetails(formData.loan);
    }
  }, [formData.loan]);

  const fetchActiveLoans = async () => {
    try {
      const response = await api.get('/loans?status=disbursed,active&limit=100');
      setLoans(response.data.data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const fetchLoanDetails = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      setSelectedLoan(response.data.data.loan);
    } catch (error) {
      console.error('Error fetching loan:', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.loan || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Payment amount must be greater than zero',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/payments', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      toast({
        title: 'Success!',
        description: `Payment recorded successfully. Receipt: ${response.data.data.payment.receiptNumber}`
      });

      navigate(`/payments/${response.data.data.payment._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/payments')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Record Payment</h1>
          <p className="text-gray-600">Process loan repayment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Loan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="loan">Loan Account *</Label>
              <Select
                value={formData.loan}
                onValueChange={(value) => handleChange('loan', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan..." />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((loan) => (
                    <SelectItem key={loan._id} value={loan._id}>
                      {loan.loanNumber} - {loan.customer?.personalInfo?.firstName} {loan.customer?.personalInfo?.lastName} 
                      (Balance: KES {loan.balances.totalBalance.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loan Summary */}
            {selectedLoan && (
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-900">
                        {selectedLoan.customer.personalInfo.firstName} {selectedLoan.customer.personalInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Outstanding Balance</p>
                      <p className="font-semibold text-blue-600">
                        KES {selectedLoan.balances.totalBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Principal Due</p>
                      <p className="font-semibold text-gray-900">
                        KES {selectedLoan.balances.principalBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Interest Due</p>
                      <p className="font-semibold text-gray-900">
                        KES {selectedLoan.balances.interestBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Payment Amount (KES) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {selectedLoan && formData.amount && (
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(formData.amount) >= selectedLoan.balances.totalBalance 
                      ? '✓ Full payment' 
                      : `Remaining: KES ${(selectedLoan.balances.totalBalance - parseFloat(formData.amount)).toLocaleString()}`
                    }
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money (M-Pesa)</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transactionReference">Transaction Reference</Label>
                <Input
                  id="transactionReference"
                  placeholder="e.g., MPESA CODE, Cheque No."
                  value={formData.transactionReference}
                  onChange={(e) => handleChange('transactionReference', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleChange('paymentDate', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this payment..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Allocation Preview */}
        {selectedLoan && formData.amount && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg">Payment Allocation Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Penalties:</span>
                  <span className="font-semibold">
                    KES {Math.min(parseFloat(formData.amount) || 0, selectedLoan.balances.penaltyBalance).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fees:</span>
                  <span className="font-semibold">
                    KES {Math.min(Math.max(0, (parseFloat(formData.amount) || 0) - selectedLoan.balances.penaltyBalance), selectedLoan.balances.feesBalance).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest:</span>
                  <span className="font-semibold text-orange-600">
                    KES {Math.min(Math.max(0, (parseFloat(formData.amount) || 0) - selectedLoan.balances.penaltyBalance - selectedLoan.balances.feesBalance), selectedLoan.balances.interestBalance).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold text-blue-600">
                    KES {Math.max(0, (parseFloat(formData.amount) || 0) - selectedLoan.balances.penaltyBalance - selectedLoan.balances.feesBalance - selectedLoan.balances.interestBalance).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * Payment is allocated in order: Penalties → Fees → Interest → Principal
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/payments')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.loan || !formData.amount}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;