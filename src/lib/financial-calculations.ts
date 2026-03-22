import { UserFinancialData, HealthScoreBreakdown, FireProjection } from "@/types/finance";

export function calculateHealthScore(data: UserFinancialData): {
  total: number;
  breakdown: HealthScoreBreakdown;
} {
  const { monthlyIncome, monthlyExpenses, currentSavings, investments, age } = data;
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;

  // Emergency fund: 6 months of expenses covered
  const emergencyMonths = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;
  const emergency = Math.min(Math.round((emergencyMonths / 6) * 100), 100);

  // Savings rate score
  const savings = Math.min(Math.round(savingsRate * 200), 100);

  // Debt score (inverse — lower expenses-to-income = better)
  const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  const debt = Math.min(Math.round((1 - expenseRatio) * 125), 100);

  // Investment score (based on age-appropriate investment ratio)
  const expectedInvestment = monthlyIncome * 12 * Math.max(1, (age - 20) * 0.5);
  const investmentScore = expectedInvestment > 0
    ? Math.min(Math.round((investments / expectedInvestment) * 100), 100)
    : 0;

  // Retirement readiness
  const yearsToRetire = Math.max(60 - age, 0);
  const retirementTarget = monthlyExpenses * 12 * 25;
  const currentProjected = (currentSavings + investments) * Math.pow(1.1, yearsToRetire);
  const retirement = Math.min(Math.round((currentProjected / retirementTarget) * 100), 100);

  const total = Math.round(
    emergency * 0.2 + savings * 0.25 + debt * 0.2 + investmentScore * 0.2 + retirement * 0.15
  );

  return {
    total: Math.min(total, 100),
    breakdown: { emergency, savings, debt, investments: investmentScore, retirement },
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Needs Work";
  return "Critical";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(152, 58%, 42%)";
  if (score >= 60) return "hsl(199, 89%, 48%)";
  if (score >= 40) return "hsl(38, 92%, 50%)";
  if (score >= 20) return "hsl(25, 95%, 53%)";
  return "hsl(0, 72%, 51%)";
}

export function generateInsights(data: UserFinancialData, breakdown: HealthScoreBreakdown): string[] {
  const insights: string[] = [];
  const { monthlyIncome, monthlyExpenses, currentSavings, investments } = data;
  const surplus = monthlyIncome - monthlyExpenses;

  if (breakdown.emergency < 50) {
    const needed = monthlyExpenses * 6 - currentSavings;
    insights.push(`Build your emergency fund — you need ₹${Math.round(needed).toLocaleString("en-IN")} more to cover 6 months of expenses.`);
  }

  if (breakdown.savings < 40) {
    insights.push(`Your savings rate is low. Try to save at least 20% of your income (₹${Math.round(monthlyIncome * 0.2).toLocaleString("en-IN")}/month).`);
  }

  if (breakdown.investments < 40) {
    insights.push(`Consider increasing your investments. Starting a SIP of ₹${Math.round(surplus * 0.3).toLocaleString("en-IN")}/month could grow significantly.`);
  }

  if (breakdown.retirement < 50) {
    insights.push("You're behind on retirement planning. Even small monthly contributions now will compound significantly over time.");
  }

  if (breakdown.debt > 70 && breakdown.savings > 60) {
    insights.push("Great job managing expenses! Consider directing more surplus toward investments for faster wealth building.");
  }

  if (surplus > 0 && investments === 0) {
    insights.push(`You have a monthly surplus of ₹${surplus.toLocaleString("en-IN")}. Investing even half of this could build serious wealth.`);
  }

  return insights.length > 0 ? insights : ["You're on a solid financial track. Keep up the good work!"];
}

export function calculateFireProjection(data: UserFinancialData): FireProjection {
  const { age, monthlyIncome, monthlyExpenses, currentSavings, investments } = data;
  const annualExpenses = monthlyExpenses * 12;
  const fireTarget = annualExpenses * 25; // 4% rule
  const currentCorpus = currentSavings + investments;
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const monthlyInvestment = monthlySurplus * 0.5;
  const annualReturn = 0.12;
  const monthlyReturn = annualReturn / 12;

  // Calculate years to FIRE
  let corpus = currentCorpus;
  let years = 0;
  const yearlyProjection: { year: number; wealth: number; invested: number }[] = [];
  let totalInvested = currentCorpus;

  yearlyProjection.push({ year: age, wealth: Math.round(corpus), invested: Math.round(totalInvested) });

  while (corpus < fireTarget && years < 50) {
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyReturn) + monthlyInvestment;
    }
    totalInvested += monthlyInvestment * 12;
    years++;
    yearlyProjection.push({
      year: age + years,
      wealth: Math.round(corpus),
      invested: Math.round(totalInvested),
    });
  }

  const estimatedRetirementAge = age + years;

  // Calculate SIP needed for target retirement age (60)
  const yearsTo60 = Math.max(60 - age, 1);
  const monthsTo60 = yearsTo60 * 12;
  const futureValueOfCurrent = currentCorpus * Math.pow(1 + monthlyReturn, monthsTo60);
  const remaining = Math.max(fireTarget - futureValueOfCurrent, 0);
  const sipFactor = (Math.pow(1 + monthlyReturn, monthsTo60) - 1) / monthlyReturn;
  const monthlySIPRequired = Math.round(remaining / sipFactor);

  return {
    estimatedRetirementAge: Math.min(estimatedRetirementAge, age + 50),
    monthlySIPRequired: Math.max(monthlySIPRequired, 0),
    futureWealth: Math.round(corpus),
    yearlyProjection,
  };
}
