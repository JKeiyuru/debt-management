const { addDays, addWeeks, addMonths, addYears, differenceInDays } = require('date-fns');

// Calculate total interest based on interest type
const calculateTotalInterest = (principal, rate, term, interestType) => {
  const annualRate = rate / 100;
  
  switch (interestType) {
    case 'flat':
      return principal * annualRate * term;
    
    case 'reducing_balance':
      // For reducing balance, we'll calculate during schedule generation
      return 0;
    
    case 'compound':
      return principal * (Math.pow(1 + annualRate, term) - 1);
    
    default:
      return 0;
  }
};

// Generate repayment schedule
const generateRepaymentSchedule = ({
  principal,
  interestRate,
  interestType,
  term,
  repaymentFrequency,
  amortizationMethod,
  startDate,
  gracePeriod = 0
}) => {
  try {
    console.log('🔢 Generating schedule with:', {
      principal,
      interestRate,
      interestType,
      term,
      repaymentFrequency,
      amortizationMethod,
      gracePeriod
    });

    const schedule = [];
    let balance = principal;
    const annualRate = interestRate / 100;
    
    // Validate term structure
    if (!term || !term.value || !term.unit) {
      throw new Error('Invalid term structure. Expected: { value: number, unit: string }');
    }

    // Calculate number of installments
    let numberOfInstallments;
    switch (repaymentFrequency) {
      case 'daily':
        numberOfInstallments = term.unit === 'days' ? term.value : term.value * 30;
        break;
      case 'weekly':
        numberOfInstallments = term.unit === 'weeks' ? term.value : Math.ceil(term.value * 4.33);
        break;
      case 'biweekly':
        numberOfInstallments = term.unit === 'months' ? Math.ceil(term.value * 2) : Math.ceil(term.value * 26/12);
        break;
      case 'monthly':
        numberOfInstallments = term.unit === 'months' ? term.value : term.value * 12;
        break;
      case 'quarterly':
        numberOfInstallments = term.unit === 'months' ? Math.ceil(term.value / 3) : term.value * 4;
        break;
      case 'bullet':
        numberOfInstallments = 1;
        break;
      default:
        numberOfInstallments = term.value;
    }

    console.log('📅 Number of installments:', numberOfInstallments);

    // Adjust for grace period
    let firstPaymentDate = new Date(startDate);
    if (gracePeriod > 0) {
      firstPaymentDate = addDays(firstPaymentDate, gracePeriod);
    }

    // Calculate periodic interest rate
    let periodicRate;
    switch (repaymentFrequency) {
      case 'daily':
        periodicRate = annualRate / 365;
        break;
      case 'weekly':
        periodicRate = annualRate / 52;
        break;
      case 'biweekly':
        periodicRate = annualRate / 26;
        break;
      case 'monthly':
        periodicRate = annualRate / 12;
        break;
      case 'quarterly':
        periodicRate = annualRate / 4;
        break;
      case 'bullet':
        periodicRate = annualRate * (term.value / 12); // Annual rate adjusted for term
        break;
      default:
        periodicRate = annualRate / 12;
    }

    console.log('💰 Periodic rate:', periodicRate);

    // Generate schedule based on amortization method
    if (amortizationMethod === 'equal_installments') {
      // Equal installments (EMI)
      let emi;
      
      if (interestType === 'reducing_balance' && numberOfInstallments > 1) {
        // Calculate EMI using the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
        const numerator = principal * periodicRate * Math.pow(1 + periodicRate, numberOfInstallments);
        const denominator = Math.pow(1 + periodicRate, numberOfInstallments) - 1;
        emi = numerator / denominator;
      } else if (interestType === 'flat') {
        const totalInterest = principal * annualRate * (term.value / 12);
        emi = (principal + totalInterest) / numberOfInstallments;
      } else {
        // Default calculation
        emi = principal / numberOfInstallments + (principal * periodicRate);
      }

      console.log('💵 EMI:', emi);

      for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = calculateDueDate(firstPaymentDate, i, repaymentFrequency);
        
        let interestDue, principalDue;
        
        if (interestType === 'reducing_balance' && balance > 0) {
          interestDue = balance * periodicRate;
          principalDue = Math.min(emi - interestDue, balance);
        } else if (interestType === 'flat') {
          const totalInterest = principal * annualRate * (term.value / 12);
          interestDue = totalInterest / numberOfInstallments;
          principalDue = principal / numberOfInstallments;
        } else {
          interestDue = balance * periodicRate;
          principalDue = Math.min(principal / numberOfInstallments, balance);
        }

        // Ensure we don't go negative
        principalDue = Math.max(0, principalDue);
        interestDue = Math.max(0, interestDue);

        balance = Math.max(0, balance - principalDue);

        schedule.push({
          installmentNumber: i,
          dueDate,
          principalDue: Math.round(principalDue * 100) / 100,
          interestDue: Math.round(interestDue * 100) / 100,
          totalDue: Math.round((principalDue + interestDue) * 100) / 100,
          balance: Math.round(balance * 100) / 100,
          status: 'pending',
          principalPaid: 0,
          interestPaid: 0,
          totalPaid: 0,
          daysPastDue: 0,
          penalty: 0
        });
      }
    } else if (amortizationMethod === 'equal_principal') {
      // Equal principal
      const principalPerInstallment = principal / numberOfInstallments;

      for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = calculateDueDate(firstPaymentDate, i, repaymentFrequency);
        const interestDue = balance * periodicRate;
        
        balance = Math.max(0, balance - principalPerInstallment);

        schedule.push({
          installmentNumber: i,
          dueDate,
          principalDue: Math.round(principalPerInstallment * 100) / 100,
          interestDue: Math.round(interestDue * 100) / 100,
          totalDue: Math.round((principalPerInstallment + interestDue) * 100) / 100,
          balance: Math.round(balance * 100) / 100,
          status: 'pending',
          principalPaid: 0,
          interestPaid: 0,
          totalPaid: 0,
          daysPastDue: 0,
          penalty: 0
        });
      }
    } else if (amortizationMethod === 'bullet') {
      // Bullet payment
      const totalInterest = principal * annualRate * (term.value / 12);
      const dueDate = calculateDueDate(firstPaymentDate, numberOfInstallments, repaymentFrequency);

      schedule.push({
        installmentNumber: 1,
        dueDate,
        principalDue: principal,
        interestDue: Math.round(totalInterest * 100) / 100,
        totalDue: Math.round((principal + totalInterest) * 100) / 100,
        balance: 0,
        status: 'pending',
        principalPaid: 0,
        interestPaid: 0,
        totalPaid: 0,
        daysPastDue: 0,
        penalty: 0
      });
    }

    console.log('✅ Schedule generated:', schedule.length, 'installments');
    return schedule;
  } catch (error) {
    console.error('❌ Error generating schedule:', error);
    throw error;
  }
};

// Calculate due date based on frequency
const calculateDueDate = (startDate, installmentNumber, frequency) => {
  const baseDate = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      return addDays(baseDate, installmentNumber);
    case 'weekly':
      return addWeeks(baseDate, installmentNumber);
    case 'biweekly':
      return addWeeks(baseDate, installmentNumber * 2);
    case 'monthly':
      return addMonths(baseDate, installmentNumber);
    case 'quarterly':
      return addMonths(baseDate, installmentNumber * 3);
    case 'bullet':
      // For bullet, calculate based on the term
      return addMonths(baseDate, installmentNumber);
    default:
      return addMonths(baseDate, installmentNumber);
  }
};

// Calculate penalty
const calculatePenalty = (overdueAmount, daysPastDue, penaltyRules) => {
  if (!penaltyRules || !penaltyRules.enabled || daysPastDue <= (penaltyRules.graceDays || 0)) {
    return 0;
  }

  const effectiveDays = daysPastDue - (penaltyRules.graceDays || 0);

  switch (penaltyRules.type) {
    case 'percentage_of_overdue':
      return (overdueAmount * (penaltyRules.rate || 0) / 100) * effectiveDays / 30;
    case 'fixed_amount':
      return (penaltyRules.rate || 0) * Math.ceil(effectiveDays / 30);
    case 'percentage_of_principal':
      return overdueAmount * (penaltyRules.rate || 0) / 100;
    default:
      return 0;
  }
};

// Update loan delinquency status
const updateDelinquencyStatus = (daysPastDue) => {
  if (daysPastDue === 0) {
    return { status: 'current', missedPayments: 0 };
  } else if (daysPastDue <= 30) {
    return { status: 'early_arrears', missedPayments: 1 };
  } else if (daysPastDue <= 90) {
    return { status: 'late_arrears', missedPayments: Math.ceil(daysPastDue / 30) };
  } else {
    return { status: 'default', missedPayments: Math.ceil(daysPastDue / 30) };
  }
};

module.exports = {
  calculateTotalInterest,
  generateRepaymentSchedule,
  calculatePenalty,
  updateDelinquencyStatus,
  calculateDueDate
};