import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Send, Eye, Edit, Save, Plus, Trash2, Printer } from 'lucide-react';

const LoanContractGenerator = () => {
  const { id } = useParams(); // Contract ID from URL
  const [searchParams] = useSearchParams();
  const loanId = searchParams.get('loanId'); // Optional loan ID

  const [contractData, setContractData] = useState({
    // Business Info
    businessName: 'Your Debt Management Company',
    businessLogo: '',
    businessAddress: 'P.O. Box 12345, Nairobi, Kenya',
    businessPhone: '+254 700 000 000',
    businessEmail: 'info@yourdebtsystem.com',
    
    // Borrower Info
    borrowerName: '',
    borrowerIdNumber: '',
    borrowerPhone: '',
    borrowerEmail: '',
    borrowerAddress: '',
    borrowerKraPin: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinPhone: '',
    
    // Loan Details
    loanAmount: 0,
    loanType: 'Personal Loan',
    interestRate: 15,
    interestType: 'reducing_balance',
    processingFee: 0,
    legalFee: 0,
    insuranceFee: 0,
    otherFees: 0,
    disbursementMethod: 'Bank Transfer',
    
    // Repayment Terms
    repaymentPeriod: '3 months',
    repaymentSchedule: 'monthly',
    installmentAmount: 0,
    firstInstallmentDate: '',
    finalInstallmentDate: '',
    penaltyRate: '2% per month',
    gracePeriod: '3 days',
    
    // Collateral
    hasCollateral: false,
    collateralType: '',
    collateralValue: 0,
    collateralIdentifier: '',
    collateralLocation: '',
    
    // Custom Clauses
    customClauses: [
      'The borrower must repay all installments on the due dates specified in the repayment schedule.',
      'The borrower must keep their contact information active and notify the lender of any changes.',
      'Late payment will attract a penalty as specified in the terms.',
      'The lender reserves the right to recover collateral in case of default.'
    ],
    
    // Additional Terms
    defaultDefinition: 'Failure to pay two consecutive installments constitutes default.',
    defaultAction: 'The lender will initiate debt recovery procedures and may seize collateral.',
    dataConsentText: 'The borrower consents to the storage and processing of their personal data for loan management purposes.'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contractId, setContractId] = useState(id || null);

  // 🆕 Load existing contract on mount
  useEffect(() => {
    if (id) {
      loadContract(id);
    } else if (loanId) {
      loadContractByLoan(loanId);
    }
  }, [id, loanId]);

  const loadContract = async (contractId) => {
    try {
      setLoading(true);
      const response = await api.get(`/loan-contracts/${contractId}`);
      const contract = response.data.data.contract;
      
      // Populate form with contract data
      setContractData({
        businessName: contract.businessInfo?.name || '',
        businessLogo: contract.businessInfo?.logo || '',
        businessAddress: contract.businessInfo?.address || '',
        businessPhone: contract.businessInfo?.phone || '',
        businessEmail: contract.businessInfo?.email || '',
        
        // Populate borrower info from customer
        borrowerName: `${contract.customer?.personalInfo?.firstName || ''} ${contract.customer?.personalInfo?.lastName || ''}`,
        borrowerIdNumber: contract.customer?.identification?.idNumber || '',
        borrowerPhone: contract.customer?.contactInfo?.phone || '',
        borrowerEmail: contract.customer?.contactInfo?.email || '',
        borrowerAddress: contract.customer?.contactInfo?.address?.street || '',
        borrowerKraPin: '',
        nextOfKinName: contract.customer?.nextOfKin?.name || '',
        nextOfKinRelationship: contract.customer?.nextOfKin?.relationship || '',
        nextOfKinPhone: contract.customer?.nextOfKin?.phone || '',
        
        // Loan details from contract
        loanAmount: contract.terms?.loanAmount || 0,
        loanType: contract.loan?.loanProduct?.name || '',
        interestRate: contract.terms?.interestRate || 0,
        interestType: contract.terms?.interestType || 'reducing_balance',
        processingFee: contract.fees?.processingFee || 0,
        legalFee: contract.fees?.legalFee || 0,
        insuranceFee: contract.fees?.insuranceFee || 0,
        otherFees: contract.fees?.otherFees || 0,
        disbursementMethod: 'Bank Transfer',
        
        // Repayment terms
        repaymentPeriod: contract.terms?.repaymentPeriod || '',
        repaymentSchedule: contract.terms?.repaymentSchedule || 'monthly',
        installmentAmount: contract.terms?.installmentAmount || 0,
        firstInstallmentDate: contract.terms?.firstInstallmentDate ? 
          new Date(contract.terms.firstInstallmentDate).toISOString().split('T')[0] : '',
        finalInstallmentDate: contract.terms?.finalInstallmentDate ? 
          new Date(contract.terms.finalInstallmentDate).toISOString().split('T')[0] : '',
        penaltyRate: contract.terms?.penaltyRate || '2% per month',
        gracePeriod: contract.terms?.gracePeriod || '3 days',
        
        // Collateral
        hasCollateral: contract.collateral?.hasCollateral || false,
        collateralType: contract.collateral?.type || '',
        collateralValue: contract.collateral?.value || 0,
        collateralIdentifier: contract.collateral?.identifier || '',
        collateralLocation: contract.collateral?.location || '',
        
        // Terms
        customClauses: contract.clauses || [],
        defaultDefinition: contract.defaultDefinition || '',
        defaultAction: contract.defaultAction || '',
        dataConsentText: contract.dataConsentText || ''
      });
      
      setContractId(contract._id);
      
    } catch (error) {
      console.error('Error loading contract:', error);
      alert('Error loading contract');
    } finally {
      setLoading(false);
    }
  };

  const loadContractByLoan = async (loanId) => {
    try {
      setLoading(true);
      // Find contract by loan ID
      const response = await api.get(`/loan-contracts?loanId=${loanId}`);
      if (response.data.data.contracts.length > 0) {
        const contract = response.data.data.contracts[0];
        setContractId(contract._id);
        loadContract(contract._id);
      }
    } catch (error) {
      console.error('Error finding contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalFees = 
      Number(contractData.processingFee || 0) + 
      Number(contractData.legalFee || 0) + 
      Number(contractData.insuranceFee || 0) + 
      Number(contractData.otherFees || 0);
    
    const interestAmount = (Number(contractData.loanAmount) * Number(contractData.interestRate) / 100);
    const totalLoanCost = Number(contractData.loanAmount) + totalFees + interestAmount;
    const disbursedAmount = Number(contractData.loanAmount) - totalFees;
    
    return {
      totalFees,
      interestAmount,
      totalLoanCost,
      disbursedAmount
    };
  };

  const totals = calculateTotals();

  const handleInputChange = (field, value) => {
    setContractData(prev => ({ ...prev, [field]: value }));
  };

  const addCustomClause = () => {
    setContractData(prev => ({
      ...prev,
      customClauses: [...prev.customClauses, '']
    }));
  };

  const updateCustomClause = (index, value) => {
    setContractData(prev => ({
      ...prev,
      customClauses: prev.customClauses.map((clause, i) => i === index ? value : clause)
    }));
  };

  const removeCustomClause = (index) => {
    setContractData(prev => ({
      ...prev,
      customClauses: prev.customClauses.filter((_, i) => i !== index)
    }));
  };

  const generatePDF = () => {
    window.print();
  };

  const sendContract = () => {
    alert('Contract would be sent via email/SMS');
  };

  const saveTemplate = () => {
    localStorage.setItem('contractTemplate', JSON.stringify(contractData));
    alert('Template saved successfully!');
  };

  const loadTemplate = () => {
    const saved = localStorage.getItem('contractTemplate');
    if (saved) {
      setContractData(JSON.parse(saved));
      alert('Template loaded successfully!');
    }
  };

  // Add loading state to the component
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Contract Generator</h1>
          <p className="text-gray-600">Create and customize loan agreements</p>
          {contractId && (
            <p className="text-sm text-blue-600 mt-1">
              Editing contract: {contractId.substring(0, 8)}...
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTemplate}>
            Load Template
          </Button>
          <Button variant="outline" onClick={saveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        /* EDIT MODE */
        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="borrower">Borrower</TabsTrigger>
            <TabsTrigger value="loan">Loan Details</TabsTrigger>
            <TabsTrigger value="repayment">Repayment</TabsTrigger>
            <TabsTrigger value="collateral">Collateral</TabsTrigger>
            <TabsTrigger value="clauses">Terms</TabsTrigger>
          </TabsList>

          {/* Business Info Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name *</Label>
                    <Input
                      value={contractData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Logo URL</Label>
                    <Input
                      value={contractData.businessLogo}
                      onChange={(e) => handleInputChange('businessLogo', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Physical Address *</Label>
                    <Input
                      value={contractData.businessAddress}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={contractData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={contractData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borrower Info Tab */}
          <TabsContent value="borrower">
            <Card>
              <CardHeader>
                <CardTitle>Borrower Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name (as per ID) *</Label>
                    <Input
                      value={contractData.borrowerName}
                      onChange={(e) => handleInputChange('borrowerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>ID/Passport Number *</Label>
                    <Input
                      value={contractData.borrowerIdNumber}
                      onChange={(e) => handleInputChange('borrowerIdNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={contractData.borrowerPhone}
                      onChange={(e) => handleInputChange('borrowerPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={contractData.borrowerEmail}
                      onChange={(e) => handleInputChange('borrowerEmail', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Physical Address *</Label>
                    <Input
                      value={contractData.borrowerAddress}
                      onChange={(e) => handleInputChange('borrowerAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>KRA PIN (Optional)</Label>
                    <Input
                      value={contractData.borrowerKraPin}
                      onChange={(e) => handleInputChange('borrowerKraPin', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Next of Kin</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={contractData.nextOfKinName}
                        onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Relationship *</Label>
                      <Input
                        value={contractData.nextOfKinRelationship}
                        onChange={(e) => handleInputChange('nextOfKinRelationship', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        value={contractData.nextOfKinPhone}
                        onChange={(e) => handleInputChange('nextOfKinPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Details Tab */}
          <TabsContent value="loan">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loan Amount (KES) *</Label>
                    <Input
                      type="number"
                      value={contractData.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Loan Type</Label>
                    <Input
                      value={contractData.loanType}
                      onChange={(e) => handleInputChange('loanType', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      value={contractData.interestRate}
                      onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Interest Type</Label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={contractData.interestType}
                      onChange={(e) => handleInputChange('interestType', e.target.value)}
                    >
                      <option value="flat">Flat Rate</option>
                      <option value="reducing_balance">Reducing Balance</option>
                    </select>
                  </div>
                  <div>
                    <Label>Processing Fee (KES)</Label>
                    <Input
                      type="number"
                      value={contractData.processingFee}
                      onChange={(e) => handleInputChange('processingFee', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Legal Fee (KES)</Label>
                    <Input
                      type="number"
                      value={contractData.legalFee}
                      onChange={(e) => handleInputChange('legalFee', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Insurance Fee (KES)</Label>
                    <Input
                      type="number"
                      value={contractData.insuranceFee}
                      onChange={(e) => handleInputChange('insuranceFee', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Other Fees (KES)</Label>
                    <Input
                      type="number"
                      value={contractData.otherFees}
                      onChange={(e) => handleInputChange('otherFees', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Disbursement Method</Label>
                    <Input
                      value={contractData.disbursementMethod}
                      onChange={(e) => handleInputChange('disbursementMethod', e.target.value)}
                    />
                  </div>
                </div>

                {/* Calculated Totals */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h3 className="font-bold text-lg mb-3">Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Principal Amount:</span>
                      <span className="font-semibold">KES {Number(contractData.loanAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Fees:</span>
                      <span className="font-semibold">KES {totals.totalFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Amount:</span>
                      <span className="font-semibold">KES {totals.interestAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disbursed Amount:</span>
                      <span className="font-semibold text-green-600">KES {totals.disbursedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between col-span-2 pt-2 border-t border-blue-300">
                      <span className="font-bold">Total Loan Cost:</span>
                      <span className="font-bold text-lg">KES {totals.totalLoanCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repayment Tab */}
          <TabsContent value="repayment">
            <Card>
              <CardHeader>
                <CardTitle>Repayment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Repayment Period *</Label>
                    <Input
                      value={contractData.repaymentPeriod}
                      onChange={(e) => handleInputChange('repaymentPeriod', e.target.value)}
                      placeholder="e.g., 3 months, 12 weeks"
                    />
                  </div>
                  <div>
                    <Label>Repayment Schedule *</Label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={contractData.repaymentSchedule}
                      onChange={(e) => handleInputChange('repaymentSchedule', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="one-off">One-off</option>
                    </select>
                  </div>
                  <div>
                    <Label>Amount per Installment (KES)</Label>
                    <Input
                      type="number"
                      value={contractData.installmentAmount}
                      onChange={(e) => handleInputChange('installmentAmount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>First Installment Date *</Label>
                    <Input
                      type="date"
                      value={contractData.firstInstallmentDate}
                      onChange={(e) => handleInputChange('firstInstallmentDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Final Installment Date *</Label>
                    <Input
                      type="date"
                      value={contractData.finalInstallmentDate}
                      onChange={(e) => handleInputChange('finalInstallmentDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Late Payment Penalty</Label>
                    <Input
                      value={contractData.penaltyRate}
                      onChange={(e) => handleInputChange('penaltyRate', e.target.value)}
                      placeholder="e.g., 2% per month"
                    />
                  </div>
                  <div>
                    <Label>Grace Period</Label>
                    <Input
                      value={contractData.gracePeriod}
                      onChange={(e) => handleInputChange('gracePeriod', e.target.value)}
                      placeholder="e.g., 3 days"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collateral Tab */}
          <TabsContent value="collateral">
            <Card>
              <CardHeader>
                <CardTitle>Collateral / Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={contractData.hasCollateral}
                    onChange={(e) => handleInputChange('hasCollateral', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label>This loan requires collateral</Label>
                </div>

                {contractData.hasCollateral && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Collateral Type *</Label>
                      <Input
                        value={contractData.collateralType}
                        onChange={(e) => handleInputChange('collateralType', e.target.value)}
                        placeholder="e.g., Land title, Vehicle logbook"
                      />
                    </div>
                    <div>
                      <Label>Estimated Value (KES)</Label>
                      <Input
                        type="number"
                        value={contractData.collateralValue}
                        onChange={(e) => handleInputChange('collateralValue', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Serial/ID Number</Label>
                      <Input
                        value={contractData.collateralIdentifier}
                        onChange={(e) => handleInputChange('collateralIdentifier', e.target.value)}
                        placeholder="e.g., Title deed number, Vehicle reg"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={contractData.collateralLocation}
                        onChange={(e) => handleInputChange('collateralLocation', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms & Clauses Tab */}
          <TabsContent value="clauses">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom Clauses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg">Custom Clauses</Label>
                    <Button size="sm" onClick={addCustomClause}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Clause
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {contractData.customClauses.map((clause, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={clause}
                          onChange={(e) => updateCustomClause(index, e.target.value)}
                          placeholder="Enter clause text..."
                          className="flex-1"
                          rows={2}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomClause(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Default Definition */}
                <div>
                  <Label>Default Definition</Label>
                  <Textarea
                    value={contractData.defaultDefinition}
                    onChange={(e) => handleInputChange('defaultDefinition', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Default Action */}
                <div>
                  <Label>Action on Default</Label>
                  <Textarea
                    value={contractData.defaultAction}
                    onChange={(e) => handleInputChange('defaultAction', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Data Consent */}
                <div>
                  <Label>Data Use & Privacy Consent</Label>
                  <Textarea
                    value={contractData.dataConsentText}
                    onChange={(e) => handleInputChange('dataConsentText', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* PREVIEW MODE - COMPLETE CONTRACT */
        <>
          {/* Action Buttons for Preview */}
          <div className="flex gap-2 mb-4 print:hidden">
            <Button onClick={generatePDF}>
              <Printer className="h-4 w-4 mr-2" />
              Print / Save as PDF
            </Button>
            <Button onClick={sendContract} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Contract
            </Button>
            <Button onClick={() => setPreviewMode(false)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <Card className="max-w-4xl mx-auto print:shadow-none print:border-0">
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 pb-6">
                {contractData.businessLogo && (
                  <img src={contractData.businessLogo} alt="Logo" className="h-16 mx-auto mb-4" />
                )}
                <h1 className="text-2xl font-bold">{contractData.businessName}</h1>
                <p className="text-sm text-gray-600">{contractData.businessAddress}</p>
                <p className="text-sm text-gray-600">
                  Tel: {contractData.businessPhone} | Email: {contractData.businessEmail}
                </p>
                <div className="mt-4 pt-4 border-t">
                  <h2 className="text-xl font-bold">LOAN AGREEMENT CONTRACT</h2>
                  <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Loan Reference: LN{Date.now()}</p>
                </div>
              </div>

              {/* Borrower Details */}
              <div>
                <h3 className="font-bold text-lg mb-3 border-b pb-2">BORROWER DETAILS</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-semibold">Full Name:</span> {contractData.borrowerName}</div>
                  <div><span className="font-semibold">ID Number:</span> {contractData.borrowerIdNumber}</div>
                  <div><span className="font-semibold">Phone:</span> {contractData.borrowerPhone}</div>
                  <div><span className="font-semibold">Email:</span> {contractData.borrowerEmail}</div>
                  <div className="col-span-2"><span className="font-semibold">Address:</span> {contractData.borrowerAddress}</div>
                  {contractData.borrowerKraPin && (
                    <div><span className="font-semibold">KRA PIN:</span> {contractData.borrowerKraPin}</div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-semibold mb-2">Next of Kin</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><span className="font-semibold">Name:</span> {contractData.nextOfKinName}</div>
                    <div><span className="font-semibold">Relationship:</span> {contractData.nextOfKinRelationship}</div>
                    <div><span className="font-semibold">Phone:</span> {contractData.nextOfKinPhone}</div>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div>
                <h3 className="font-bold text-lg mb-3 border-b pb-2">LOAN DETAILS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Loan Amount Issued:</span>
                    <span className="font-semibold">KES {Number(contractData.loanAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Type:</span>
                    <span className="font-semibold">{contractData.loanType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate ({contractData.interestType.replace('_', ' ')}):</span>
                    <span className="font-semibold">{contractData.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span>KES {Number(contractData.processingFee).toLocaleString()}</span>
                  </div>
                  {Number(contractData.legalFee) > 0 && (
                    <div className="flex justify-between">
                      <span>Legal Fee:</span>
                      <span>KES {Number(contractData.legalFee).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(contractData.insuranceFee) > 0 && (
                    <div className="flex justify-between">
                      <span>Insurance Fee:</span>
                      <span>KES {Number(contractData.insuranceFee).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(contractData.otherFees) > 0 && (
                    <div className="flex justify-between">
                      <span>Other Fees:</span>
                      <span>KES {Number(contractData.otherFees).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Total Loan Cost:</span>
                    <span>KES {totals.totalLoanCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Amount to be Disbursed:</span>
                    <span>KES {totals.disbursedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disbursement Method:</span>
                    <span className="font-semibold">{contractData.disbursementMethod}</span>
                  </div>
                </div>
              </div>

              {/* Repayment Terms */}
              <div>
                <h3 className="font-bold text-lg mb-3 border-b pb-2">REPAYMENT TERMS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Repayment Period:</span>
                    <span className="font-semibold">{contractData.repaymentPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repayment Schedule:</span>
                    <span className="font-semibold capitalize">{contractData.repaymentSchedule}</span>
                  </div>
                  {contractData.installmentAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Amount per Installment:</span>
                      <span className="font-semibold">KES {Number(contractData.installmentAmount).toLocaleString()}</span>
                    </div>
                  )}
                  {contractData.firstInstallmentDate && (
                    <div className="flex justify-between">
                      <span>First Installment Date:</span>
                      <span className="font-semibold">{new Date(contractData.firstInstallmentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {contractData.finalInstallmentDate && (
                    <div className="flex justify-between">
                      <span>Final Installment Date:</span>
                      <span className="font-semibold">{new Date(contractData.finalInstallmentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Late Payment Penalty:</span>
                    <span className="font-semibold">{contractData.penaltyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grace Period:</span>
                    <span className="font-semibold">{contractData.gracePeriod}</span>
                  </div>
                </div>
              </div>

              {/* Collateral (if applicable) */}
              {contractData.hasCollateral && (
                <div>
                  <h3 className="font-bold text-lg mb-3 border-b pb-2">COLLATERAL / SECURITY</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Collateral Type:</span>
                      <span className="font-semibold">{contractData.collateralType}</span>
                    </div>
                    {contractData.collateralValue > 0 && (
                      <div className="flex justify-between">
                        <span>Estimated Value:</span>
                        <span className="font-semibold">KES {Number(contractData.collateralValue).toLocaleString()}</span>
                      </div>
                    )}
                    {contractData.collateralIdentifier && (
                      <div className="flex justify-between">
                        <span>Serial/ID Number:</span>
                        <span className="font-semibold">{contractData.collateralIdentifier}</span>
                      </div>
                    )}
                    {contractData.collateralLocation && (
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-semibold">{contractData.collateralLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div>
                <h3 className="font-bold text-lg mb-3 border-b pb-2">TERMS & CONDITIONS</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Borrower Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {contractData.customClauses.filter(c => c.trim()).map((clause, index) => (
                        <li key={index} className="ml-2">{clause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Default Conditions</h4>
                    <p className="mb-2"><span className="font-semibold">Definition of Default:</span> {contractData.defaultDefinition}</p>
                    <p><span className="font-semibold">Action on Default:</span> {contractData.defaultAction}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Data Use & Privacy</h4>
                    <p>{contractData.dataConsentText}</p>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <h3 className="font-bold text-lg mb-3">DECLARATION</h3>
                <p className="text-sm leading-relaxed">
                  I, <span className="font-semibold border-b border-gray-400 px-2">{contractData.borrowerName || '____________________'}</span>, 
                  hereby confirm that I have read, understood, and agree to all the terms and conditions stated in this loan agreement. 
                  I commit to repaying the loan amount of <span className="font-semibold">KES {Number(contractData.loanAmount).toLocaleString()}</span> plus 
                  interest and fees as per the repayment schedule. I understand that failure to comply with these terms may result in 
                  penalties and legal action as specified above.
                </p>
              </div>

              {/* Signatures */}
              <div>
                <h3 className="font-bold text-lg mb-4 border-b pb-2">SIGNATURES</h3>
                <div className="grid grid-cols-2 gap-8">
                  {/* Borrower Signature */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">BORROWER</p>
                      <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
                      <p className="text-xs">Signature</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1">Name: {contractData.borrowerName}</p>
                      <div className="border-b border-gray-400 mb-2"></div>
                      <p className="text-xs">Date: _______________</p>
                    </div>
                  </div>

                  {/* Lender Signature */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">LENDER</p>
                      <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
                      <p className="text-xs">Signature</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1">Name: _______________</p>
                      <div className="border-b border-gray-400 mb-2"></div>
                      <p className="text-xs">Date: _______________</p>
                    </div>
                  </div>
                </div>

                {/* Witness (Optional) */}
                <div className="mt-8 pt-4 border-t">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">WITNESS (Optional)</p>
                      <div className="border-b-2 border-gray-400 h-16 mb-2 max-w-md"></div>
                      <p className="text-xs">Signature</p>
                    </div>
                    <div className="max-w-md">
                      <p className="text-xs mb-1">Name: _______________</p>
                      <div className="border-b border-gray-400 mb-2"></div>
                      <p className="text-xs">Date: _______________</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Stamp */}
              <div className="text-center pt-6 border-t">
                <div className="inline-block border-2 border-dashed border-gray-400 rounded-lg p-6 w-48 h-48 flex items-center justify-center">
                  <p className="text-sm text-gray-500">Official Company Stamp/Seal</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-6 border-t">
                <p>This is a legally binding document. Both parties should retain a copy for their records.</p>
                <p className="mt-2">{contractData.businessName} | {contractData.businessPhone} | {contractData.businessEmail}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoanContractGenerator;