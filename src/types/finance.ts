export interface UserFinancialData {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  investments: number;
  financialGoals: string[];
}

export interface HealthScoreBreakdown {
  emergency: number;
  savings: number;
  debt: number;
  investments: number;
  retirement: number;
}

export interface FireProjection {
  estimatedRetirementAge: number;
  monthlySIPRequired: number;
  futureWealth: number;
  yearlyProjection: { year: number; wealth: number; invested: number }[];
}

export const FINANCIAL_GOALS = [
  "Build Emergency Fund",
  "Save for House",
  "Pay Off Debt",
  "Retire Early",
  "Children's Education",
  "Wealth Building",
  "Travel Fund",
  "Start a Business",
] as const;
