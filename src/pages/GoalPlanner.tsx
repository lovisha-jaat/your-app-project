import { useState } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Trash2, Calendar, Banknote, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatCurrencyCompact, COUNTRIES } from "@/lib/country-config";

interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  timelineYears: number;
  currentSaved: number;
}

const GOAL_PRESETS = [
  { name: "Buy a Car", icon: "🚗", defaultAmount: 30000, defaultYears: 3 },
  { name: "Buy a House", icon: "🏠", defaultAmount: 200000, defaultYears: 10 },
  { name: "Travel Fund", icon: "✈️", defaultAmount: 10000, defaultYears: 2 },
  { name: "Wedding", icon: "💍", defaultAmount: 50000, defaultYears: 3 },
  { name: "Education", icon: "🎓", defaultAmount: 80000, defaultYears: 5 },
  { name: "Emergency Fund", icon: "🛡️", defaultAmount: 20000, defaultYears: 1 },
  { name: "Custom Goal", icon: "🎯", defaultAmount: 10000, defaultYears: 3 },
];

function calcMonthlyInvestment(target: number, currentSaved: number, years: number, annualReturn = 0.12): number {
  const remaining = Math.max(target - currentSaved * Math.pow(1 + annualReturn, years), 0);
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  if (months === 0) return remaining;
  const factor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return Math.round(remaining / factor);
}

export default function GoalPlanner() {
  const { userData, isOnboarded } = useUserData();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", timelineYears: "", currentSaved: "0", icon: "🎯" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const country = userData.country;
  const cc = COUNTRIES[country];
  const fmt = (n: number) => formatCurrency(n, country);
  const fmtC = (n: number) => formatCurrencyCompact(n, country);

  const handlePresetSelect = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = GOAL_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setNewGoal({
        name: preset.name === "Custom Goal" ? "" : preset.name,
        targetAmount: String(preset.defaultAmount),
        timelineYears: String(preset.defaultYears),
        currentSaved: "0",
        icon: preset.icon,
      });
    }
  };

  const validateAndAdd = () => {
    const errs: Record<string, string> = {};
    if (!newGoal.name.trim()) errs.name = "Give your goal a name";
    const amt = parseFloat(newGoal.targetAmount);
    if (!amt || amt <= 0) errs.targetAmount = "Enter a valid amount";
    const yrs = parseFloat(newGoal.timelineYears);
    if (!yrs || yrs <= 0 || yrs > 40) errs.timelineYears = "Enter 1–40 years";
    const saved = parseFloat(newGoal.currentSaved) || 0;
    if (saved < 0) errs.currentSaved = "Can't be negative";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setGoals((prev) => [...prev, { id: crypto.randomUUID(), name: newGoal.name.trim(), icon: newGoal.icon, targetAmount: amt, timelineYears: yrs, currentSaved: saved }]);
    setNewGoal({ name: "", targetAmount: "", timelineYears: "", currentSaved: "0", icon: "🎯" });
    setSelectedPreset("");
    setShowAdd(false);
  };

  const removeGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));

  const totalMonthly = goals.reduce((sum, g) => sum + calcMonthlyInvestment(g.targetAmount, g.currentSaved, g.timelineYears), 0);
  const surplus = userData.monthlyIncome - userData.monthlyExpenses;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-chart-3" />
          <h1 className="text-xl font-bold tracking-tight">Goal Planner</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Plan and track your financial goals</p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {goals.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-sm">
              <CardContent className="p-3.5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Monthly Investment Needed</p>
                <p className="text-lg font-bold text-primary tabular-nums">{fmt(totalMonthly)}/mo</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-3.5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Surplus Available</p>
                <p className={`text-lg font-bold tabular-nums ${surplus >= totalMonthly ? "text-primary" : "text-destructive"}`}>{fmt(surplus)}/mo</p>
              </CardContent>
            </Card>
          </div>
        )}

        {goals.map((goal) => {
          const monthly = calcMonthlyInvestment(goal.targetAmount, goal.currentSaved, goal.timelineYears);
          const progressPct = Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100);
          const targetDate = new Date();
          targetDate.setFullYear(targetDate.getFullYear() + goal.timelineYears);

          return (
            <Card key={goal.id} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">{fmt(goal.targetAmount)} target</p>
                    </div>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors active:scale-95">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Saved {fmt(goal.currentSaved)}</span>
                    <span className="font-medium">{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Banknote className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                    <p className="text-xs font-bold tabular-nums">{fmtC(monthly)}</p>
                    <p className="text-[10px] text-muted-foreground">Monthly</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Calendar className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                    <p className="text-xs font-bold tabular-nums">{goal.timelineYears}yr</p>
                    <p className="text-[10px] text-muted-foreground">Timeline</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <TrendingUp className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                    <p className="text-xs font-bold tabular-nums">
                      {targetDate.toLocaleDateString(cc.currency.locale, { month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && !showAdd && (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <span className="text-4xl block mb-3">🎯</span>
              <p className="font-semibold mb-1">No goals yet</p>
              <p className="text-sm text-muted-foreground mb-4">Add your first financial goal to get started</p>
              <Button onClick={() => setShowAdd(true)} className="active:scale-[0.98] transition-transform">
                <Plus className="w-4 h-4 mr-1" /> Add a Goal
              </Button>
            </CardContent>
          </Card>
        )}

        {showAdd && (
          <Card className="shadow-md ring-1 ring-primary/20">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-base font-semibold">New Goal</h2>
              <div>
                <Label className="text-sm mb-1.5 block">Choose a goal type</Label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_PRESETS.map((p) => (
                    <Badge key={p.name} variant={selectedPreset === p.name ? "default" : "outline"} className={`cursor-pointer py-2 px-3 text-xs active:scale-95 transition-all ${selectedPreset === p.name ? "bg-primary text-primary-foreground" : ""}`} onClick={() => handlePresetSelect(p.name)}>
                      {p.icon} {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Goal Name</Label>
                <Input value={newGoal.name} onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Dream Vacation" className="h-11" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Target Amount ({cc.currency.symbol})</Label>
                <Input type="number" inputMode="numeric" value={newGoal.targetAmount} onChange={(e) => setNewGoal((p) => ({ ...p, targetAmount: e.target.value }))} placeholder="e.g. 50000" className="h-11" />
                {errors.targetAmount && <p className="text-xs text-destructive mt-1">{errors.targetAmount}</p>}
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Timeline (years)</Label>
                <Input type="number" inputMode="numeric" value={newGoal.timelineYears} onChange={(e) => setNewGoal((p) => ({ ...p, timelineYears: e.target.value }))} placeholder="e.g. 3" className="h-11" />
                {errors.timelineYears && <p className="text-xs text-destructive mt-1">{errors.timelineYears}</p>}
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Already Saved ({cc.currency.symbol})</Label>
                <Input type="number" inputMode="numeric" value={newGoal.currentSaved} onChange={(e) => setNewGoal((p) => ({ ...p, currentSaved: e.target.value }))} placeholder="0" className="h-11" />
                {errors.currentSaved && <p className="text-xs text-destructive mt-1">{errors.currentSaved}</p>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 active:scale-[0.98] transition-transform" onClick={() => { setShowAdd(false); setErrors({}); }}>Cancel</Button>
                <Button className="flex-1 active:scale-[0.98] transition-transform" onClick={validateAndAdd}>Add Goal</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {goals.length > 0 && !showAdd && (
          <Button variant="outline" className="w-full h-11 active:scale-[0.98] transition-transform" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Another Goal
          </Button>
        )}

        {goals.length > 0 && (
          <Card className={`shadow-sm ${totalMonthly <= surplus ? "bg-primary/5 border-primary/15" : "bg-destructive/5 border-destructive/15"}`}>
            <CardContent className="p-4">
              <p className="text-sm font-medium">
                {totalMonthly <= surplus
                  ? "✅ Your goals are achievable with your current surplus!"
                  : `⚠️ You need ${fmt(totalMonthly - surplus)}/mo more to hit all goals. Consider extending timelines or increasing income.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
