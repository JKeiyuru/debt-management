// client/src/components/payment/PaymentReceipt.jsx
// ============================================
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Download, Printer, CheckCircle } from 'lucide-react';

export const PaymentReceipt = ({ payment }) => {
  const handlePrint = () => window.print();
  const handleDownload = () => {
    // Implement PDF download logic
    console.log('Download receipt');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Payment Receipt</h2>
        <p className="text-green-100">Transaction Successful</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-2">Receipt Number</p>
            <p className="text-3xl font-bold text-gray-900">{payment.receiptNumber}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="font-semibold">{formatDate(payment.paymentDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loan Number</p>
              <p className="font-semibold">{payment.loan?.loanNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold">
                {payment.customer?.personalInfo?.firstName} {payment.customer?.personalInfo?.lastName}
              </p>
            </div>
          </div>

          <Separator />

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Amount Paid</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold mb-3">Payment Allocation</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Penalties:</span>
              <span className="font-semibold">{formatCurrency(payment.allocation.penalty)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fees:</span>
              <span className="font-semibold">{formatCurrency(payment.allocation.fees)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interest:</span>
              <span className="font-semibold">{formatCurrency(payment.allocation.interest)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-600">Principal:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(payment.allocation.principal)}</span>
            </div>
          </div>

          {payment.transactionReference && (
            <div>
              <p className="text-sm text-gray-600">Transaction Reference</p>
              <p className="font-semibold">{payment.transactionReference}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 pt-4">
            Thank you for your payment. Keep this receipt for your records.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};