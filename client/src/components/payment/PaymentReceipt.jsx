// client/src/components/payment/PaymentReceipt.jsx
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Download, Printer, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { jsPDF } from 'jspdf';

export const PaymentReceipt = ({ payment }) => {
  const handlePrint = () => window.print();
  
  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Payment Receipt - ${payment.receiptNumber}`,
      subject: 'Payment Receipt',
      author: 'Loan Management System',
      keywords: 'receipt, payment, invoice',
      creator: 'Loan Management System'
    });
    
    // Header with company info
    doc.setFontSize(24);
    doc.setTextColor(46, 125, 50); // Green color
    doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Transaction Successful', 105, 28, { align: 'center' });
    
    // Add a small green check icon
    doc.setFillColor(46, 125, 50);
    doc.circle(105, 38, 3, 'F');
    
    // Receipt details
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    let yPos = 50;
    
    // Receipt number
    doc.setTextColor(100);
    doc.text('Receipt Number:', 20, yPos);
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(payment.receiptNumber, 80, yPos);
    
    yPos += 10;
    
    // Create a two-column layout for details
    const leftColumn = [
      { label: 'Payment Date:', value: formatDate(payment.paymentDate) },
      { label: 'Payment Method:', value: payment.paymentMethod.replace('_', ' ') }
    ];
    
    const rightColumn = [
      { label: 'Loan Number:', value: payment.loan?.loanNumber || 'N/A' },
      { label: 'Customer:', value: `${payment.customer?.personalInfo?.firstName || ''} ${payment.customer?.personalInfo?.lastName || ''}`.trim() }
    ];
    
    // Draw left column
    leftColumn.forEach((item, index) => {
      const y = yPos + (index * 8);
      doc.setTextColor(100);
      doc.text(item.label, 20, y);
      doc.setTextColor(0);
      doc.text(item.value.toString(), 65, y);
    });
    
    // Draw right column
    rightColumn.forEach((item, index) => {
      const y = yPos + (index * 8);
      doc.setTextColor(100);
      doc.text(item.label, 110, y);
      doc.setTextColor(0);
      doc.text(item.value.toString(), 155, y);
    });
    
    yPos += 25;
    
    // Amount paid - highlighted
    doc.setFillColor(232, 245, 233); // Light green background
    doc.rect(20, yPos - 5, 170, 15, 'F');
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('Amount Paid:', 25, yPos + 5);
    doc.setFontSize(18);
    doc.setTextColor(46, 125, 50); // Green color
    doc.text(formatCurrency(payment.amount), 150, yPos + 5, { align: 'right' });
    
    yPos += 25;
    
    // Payment allocation header
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Payment Allocation', 20, yPos);
    
    yPos += 8;
    
    // Draw allocation items with manual table
    const allocations = [
      { label: 'Penalties:', amount: payment.allocation.penalty },
      { label: 'Fees:', amount: payment.allocation.fees },
      { label: 'Interest:', amount: payment.allocation.interest },
      { label: 'Principal:', amount: payment.allocation.principal }
    ];
    
    // Table header
    doc.setFillColor(46, 125, 50);
    doc.rect(20, yPos - 4, 170, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text('Category', 25, yPos);
    doc.text('Amount', 165, yPos, { align: 'right' });
    
    yPos += 4;
    
    // Table rows
    allocations.forEach((item, index) => {
      const y = yPos + (index * 10);
      
      // Alternate background for rows
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(245, 245, 245);
      }
      doc.rect(20, y, 170, 10, 'F');
      
      // Draw row border
      doc.setDrawColor(220, 220, 220);
      doc.line(20, y, 190, y);
      doc.line(20, y + 10, 190, y + 10);
      
      // Add row data
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(item.label, 25, y + 7);
      doc.setTextColor(0);
      doc.text(formatCurrency(item.amount), 165, y + 7, { align: 'right' });
    });
    
    yPos += allocations.length * 10 + 15;
    
    // Additional information
    if (payment.transactionReference) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Transaction Reference:', 20, yPos);
      doc.setTextColor(0);
      doc.text(payment.transactionReference, 70, yPos);
      yPos += 10;
    }
    
    if (payment.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Notes:', 20, yPos);
      doc.setTextColor(0);
      
      // Wrap long notes
      const splitNotes = doc.splitTextToSize(payment.notes, 150);
      doc.text(splitNotes, 20, yPos + 5);
      yPos += splitNotes.length * 5 + 10;
    }
    
    // Separator line before footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, 260, 190, 260);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for your payment. Keep this receipt for your records.', 105, 270, { align: 'center' });
    doc.text('Generated on ' + new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 105, 275, { align: 'center' });
    
    // Add page border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277); // A4 size border
    
    // Save the PDF
    doc.save(`receipt_${payment.receiptNumber}.pdf`);
  };
  
  const handleDownload = () => {
    try {
      generatePDF();
    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Fallback to text download if PDF generation fails
      const receiptText = `
PAYMENT RECEIPT
===============

Receipt Number: ${payment.receiptNumber}
Payment Date: ${formatDate(payment.paymentDate)}
Payment Method: ${payment.paymentMethod.replace('_', ' ')}

Loan Number: ${payment.loan?.loanNumber || 'N/A'}
Customer: ${payment.customer?.personalInfo?.firstName || ''} ${payment.customer?.personalInfo?.lastName || ''}

AMOUNT PAID: ${formatCurrency(payment.amount)}

PAYMENT ALLOCATION:
- Penalties: ${formatCurrency(payment.allocation.penalty)}
- Fees: ${formatCurrency(payment.allocation.fees)}
- Interest: ${formatCurrency(payment.allocation.interest)}
- Principal: ${formatCurrency(payment.allocation.principal)}

${payment.transactionReference ? `Transaction Reference: ${payment.transactionReference}` : ''}
${payment.notes ? `Notes: ${payment.notes}` : ''}

Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

Thank you for your payment!
`;

      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${payment.receiptNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
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

          {payment.notes && (
            <div>
              <p className="text-sm text-gray-600">Notes</p>
              <p className="text-sm text-gray-800">{payment.notes}</p>
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

export default PaymentReceipt;