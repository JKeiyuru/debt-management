import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const LoanForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer: '',
    loanProduct: {
      name: 'Personal Loan',
      type: 'personal'
    },
    principal: '',
    interestRate: '',
    interestType: 'reducing_balance',
    term: {
      value: '',
      unit: 'months'
    },
    repaymentFrequency: 'monthly',
    amortizationMethod: 'equal_installments',
    gracePeriod: '',
    fees: {
      processingFee: '',
      insuranceFee: '',
      legalFee: '',
      otherFees: ''
    }
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers?limit=100&status=active');
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert empty strings to numbers
      const submitData = {
        ...formData,
        principal: parseFloat(formData.principal) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        term: {
          ...formData.term,
          value: parseInt(formData.term.value) || 1
        },
        gracePeriod: parseInt(formData.gracePeriod) || 0,
        fees: {
          processingFee: parseFloat(formData.fees.processingFee) || 0,
          insuranceFee: parseFloat(formData.fees.insuranceFee) || 0,
          legalFee: parseFloat(formData.fees.legalFee) || 0,
          otherFees: parseFloat(formData.fees.otherFees) || 0
        }
      };

      const response = await api.post('/loans', submitData);
      toast({
        title: 'Success! 🎉',
        description: 'Loan created successfully'
      });
      navigate(`/loans/${response.data.data.loan._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create loan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/loans')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Loan</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Select Customer *</Label>
                <Select
                  value={formData.customer}
                  onValueChange={(value) => handleChange('customer', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.personalInfo.firstName} {customer.personalInfo.lastName} - {customer.contactInfo.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.loanProduct.name}
                  onChange={(e) => handleNestedChange('loanProduct', 'name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select
                  value={formData.loanProduct.type}
                  onValueChange={(value) => handleNestedChange('loanProduct', 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="asset_financing">Asset Financing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="principal">Principal Amount (KES) *</Label>
                <Input
                  id="principal"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Enter amount (e.g., 50000)"
                  value={formData.principal}
                  onChange={(e) => handleChange('principal', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (% per annum) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Enter rate (e.g., 15.5)"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interestType">Interest Type</Label>
                <Select
                  value={formData.interestType}
                  onValueChange={(value) => handleChange('interestType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="reducing_balance">Reducing Balance</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="termValue">Loan Term (months) *</Label>
                <Input
                  id="termValue"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter term (e.g., 12)"
                  value={formData.term.value}
                  onChange={(e) => handleNestedChange('term', 'value', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="repaymentFrequency">Repayment Frequency</Label>
                <Select
                  value={formData.repaymentFrequency}
                  onValueChange={(value) => handleChange('repaymentFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bullet">Bullet (One payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amortizationMethod">Amortization Method</Label>
                <Select
                  value={formData.amortizationMethod}
                  onValueChange={(value) => handleChange('amortizationMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal_installments">Equal Installments</SelectItem>
                    <SelectItem value="equal_principal">Equal Principal</SelectItem>
                    <SelectItem value="bullet">Bullet Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fees (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="processingFee">Processing Fee (KES)</Label>
                <Input
                  id="processingFee"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Enter amount (e.g., 2500)"
                  value={formData.fees.processingFee}
                  onChange={(e) => handleNestedChange('fees', 'processingFee', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="insuranceFee">Insurance Fee (KES)</Label>
                <Input
                  id="insuranceFee"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Enter amount (e.g., 1000)"
                  value={formData.fees.insuranceFee}
                  onChange={(e) => handleNestedChange('fees', 'insuranceFee', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/loans')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : (
              <>
                <Save className="mr-2 h-4 w-4" /> Create Loan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;