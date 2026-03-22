import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import { calculateHealthScore, generateInsights } from "@/lib/financial-calculations";
import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import InsightsSection from "@/components/dashboard/InsightsSection";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { userData, isOnboarded } = useUserData();

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const { total, breakdown } = calculateHealthScore(userData);
  const insights = generateInsights(userData, breakdown);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <p className="text-sm text-muted-foreground">Welcome back 👋</p>
        <h1 className="text-xl font-bold tracking-tight">Your Money Health</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Score Ring */}
        <Card className="shadow-md">
          <CardContent className="pt-6 pb-5 flex flex-col items-center relative">
            <HealthScoreRing score={total} />
            <p className="text-sm text-muted-foreground mt-3">Money Health Score</p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3.5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly Surplus</p>
              <p className="text-lg font-bold text-primary tabular-nums">
                ₹{(userData.monthlyIncome - userData.monthlyExpenses).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3.5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
              <p className="text-lg font-bold tabular-nums">
                ₹{(userData.currentSavings + userData.investments).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
        </div>

        <CategoryBreakdown breakdown={breakdown} />
        <InsightsSection insights={insights} />
      </div>

      <BottomNav />
    </div>
  );
}
