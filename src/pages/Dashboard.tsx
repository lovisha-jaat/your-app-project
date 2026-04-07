import { useMemo, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useBadges } from "@/hooks/useBadges";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, Award, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["hsl(152,58%,48%)", "hsl(199,89%,56%)", "hsl(38,92%,50%)", "hsl(262,52%,55%)", "hsl(0,72%,59%)", "hsl(180,60%,50%)", "hsl(290,50%,55%)", "hsl(30,80%,55%)"];

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useSavingsGoals();
  const { badges, earnBadge } = useBadges();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    }), [transactions, currentMonth, currentYear]);

  const totalIncome = monthlyTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = monthlyTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTx.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthlyTx]);

  const monthlyBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  // Badge checks
  useEffect(() => {
    if (savingsRate >= 20 && !badges.find(b => b.badge_name === "smart_saver")) {
      earnBadge.mutate("smart_saver");
    }
    if (transactions.length >= 50 && !badges.find(b => b.badge_name === "expense_tracker")) {
      earnBadge.mutate("expense_tracker");
    }
    if (goals.length > 0 && !badges.find(b => b.badge_name === "first_goal")) {
      earnBadge.mutate("first_goal");
    }
    if (goals.some(g => Number(g.current_amount) >= Number(g.target_amount)) && !badges.find(b => b.badge_name === "goal_reached")) {
      earnBadge.mutate("goal_reached");
    }
  }, [savingsRate, transactions.length, goals, badges]);

  // Last 6 months trend
  const monthlyTrend = useMemo(() => {
    const months: { month: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = d.toLocaleString("default", { month: "short" });
      const inc = transactions.filter(t => { const td = new Date(t.transaction_date); return t.type === "income" && td.getMonth() + 1 === m && td.getFullYear() === y; }).reduce((s, t) => s + Number(t.amount), 0);
      const exp = transactions.filter(t => { const td = new Date(t.transaction_date); return t.type === "expense" && td.getMonth() + 1 === m && td.getFullYear() === y; }).reduce((s, t) => s + Number(t.amount), 0);
      months.push({ month: label, income: inc, expenses: exp });
    }
    return months;
  }, [transactions, currentMonth, currentYear]);

  const tips = useMemo(() => {
    const t: string[] = [];
    if (savingsRate < 10) t.push("💡 Try to save at least 20% of your income this month.");
    if (expenseByCategory[0]) t.push(`📊 Your biggest expense is ${expenseByCategory[0].name} — consider cutting back here.`);
    const overBudget = monthlyBudgets.filter(b => {
      const spent = monthlyTx.filter(t => t.type === "expense" && t.category === b.category).reduce((s, t) => s + Number(t.amount), 0);
      return spent > Number(b.amount);
    });
    if (overBudget.length > 0) t.push(`⚠️ You've exceeded your budget in ${overBudget.map(b => b.category).join(", ")}.`);
    if (goals.length === 0) t.push("🎯 Set a savings goal to stay motivated!");
    if (t.length === 0) t.push("🎉 You're doing great! Keep tracking your expenses.");
    return t;
  }, [savingsRate, expenseByCategory, monthlyBudgets, monthlyTx, goals]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative">
          <p className="text-sm text-muted-foreground">Hey {displayName} 👋</p>
          <h1 className="text-xl font-bold tracking-tight">Your Finance Dashboard</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Balance Card */}
        <Card className="shadow-lg border-border/40 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm text-muted-foreground mb-1">This Month's Balance</p>
            <p className={`text-3xl font-extrabold tabular-nums ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
              ${Math.abs(balance).toLocaleString()}
              <span className="text-base font-normal ml-1">{balance >= 0 ? "surplus" : "deficit"}</span>
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-sm font-bold tabular-nums text-primary">${totalIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-sm font-bold tabular-nums text-destructive">${totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <PiggyBank className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Saved</p>
              <p className="text-sm font-bold tabular-nums">{savingsRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        {monthlyBudgets.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-chart-2" />
                <h2 className="text-sm font-semibold">Budget Usage</h2>
              </div>
              <div className="space-y-3">
                {monthlyBudgets.map(b => {
                  const spent = monthlyTx.filter(t => t.type === "expense" && t.category === b.category).reduce((s, t) => s + Number(t.amount), 0);
                  const pct = Math.min(Math.round((spent / Number(b.amount)) * 100), 100);
                  const over = spent > Number(b.amount);
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{b.category}</span>
                        <span className={over ? "text-destructive font-semibold" : "text-muted-foreground"}>
                          ${spent.toLocaleString()} / ${Number(b.amount).toLocaleString()}
                          {over && " ⚠️"}
                        </span>
                      </div>
                      <Progress value={pct} className={`h-2 ${over ? "[&>div]:bg-destructive" : ""}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Pie Chart */}
        {expenseByCategory.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-semibold mb-3">Spending Breakdown</h2>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={2}>
                        {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {expenseByCategory.slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-semibold tabular-nums">${c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trend */}
        {monthlyTrend.some(m => m.income > 0 || m.expenses > 0) && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-semibold mb-3">Monthly Trends</h2>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} barGap={2}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="income" fill="hsl(152,58%,48%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(0,72%,59%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Savings Goals */}
        {goals.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Savings Goals</h2>
              </div>
              <div className="space-y-3">
                {goals.slice(0, 3).map(g => {
                  const pct = Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100);
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-muted-foreground">${Number(g.current_amount).toLocaleString()} / ${Number(g.target_amount).toLocaleString()}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-chart-4" />
                <h2 className="text-sm font-semibold">Your Badges</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-medium">
                    {b.badge_name === "smart_saver" ? "🐷" : b.badge_name === "budget_master" ? "🎯" : b.badge_name === "consistent_tracker" ? "📊" : b.badge_name === "first_goal" ? "⭐" : b.badge_name === "goal_reached" ? "🏆" : "📝"}
                    {b.badge_name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="shadow-sm border-border/60 bg-accent/5">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-2">💡 Smart Tips</h2>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
