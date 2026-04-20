// Core financial math: SIP, FIRE, Money Health Score, Tax (FY 2025-26)

export interface FinancialProfile {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  current_investments: number;
  current_debt: number;
  has_emergency_fund: boolean;
  has_health_insurance: boolean;
  has_term_insurance: boolean;
  retirement_age_target: number;
  expected_return_pct: number;
  inflation_pct: number;
  risk_tolerance: string;
}

/* ---------- SIP & Wealth Projection ---------- */
// Future Value of a monthly SIP, annual rate r%, n months
export function sipFutureValue(monthlyAmount: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return monthlyAmount * months;
  return monthlyAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

// Monthly SIP needed to reach a future value
export function sipRequired(targetAmount: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return targetAmount;
  if (r === 0) return targetAmount / months;
  return (targetAmount * r) / ((Math.pow(1 + r, months) - 1) * (1 + r));
}

// Lump sum future value
export function lumpSumFV(principal: number, annualRatePct: number, years: number) {
  return principal * Math.pow(1 + annualRatePct / 100, years);
}

/* ---------- FIRE ---------- */
// Corpus needed = 25x annual expenses (4% rule), inflation-adjusted to retirement age
export function fireCorpusNeeded(monthlyExpenses: number, currentAge: number, retireAge: number, inflationPct: number) {
  const yearsToRetire = Math.max(0, retireAge - currentAge);
  const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationPct / 100, yearsToRetire);
  return futureMonthlyExpenses * 12 * 25;
}

export function projectWealthOverTime(p: FinancialProfile, monthlySIP: number) {
  const yearsToRetire = Math.max(1, p.retirement_age_target - p.age);
  const points: { year: number; age: number; wealth: number }[] = [];
  let wealth = p.current_investments;
  const r = p.expected_return_pct / 100;
  for (let y = 0; y <= yearsToRetire; y++) {
    points.push({ year: y, age: p.age + y, wealth: Math.round(wealth) });
    wealth = wealth * (1 + r) + sipFutureValue(monthlySIP, p.expected_return_pct, 12);
  }
  return points;
}

/* ---------- Money Health Score (0-100) ---------- */
export interface HealthBreakdown {
  emergencyFund: number;     // 0-25
  savingsRate: number;       // 0-25
  debt: number;              // 0-15
  investmentDiversification: number; // 0-15
  retirementReadiness: number;       // 0-20
  total: number;             // 0-100
  weakSpots: string[];
}

export function calcMoneyHealthScore(p: FinancialProfile): HealthBreakdown {
  const weakSpots: string[] = [];

  // 1. Emergency fund (25 pts) — target = 6× monthly expenses
  const emergencyTarget = p.monthly_expenses * 6;
  const emergencyRatio = emergencyTarget > 0 ? Math.min(p.current_savings / emergencyTarget, 1) : 0;
  const emergencyFund = Math.round(emergencyRatio * 25);
  if (emergencyRatio < 0.5) weakSpots.push("Emergency fund below 3 months of expenses");

  // 2. Savings rate (25 pts) — target = 30% of income
  const surplus = Math.max(0, p.monthly_income - p.monthly_expenses);
  const savingsRate = p.monthly_income > 0 ? surplus / p.monthly_income : 0;
  const savingsRateScore = Math.round(Math.min(savingsRate / 0.3, 1) * 25);
  if (savingsRate < 0.2) weakSpots.push(`Savings rate is ${(savingsRate * 100).toFixed(0)}% — aim for 20-30%`);

  // 3. Debt (15 pts) — penalize if debt > 6 months income
  const debtRatio = p.monthly_income > 0 ? p.current_debt / (p.monthly_income * 12) : 0;
  const debt = Math.round(Math.max(0, 1 - debtRatio) * 15);
  if (debtRatio > 0.4) weakSpots.push("Debt is high relative to annual income");

  // 4. Investment diversification (15 pts) — investments > 2× annual expenses
  const annualExpenses = p.monthly_expenses * 12;
  const invRatio = annualExpenses > 0 ? Math.min(p.current_investments / (annualExpenses * 2), 1) : 0;
  const investmentDiversification = Math.round(invRatio * 15);
  if (invRatio < 0.3) weakSpots.push("Investment portfolio is small for your expense level");

  // 5. Retirement readiness (20 pts) — insurance + projected wealth
  let retirementReadiness = 0;
  if (p.has_emergency_fund) retirementReadiness += 4;
  if (p.has_health_insurance) retirementReadiness += 5;
  if (p.has_term_insurance) retirementReadiness += 5;
  const corpusNeeded = fireCorpusNeeded(p.monthly_expenses, p.age, p.retirement_age_target, p.inflation_pct);
  const projectedWealth = projectWealthOverTime(p, surplus * 0.7).slice(-1)[0]?.wealth ?? 0;
  const retireRatio = corpusNeeded > 0 ? Math.min(projectedWealth / corpusNeeded, 1) : 0;
  retirementReadiness += Math.round(retireRatio * 6);

  if (!p.has_health_insurance) weakSpots.push("No health insurance — critical for Indian families");
  if (!p.has_term_insurance && p.age >= 25) weakSpots.push("No term insurance — affordable life cover");

  const total = emergencyFund + savingsRateScore + debt + investmentDiversification + retirementReadiness;

  return {
    emergencyFund,
    savingsRate: savingsRateScore,
    debt,
    investmentDiversification,
    retirementReadiness,
    total,
    weakSpots,
  };
}

/* ---------- Tax Calc — India FY 2025-26 ---------- */
// New Regime FY25-26 slabs (default regime)
export function newRegimeTax(taxableIncome: number) {
  // Standard deduction 75K under new regime for salaried
  const ti = Math.max(0, taxableIncome - 75000);
  let tax = 0;
  const slabs = [
    { upto: 400000, rate: 0 },
    { upto: 800000, rate: 0.05 },
    { upto: 1200000, rate: 0.10 },
    { upto: 1600000, rate: 0.15 },
    { upto: 2000000, rate: 0.20 },
    { upto: 2400000, rate: 0.25 },
    { upto: Infinity, rate: 0.30 },
  ];
  let last = 0;
  for (const s of slabs) {
    if (ti > last) {
      const slabIncome = Math.min(ti, s.upto) - last;
      tax += slabIncome * s.rate;
      last = s.upto;
    } else break;
  }
  // Rebate u/s 87A: nil tax up to 12L taxable
  if (ti <= 1200000) tax = 0;
  // 4% cess
  return Math.round(tax * 1.04);
}

// Old Regime slabs
export function oldRegimeTax(grossIncome: number, deductions: { sec80c: number; sec80d: number; nps: number; hra: number; standardDeduction?: number }) {
  const std = deductions.standardDeduction ?? 50000;
  const ti = Math.max(
    0,
    grossIncome - std - Math.min(deductions.sec80c, 150000) - Math.min(deductions.sec80d, 25000) - Math.min(deductions.nps, 50000) - deductions.hra
  );
  let tax = 0;
  const slabs = [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 1000000, rate: 0.20 },
    { upto: Infinity, rate: 0.30 },
  ];
  let last = 0;
  for (const s of slabs) {
    if (ti > last) {
      const slabIncome = Math.min(ti, s.upto) - last;
      tax += slabIncome * s.rate;
      last = s.upto;
    } else break;
  }
  // Rebate 87A old regime: nil tax up to 5L taxable
  if (ti <= 500000) tax = 0;
  return Math.round(tax * 1.04);
}

/* ---------- Personality ---------- */
export interface PersonalityScores {
  saver: number;
  spender: number;
  investor: number;
}

export function classifyPersonality(s: PersonalityScores): { type: string; insights: string[] } {
  const max = Math.max(s.saver, s.spender, s.investor);
  let type = "balanced";
  if (s.saver === max && s.investor === max) type = "investor";
  else if (s.saver === max) type = "saver";
  else if (s.investor === max) type = "investor";
  else if (s.spender === max) type = "spender";

  const insights: Record<string, string[]> = {
    saver: [
      "You're great at preserving capital — but cash loses value to inflation.",
      "Move at least 50% of savings into equity SIPs for long-term growth.",
      "Keep 6 months expenses in liquid funds, invest the rest.",
    ],
    spender: [
      "Track every expense for 30 days to identify leaks.",
      "Automate a 20% SIP on salary day — pay yourself first.",
      "Use the 24-hour rule before any purchase above ₹2,000.",
    ],
    investor: [
      "Excellent! Now diversify across equity, debt, and gold.",
      "Rebalance your portfolio yearly to maintain risk profile.",
      "Don't forget term + health insurance — protect the corpus.",
    ],
    balanced: [
      "Solid foundation — now optimize each category.",
      "Increase SIPs by 10% every year (step-up SIP).",
      "Review your financial plan every 6 months.",
    ],
  };

  return { type, insights: insights[type] };
}
