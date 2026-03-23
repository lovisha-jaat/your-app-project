import { useState, useMemo } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, Calendar, TrendingUp, Wallet } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

function simulateProjection(
  currentCorpus: number,
  monthlyInvestment: number,
  age: number,
  annualExpenses: number
) {
  const fireTarget = annualExpenses * 25;
  const monthlyReturn = 0.12 / 12;
  let corpus = currentCorpus;
  let years = 0;
  const data: { year: number; wealth: number; fireTarget: number }[] = [];

  data.push({ year: age, wealth: Math.round(corpus), fireTarget });

  while (corpus < fireTarget && years < 50) {
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyReturn) + monthlyInvestment;
    }
    years++;
    data.push({ year: age + years, wealth: Math.round(corpus), fireTarget });
  }

  // Add a few more years beyond FIRE for context
  for (let extra = 0; extra < 5 && years + extra < 55; extra++) {
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyReturn) + monthlyInvestment;
    }
    data.push({ year: age + years + extra + 1, wealth: Math.round(corpus), fireTarget });
  }

  return { retirementAge: Math.min(age + years, age + 50), data, fireTarget };
}

export default function WhatIfSimulator() {
  const { userData, isOnboarded } = useUserData();

  const baseIncome = userData?.monthlyIncome ?? 0;
  const [expenses, setExpenses] = useState(userData?.monthlyExpenses ?? 0);
  const [savingsPercent, setSavingsPercent] = useState(
    baseIncome > 0 ? Math.round(((baseIncome - (userData?.monthlyExpenses ?? 0)) / baseIncome) * 100) : 20
  );

  const monthlySavings = Math.round(baseIncome * (savingsPercent / 100));
  const monthlyInvestment = Math.round(monthlySavings * 0.5);
  const currentCorpus = (userData?.currentSavings ?? 0) + (userData?.investments ?? 0);
  const age = userData?.age ?? 25;

  const projection = useMemo(
    () => simulateProjection(currentCorpus, monthlyInvestment, age, expenses * 12),
    [currentCorpus, monthlyInvestment, age, expenses]
  );

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const yearsToFire = projection.retirementAge - userData.age;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">What-If Simulator</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Adjust the sliders and watch your future change
        </p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Controls */}
        <Card className="shadow-md">
          <CardContent className="p-5 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium">Savings Rate</label>
                <span className="text-lg font-bold text-primary tabular-nums">{savingsPercent}%</span>
              </div>
              <Slider
                value={[savingsPercent]}
                onValueChange={([v]) => setSavingsPercent(v)}
                min={5}
                max={80}
                step={1}
                className="py-1"
              />
              <p className="text-xs text-muted-foreground">
                Saving ₹{monthlySavings.toLocaleString("en-IN")}/mo → investing ₹{monthlyInvestment.toLocaleString("en-IN")}/mo
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium">Monthly Expenses</label>
                <span className="text-lg font-bold tabular-nums">₹{expenses.toLocaleString("en-IN")}</span>
              </div>
              <Slider
                value={[expenses]}
                onValueChange={([v]) => setExpenses(v)}
                min={5000}
                max={Math.round(baseIncome * 0.9)}
                step={1000}
                className="py-1"
              />
              <p className="text-xs text-muted-foreground">
                FIRE target: {formatCurrency(projection.fireTarget)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "FIRE Age", value: `${projection.retirementAge}`, icon: Calendar, color: "hsl(var(--chart-1))" },
            { label: "Years Left", value: `${yearsToFire}y`, icon: TrendingUp, color: "hsl(var(--chart-2))" },
            { label: "Final Wealth", value: formatCurrency(projection.data[projection.data.length - 1]?.wealth || 0), icon: Wallet, color: "hsl(var(--chart-3))" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="shadow-sm">
              <CardContent className="p-3 text-center">
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                <p className="text-lg font-bold tabular-nums">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-4">Projected Wealth Over Time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => {
                      if (v >= 10000000) return `${(v / 10000000).toFixed(0)}Cr`;
                      if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
                      return `${(v / 1000).toFixed(0)}K`;
                    }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    formatter={(val: number, name: string) => [formatCurrency(val), name === "wealth" ? "Wealth" : "FIRE Target"]}
                    labelFormatter={(l) => `Age ${l}`}
                    contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                  />
                  <ReferenceLine
                    y={projection.fireTarget}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{ value: "FIRE Target", position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Area type="monotone" dataKey="wealth" stroke="hsl(var(--chart-1))" fill="url(#simGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
