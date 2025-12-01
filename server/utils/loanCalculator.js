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
  const schedule = [];
  let balance = principal;
  const annualRate = interestRate / 100;
  
  // Calculate number of installments
  let numberOfInstallments;
  switch (repaymentFrequency) {
    case 'daily':
      numberOfInstallments = term.unit === 'days' ? term.value : term.value * 30;
      break;
    case 'weekly':
      numberOfInstallments = term.unit === 'weeks' ? term.value : term.value * 4;
      break;
    case 'biweekly':
      numberOfInstallments = Math.ceil((term.unit === 'months' ? term.value * 4 : term.value) / 2);
      break;
    case 'monthly':
      numberOfInstallments = term.unit === 'months' ? term.value : term.value * 12;
      break;
    case 'quarterly':
      numberOfInstallments = Math.ceil((term.unit === 'months' ? term.value : term.value * 12) / 3);
      break;
    case 'bullet':
      numberOfInstallments = 1;
      break;
    default:
      numberOfInstallments = term.value;
  }

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
      periodicRate = annualRate;
      break;
    default:
      periodicRate = annualRate / 12;
  }

  // Generate schedule based on amortization method
  if (amortizationMethod === 'equal_installments') {
    // Equal installments (EMI)
    const emi = interestType === 'reducing_balance' 
      ? principal * periodicRate * Math.pow(1 + periodicRate, numberOfInstallments) / (Math.pow(1 + periodicRate, numberOfInstallments) - 1)
      : (principal + calculateTotalInterest(principal, interestRate, term.value, interestType)) / numberOfInstallments;

    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = calculateDueDate(firstPaymentDate, i, repaymentFrequency);
      
      let interestDue, principalDue;
      
      if (interestType === 'reducing_balance') {
        interestDue = balance * periodicRate;
        principalDue = emi - interestDue;
      } else {
        interestDue = (principal * annualRate * term.value) / numberOfInstallments;
        principalDue = principal / numberOfInstallments;
      }

      balance -= principalDue;

      schedule.push({
        installmentNumber: i,
        dueDate,
        principalDue: Math.round(principalDue * 100) / 100,
        interestDue: Math.round(interestDue * 100) / 100,
        totalDue: Math.round((principalDue + interestDue) * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
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
      
      balance -= principalPerInstallment;

      schedule.push({
        installmentNumber: i,
        dueDate,
        principalDue: Math.round(principalPerInstallment * 100) / 100,
        interestDue: Math.round(interestDue * 100) / 100,
        totalDue: Math.round((principalPerInstallment + interestDue) * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
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
    const totalInterest = calculateTotalInterest(principal, interestRate, term.value, interestType);
    const dueDate = calculateDueDate(firstPaymentDate, 1, repaymentFrequency);

    schedule.push({
      installmentNumber: 1,
      dueDate,
      principalDue: principal,
      interestDue: totalInterest,
      totalDue: principal + totalInterest,
      balance: 0,
      status: 'pending',
      principalPaid: 0,
      interestPaid: 0,
      totalPaid: 0,
      daysPastDue: 0,
      penalty: 0
    });
  }

  return schedule;
};

// Calculate due date based on frequency
const calculateDueDate = (startDate, installmentNumber, frequency) => {
  switch (frequency) {
    case 'daily':
      return addDays(startDate, installmentNumber);
    case 'weekly':
      return addWeeks(startDate, installmentNumber);
    case 'biweekly':
      return addWeeks(startDate, installmentNumber * 2);
    case 'monthly':
      return addMonths(startDate, installmentNumber);
    case 'quarterly':
      return addMonths(startDate, installmentNumber * 3);
    case 'bullet':
      return startDate;
    default:
      return addMonths(startDate, installmentNumber);
  }
};

// Calculate penalty
const calculatePenalty = (overdueAmount, daysPastDue, penaltyRules) => {
  if (!penaltyRules.enabled || daysPastDue <= penaltyRules.graceDays) {
    return 0;
  }

  const effectiveDays = daysPastDue - penaltyRules.graceDays;

  switch (penaltyRules.type) {
    case 'percentage_of_overdue':
      return (overdueAmount * penaltyRules.rate / 100) * effectiveDays / 30;
    case 'fixed_amount':
      return penaltyRules.rate * Math.ceil(effectiveDays / 30);
    case 'percentage_of_principal':
      return overdueAmount * penaltyRules.rate / 100;
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