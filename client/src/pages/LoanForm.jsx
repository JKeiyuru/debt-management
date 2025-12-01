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
    principal: 0,
    interestRate: 15,
    interestType: 'reducing_balance',
    term: {
      value: 12,
      unit: 'months'
    },
    repaymentFrequency: 'monthly',
    amortizationMethod: 'equal_installments',
    gracePeriod: 0,
    fees: {
      processingFee: 0,
      insuranceFee: 0,
      legalFee: 0,
      otherFees: 0
    }
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers?limit=100');
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
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
      const response = await api.post('/loans', formData);
      toast({
        title: 'Success',
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
                  value={formData.principal}
                  onChange={(e) => handleChange('principal', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (% per annum) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
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
                  value={formData.term.value}
                  onChange={(e) => handleNestedChange('term', 'value', parseInt(e.target.value) || 1)}
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
            <CardTitle>Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="processingFee">Processing Fee (KES)</Label>
                <Input
                  id="processingFee"
                  type="number"
                  value={formData.fees.processingFee}
                  onChange={(e) => handleNestedChange('fees', 'processingFee', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="insuranceFee">Insurance Fee (KES)</Label>
                <Input
                  id="insuranceFee"
                  type="number"
                  value={formData.fees.insuranceFee}
                  onChange={(e) => handleNestedChange('fees', 'insuranceFee', parseFloat(e.target.value) || 0)}
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