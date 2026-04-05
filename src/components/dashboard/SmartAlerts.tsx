import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Receipt, CheckCircle2 } from "lucide-react";
import { UserFinancialData, HealthScoreBreakdown } from "@/types/finance";
import { formatCurrency } from "@/lib/country-config";

interface SmartAlert {
  type: "warning" | "danger" | "info" | "success";
  title: string;
  message: string;
  icon: typeof AlertTriangle;
}

function generateAlerts(data: UserFinancialData, breakdown: HealthScoreBreakdown): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const { monthlyIncome, monthlyExpenses, currentSavings, country } = data;
  const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  const surplus = monthlyIncome - monthlyExpenses;
  const fmt = (n: number) => formatCurrency(Math.round(n), country);

  if (expenseRatio > 0.8) {
    alerts.push({
      type: "danger",
      title: "Overspending Alert",
      message: `You're spending ${Math.round(expenseRatio * 100)}% of your income. Try to keep expenses below 70% to build wealth faster.`,
      icon: AlertTriangle,
    });
  }

  if (breakdown.savings < 30) {
    alerts.push({
      type: "warning",
      title: "Low Savings Rate",
      message: `Your savings rate is below the recommended 20%. You're saving ${fmt(surplus)}/month — aim for ${fmt(monthlyIncome * 0.2)}.`,
      icon: TrendingDown,
    });
  }

  if (data.financialGoals && !data.financialGoals.includes("Pay Off Debt")) {
    alerts.push({
      type: "info",
      title: "Check Tax Benefits",
      message: "You may be missing out on tax deductions. Check the Tax Planner for country-specific savings.",
      icon: Receipt,
    });
  }

  if (breakdown.emergency < 50) {
    const needed = monthlyExpenses * 6 - currentSavings;
    alerts.push({
      type: "warning",
      title: "Emergency Fund Gap",
      message: `You need ${fmt(needed)} more to cover 6 months of expenses.`,
      icon: AlertTriangle,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      title: "Looking Good!",
      message: "No critical alerts. You're on track — keep up the great financial habits!",
      icon: CheckCircle2,
    });
  }

  return alerts;
}

const alertStyles: Record<SmartAlert["type"], { bg: string; border: string; iconColor: string }> = {
  danger: { bg: "bg-destructive/8", border: "border-destructive/30", iconColor: "text-destructive" },
  warning: { bg: "bg-accent/8", border: "border-accent/30", iconColor: "text-accent" },
  info: { bg: "bg-[hsl(var(--info))]/8", border: "border-[hsl(var(--info))]/30", iconColor: "text-[hsl(var(--info))]" },
  success: { bg: "bg-primary/8", border: "border-primary/30", iconColor: "text-primary" },
};

export default function SmartAlerts({ data, breakdown }: { data: UserFinancialData; breakdown: HealthScoreBreakdown }) {
  const alerts = generateAlerts(data, breakdown);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold px-1">Smart Alerts</h2>
      <div className="space-y-2.5">
        {alerts.map((alert, i) => {
          const style = alertStyles[alert.type];
          return (
            <Card key={i} className={`shadow-sm ${style.border} ${style.bg}`}>
              <CardContent className="p-3.5 flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <alert.icon className={`w-4.5 h-4.5 ${style.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-0.5">{alert.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
