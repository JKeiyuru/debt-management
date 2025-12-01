const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Send payment reminder
exports.sendPaymentReminder = async ({ to, customerName, loanNumber, amount, dueDate }) => {
  try {
    await resend.emails.send({
      from: 'Debt Management System <noreply@yourdomain.com>',
      to,
      subject: 'Payment Reminder - Loan Payment Due',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Payment Reminder</h2>
          <p>Dear ${customerName},</p>
          <p>This is a friendly reminder that your loan payment is due soon.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Loan Number:</strong> ${loanNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> KES ${amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          <p>Please ensure payment is made on or before the due date to avoid penalties.</p>
          <p>Thank you for your business.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    });
    console.log('✅ Payment reminder sent to:', to);
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    throw error;
  }
};

// Send overdue notice
exports.sendOverdueNotice = async ({ to, customerName, loanNumber, amount, daysPastDue }) => {
  try {
    await resend.emails.send({
      from: 'Debt Management System <noreply@yourdomain.com>',
      to,
      subject: 'URGENT: Overdue Loan Payment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Overdue Payment Notice</h2>
          <p>Dear ${customerName},</p>
          <p>Your loan payment is <strong style="color: #dc2626;">OVERDUE</strong>.</p>
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 5px 0;"><strong>Loan Number:</strong> ${loanNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount Overdue:</strong> KES ${amount.toLocaleString()}</p>
            <p style="margin: 5px 0; color: #dc2626;"><strong>Days Past Due:</strong> ${daysPastDue} days</p>
          </div>
          <p>Please contact us immediately to arrange payment and avoid further penalties or legal action.</p>
          <p><strong>Contact us:</strong> +254 XXX XXX XXX</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    });
    console.log('✅ Overdue notice sent to:', to);
  } catch (error) {
    console.error('❌ Error sending overdue notice:', error);
    throw error;
  }
};

// Send payment receipt
exports.sendPaymentReceipt = async ({ to, customerName, receiptNumber, amount, paymentDate, loanNumber }) => {
  try {
    await resend.emails.send({
      from: 'Debt Management System <noreply@yourdomain.com>',
      to,
      subject: 'Payment Receipt - Thank You',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Payment Received</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you! We have received your payment.</p>
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="margin: 5px 0;"><strong>Receipt Number:</strong> ${receiptNumber}</p>
            <p style="margin: 5px 0;"><strong>Loan Number:</strong> ${loanNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> KES ${amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${new Date(paymentDate).toLocaleDateString()}</p>
          </div>
          <p>Your payment has been successfully processed and applied to your loan account.</p>
          <p>Thank you for your prompt payment!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    });
    console.log('✅ Payment receipt sent to:', to);
  } catch (error) {
    console.error('❌ Error sending payment receipt:', error);
    throw error;
  }
};

// Send loan approval notification
exports.sendLoanApproval = async ({ to, customerName, loanNumber, amount, approvalDate }) => {
  try {
    await resend.emails.send({
      from: 'Debt Management System <noreply@yourdomain.com>',
      to,
      subject: 'Loan Approved - Congratulations!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Loan Approved!</h2>
          <p>Dear ${customerName},</p>
          <p>Congratulations! Your loan application has been <strong style="color: #059669;">APPROVED</strong>.</p>
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="margin: 5px 0;"><strong>Loan Number:</strong> ${loanNumber}</p>
            <p style="margin: 5px 0;"><strong>Loan Amount:</strong> KES ${amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Approval Date:</strong> ${new Date(approvalDate).toLocaleDateString()}</p>
          </div>
          <p>Please visit our office to complete the disbursement process.</p>
          <p>Thank you for choosing our services!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    });
    console.log('✅ Loan approval notification sent to:', to);
  } catch (error) {
    console.error('❌ Error sending loan approval:', error);
    throw error;
  }
};