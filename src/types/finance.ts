export const EXPENSE_CATEGORIES = [
  "Food & Drinks",
  "Transport",
  "Shopping",
  "Education",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Allowance",
  "Part-time Job",
  "Freelance",
  "Scholarship",
  "Gift",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_name: string;
  earned_at: string;
}

export const BADGE_DEFINITIONS: Record<string, { name: string; description: string; icon: string }> = {
  smart_saver: { name: "Smart Saver", description: "Saved 20% of income in a month", icon: "🐷" },
  budget_master: { name: "Budget Master", description: "Stayed within all budgets for a month", icon: "🎯" },
  consistent_tracker: { name: "Consistent Tracker", description: "Logged transactions for 7 days straight", icon: "📊" },
  first_goal: { name: "Goal Setter", description: "Created your first savings goal", icon: "⭐" },
  goal_reached: { name: "Goal Crusher", description: "Reached a savings goal", icon: "🏆" },
  expense_tracker: { name: "Expense Tracker", description: "Logged 50 transactions", icon: "📝" },
};
