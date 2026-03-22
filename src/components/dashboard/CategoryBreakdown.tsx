import { HealthScoreBreakdown } from "@/types/finance";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, PiggyBank, CreditCard, TrendingUp, Landmark } from "lucide-react";
import { getScoreColor } from "@/lib/financial-calculations";

const CATEGORIES = [
  { key: "emergency" as const, label: "Emergency Fund", icon: ShieldCheck },
  { key: "savings" as const, label: "Savings Rate", icon: PiggyBank },
  { key: "debt" as const, label: "Expense Control", icon: CreditCard },
  { key: "investments" as const, label: "Investments", icon: TrendingUp },
  { key: "retirement" as const, label: "Retirement", icon: Landmark },
];

export default function CategoryBreakdown({ breakdown }: { breakdown: HealthScoreBreakdown }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold px-1">Score Breakdown</h2>
      <div className="grid gap-2.5">
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const val = breakdown[key];
          const color = getScoreColor(val);
          return (
            <Card key={key} className="shadow-sm border-border/60">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>{val}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${val}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
