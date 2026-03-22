import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import { calculateFireProjection } from "@/lib/financial-calculations";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Banknote, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function FirePlanner() {
  const { userData, isOnboarded } = useUserData();

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const projection = calculateFireProjection(userData);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const stats = [
    {
      label: "FIRE Age",
      value: projection.estimatedRetirementAge,
      sub: `${projection.estimatedRetirementAge - userData.age} years from now`,
      icon: Calendar,
      color: "hsl(var(--chart-1))",
    },
    {
      label: "Monthly SIP Needed",
      value: formatCurrency(projection.monthlySIPRequired),
      sub: "to retire by 60",
      icon: Banknote,
      color: "hsl(var(--chart-2))",
    },
    {
      label: "Projected Wealth",
      value: formatCurrency(projection.futureWealth),
      sub: "at FIRE target",
      icon: TrendingUp,
      color: "hsl(var(--chart-3))",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">FIRE Planner</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Financial Independence, Retire Early</p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Stats */}
        <div className="space-y-3">
          {stats.map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-4">Wealth Growth Projection</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.yearlyProjection} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      if (v >= 10000000) return `${(v / 10000000).toFixed(0)}Cr`;
                      if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
                      return `${(v / 1000).toFixed(0)}K`;
                    }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    formatter={(val: number, name: string) => [formatCurrency(val), name === "wealth" ? "Total Wealth" : "Amount Invested"]}
                    labelFormatter={(label) => `Age ${label}`}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#investedGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="wealth"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#wealthGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
                <span className="text-xs text-muted-foreground">Total Wealth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                <span className="text-xs text-muted-foreground">Invested</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FIRE explanation */}
        <Card className="shadow-sm bg-accent/5 border-accent/10">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1">What is FIRE?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              FIRE stands for Financial Independence, Retire Early. The goal is to save and invest aggressively so your
              investments generate enough passive income to cover your living expenses — freeing you from the need to work.
              The target is typically 25× your annual expenses (the 4% rule).
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
