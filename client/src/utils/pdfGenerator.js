// client/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateContractPDF = (contractData) => {
  const doc = new jsPDF();
  
  // Add business header
  doc.setFontSize(20);
  doc.text(contractData.businessName, 105, 20, { align: 'center' });
  
  // Add contract content
  doc.setFontSize(12);
  doc.text('LOAN AGREEMENT CONTRACT', 105, 35, { align: 'center' });
  
  // Add borrower details
  doc.text('BORROWER DETAILS', 20, 50);
  doc.setFontSize(10);
  doc.text(`Name: ${contractData.borrowerName}`, 20, 60);
  // ... add more fields
  
  // Save the PDF
  doc.save(`Contract_${contractData.contractNumber}.pdf`);
};