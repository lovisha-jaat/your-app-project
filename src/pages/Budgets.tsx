import { useState } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/types/finance";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Budgets() {
  const { budgets, setBudget, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid budget amount"); return; }
    if (!category) { toast.error("Select a category"); return; }

    setBudget.mutate(
      { category, amount: amt, month: currentMonth, year: currentYear },
      {
        onSuccess: () => { toast.success("Budget set! 🎯"); setAmount(""); setCategory(""); },
        onError: () => toast.error("Failed to set budget"),
      }
    );
  };

  const getSpent = (cat: string) =>
    transactions
      .filter(t => {
        const d = new Date(t.transaction_date);
        return t.type === "expense" && t.category === cat && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, t) => s + Number(t.amount), 0);

  const totalBudget = monthlyBudgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = monthlyBudgets.reduce((s, b) => s + getSpent(b.category), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">Budget Manager</h1>
        <p className="text-sm text-muted-foreground">Set monthly spending limits by category</p>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Overview */}
        {monthlyBudgets.length > 0 && (
          <Card className="shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Total Budget This Month</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-extrabold">${totalSpent.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ ${totalBudget.toLocaleString()}</span>
              </div>
              <Progress value={Math.min(Math.round((totalSpent / totalBudget) * 100), 100)} className={`h-2 ${totalSpent > totalBudget ? "[&>div]:bg-destructive" : ""}`} />
            </CardContent>
          </Card>
        )}

        {/* Add Budget */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4 space-y-3">
            <h2 className="text-sm font-semibold">Set a Budget</h2>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="flex-1 h-10"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="$0" value={amount} onChange={e => setAmount(e.target.value)} className="w-28 h-10" />
              <Button onClick={handleAdd} size="icon" className="h-10 w-10 shrink-0" disabled={setBudget.isPending}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Budget List */}
        <div className="space-y-2.5">
          {monthlyBudgets.map(b => {
            const spent = getSpent(b.category);
            const pct = Math.min(Math.round((spent / Number(b.amount)) * 100), 100);
            const over = spent > Number(b.amount);
            return (
              <Card key={b.id} className={`shadow-sm ${over ? "border-destructive/30" : ""}`}>
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {over && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      <span className="text-sm font-medium">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold tabular-nums ${over ? "text-destructive" : "text-muted-foreground"}`}>
                        ${spent.toLocaleString()} / ${Number(b.amount).toLocaleString()}
                      </span>
                      <button onClick={() => deleteBudget.mutate(b.id)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <Progress value={pct} className={`h-2 ${over ? "[&>div]:bg-destructive" : ""}`} />
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% used · ${Math.max(Number(b.amount) - spent, 0).toLocaleString()} remaining</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {monthlyBudgets.length === 0 && (
          <Card className="shadow-sm"><CardContent className="p-8 text-center text-muted-foreground text-sm">No budgets set yet. Add one above to start tracking!</CardContent></Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
