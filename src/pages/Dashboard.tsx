import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import { calculateHealthScore, generateInsights } from "@/lib/financial-calculations";
import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import InsightsSection from "@/components/dashboard/InsightsSection";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";

export default function Dashboard() {
  const { userData, isOnboarded } = useUserData();

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const { total, breakdown } = calculateHealthScore(userData);
  const insights = generateInsights(userData, breakdown);
  const surplus = userData.monthlyIncome - userData.monthlyExpenses;
  const netWorth = userData.currentSavings + userData.investments;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with gradient accent */}
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative">
          <p className="text-sm text-muted-foreground">Welcome back 👋</p>
          <h1 className="text-xl font-bold tracking-tight">Your Money Health</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Score Ring */}
        <Card className="shadow-lg border-border/40">
          <CardContent className="pt-6 pb-5 flex flex-col items-center relative">
            <HealthScoreRing score={total} />
            <p className="text-sm text-muted-foreground mt-3 font-medium">Money Health Score</p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Monthly Surplus</p>
              </div>
              <p className={`text-lg font-bold tabular-nums ${surplus >= 0 ? "text-primary" : "text-destructive"}`}>
                ₹{surplus.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {userData.monthlyIncome > 0 ? `${Math.round((surplus / userData.monthlyIncome) * 100)}% of income` : ""}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground">Net Worth</p>
              </div>
              <p className="text-lg font-bold tabular-nums">
                ₹{netWorth.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Savings + Investments
              </p>
            </CardContent>
          </Card>
        </div>

        <SmartAlerts data={userData} breakdown={breakdown} />
        <CategoryBreakdown breakdown={breakdown} />
        <InsightsSection insights={insights} />
      </div>

      <BottomNav />
    </div>
  );
}
