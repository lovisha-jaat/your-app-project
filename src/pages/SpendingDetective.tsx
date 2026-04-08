import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["hsl(152,58%,48%)", "hsl(199,89%,56%)", "hsl(38,92%,50%)", "hsl(262,52%,55%)", "hsl(0,72%,59%)", "hsl(180,60%,50%)"];

export default function SpendingDetective() {
  const { transactions } = useTransactions();
  const { toast } = useToast();
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyExpenses = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return t.type === "expense" && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    }), [transactions, currentMonth, currentYear]);

  const lastMonthExpenses = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.transaction_date);
      const lm = currentMonth === 1 ? 12 : currentMonth - 1;
      const ly = currentMonth === 1 ? currentYear - 1 : currentYear;
      return t.type === "expense" && d.getMonth() + 1 === lm && d.getFullYear() === ly;
    }), [transactions, currentMonth, currentYear]);

  const totalThisMonth = monthlyExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalLastMonth = lastMonthExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const changePercent = totalLastMonth > 0 ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyExpenses.forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);

  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; amount: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const label = `W${4 - i}`;
      const amount = transactions
        .filter(t => {
          const d = new Date(t.transaction_date);
          return t.type === "expense" && d >= weekStart && d <= weekEnd;
        })
        .reduce((s, t) => s + Number(t.amount), 0);
      weeks.push({ week: label, amount });
    }
    return weeks;
  }, [transactions, now]);

  // Overspending detection
  const avgPerCategory = useMemo(() => {
    if (categoryBreakdown.length === 0) return 0;
    return totalThisMonth / categoryBreakdown.length;
  }, [totalThisMonth, categoryBreakdown]);

  const overspendingCategories = categoryBreakdown.filter(c => c.value > avgPerCategory * 1.5);

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spending-detective`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ transactions: transactions.slice(0, 100) }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        toast({ title: "Analysis failed", description: err.error || "Try again later", variant: "destructive" });
        setIsAnalyzing(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAiAnalysis(fullText);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not analyze spending", variant: "destructive" });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-4/10 via-transparent to-chart-2/10" />
        <div className="relative flex items-center gap-3">
          <Search className="w-6 h-6 text-chart-4" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Spending Detective</h1>
            <p className="text-sm text-muted-foreground">AI-powered expense analysis</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Month Comparison */}
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Monthly Comparison</p>
              {changePercent !== 0 && (
                <span className={`flex items-center gap-1 text-xs font-semibold ${changePercent > 0 ? "text-destructive" : "text-primary"}`}>
                  {changePercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(changePercent)}% {changePercent > 0 ? "more" : "less"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold tabular-nums">${totalThisMonth.toLocaleString()}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Last Month</p>
                <p className="text-lg font-bold tabular-nums">${totalLastMonth.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overspending Alerts */}
        {overspendingCategories.length > 0 && (
          <Card className="shadow-sm border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h2 className="text-sm font-semibold text-destructive">Overspending Alerts</h2>
              </div>
              <div className="space-y-2">
                {overspendingCategories.map(c => (
                  <div key={c.name} className="flex justify-between items-center text-xs">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-destructive font-semibold">${c.value.toLocaleString()} — {Math.round((c.value / totalThisMonth) * 100)}% of total</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-semibold mb-3">Expense Breakdown</h2>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value" strokeWidth={2}>
                        {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {categoryBreakdown.slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-semibold tabular-nums">${c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Trend */}
        {weeklyTrend.some(w => w.amount > 0) && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-semibold mb-3">Weekly Spending Trend</h2>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis */}
        <Card className="shadow-sm border-chart-4/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-chart-4" />
                <h2 className="text-sm font-semibold">AI Detective Analysis</h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={runAiAnalysis}
                disabled={isAnalyzing || transactions.length === 0}
                className="h-7 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            {aiAnalysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {transactions.length === 0
                  ? "Add some transactions first, then come back for AI insights!"
                  : "Click \"Analyze\" to get AI-powered insights on your spending habits."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="shadow-sm bg-accent/5">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-2">💡 Quick Tips</h2>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {categoryBreakdown[0] && (
                <p>📊 Your biggest spending category is <strong className="text-foreground">{categoryBreakdown[0].name}</strong> at ${categoryBreakdown[0].value.toLocaleString()}</p>
              )}
              {changePercent > 10 && <p>⚠️ Your spending increased by {changePercent}% compared to last month.</p>}
              {changePercent < -5 && <p>🎉 Great job! You reduced spending by {Math.abs(changePercent)}% this month.</p>}
              <p>🎯 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
