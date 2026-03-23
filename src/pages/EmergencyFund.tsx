import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, CheckCircle2, Target } from "lucide-react";

export default function EmergencyFund() {
  const { userData, isOnboarded } = useUserData();

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const requiredFund = userData.monthlyExpenses * 6;
  const currentFund = userData.currentSavings;
  const gap = Math.max(requiredFund - currentFund, 0);
  const coverageMonths = userData.monthlyExpenses > 0 ? currentFund / userData.monthlyExpenses : 0;
  const progress = Math.min((currentFund / requiredFund) * 100, 100);
  const surplus = userData.monthlyIncome - userData.monthlyExpenses;
  const monthsToFill = surplus > 0 ? Math.ceil(gap / surplus) : Infinity;

  const isFullyCovered = gap === 0;

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Emergency Fund</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Your financial safety net</p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Visual progress */}
        <Card className="shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-medium">Fund Progress</p>
              <p className="text-sm font-bold tabular-nums text-primary">{Math.round(progress)}%</p>
            </div>

            {/* Circular progress ring */}
            <div className="flex justify-center py-4">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={isFullyCovered ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums">{coverageMonths.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">months covered</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              {isFullyCovered ? (
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Fully funded! You're protected.</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-accent">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {coverageMonths < 3 ? "Critically low coverage" : "Building up — keep going!"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3.5 text-center">
              <Target className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-0.5">Required (6 mo)</p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(requiredFund)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3.5 text-center">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1.5 text-primary" />
              <p className="text-xs text-muted-foreground mb-0.5">Current Savings</p>
              <p className="text-lg font-bold tabular-nums text-primary">{formatCurrency(currentFund)}</p>
            </CardContent>
          </Card>
        </div>

        {!isFullyCovered && (
          <>
            {/* Gap card */}
            <Card className="shadow-sm border-accent/20 bg-accent/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium">Funding Gap</p>
                  <p className="text-lg font-bold tabular-nums text-accent">{formatCurrency(gap)}</p>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "hsl(var(--chart-1))",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(currentFund)} saved of {formatCurrency(requiredFund)} target
                </p>
              </CardContent>
            </Card>

            {/* How to fill it */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold">How to fill the gap</p>
                {surplus > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-sm text-foreground/80">
                      With your monthly surplus of <span className="font-semibold text-primary">{formatCurrency(surplus)}</span>,
                      you can fill the gap in <span className="font-semibold">{monthsToFill} months</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Save {formatCurrency(surplus)}/month → fully funded by month {monthsToFill}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/80">
                    Your expenses currently exceed your income. Focus on reducing expenses or increasing income first.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Tips */}
        <Card className="shadow-sm bg-primary/5 border-primary/10">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1.5">💡 Why 6 months?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Financial experts recommend having 3–6 months of living expenses in an easily accessible account.
              This protects you from job loss, medical emergencies, or unexpected repairs without going into debt.
              Keep this in a high-yield savings account or liquid mutual fund.
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
