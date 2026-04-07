import { useState } from "react";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, PiggyBank, Target } from "lucide-react";
import { toast } from "sonner";

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});

  const handleCreate = () => {
    if (!name.trim()) { toast.error("Enter a goal name"); return; }
    const amt = parseFloat(target);
    if (!amt || amt <= 0) { toast.error("Enter a valid target amount"); return; }

    addGoal.mutate(
      { name: name.trim(), target_amount: amt, deadline: deadline || undefined },
      {
        onSuccess: () => { toast.success("Goal created! 🎯"); setName(""); setTarget(""); setDeadline(""); },
        onError: () => toast.error("Failed to create goal"),
      }
    );
  };

  const handleAddMoney = (id: string, currentAmount: number) => {
    const add = parseFloat(addAmounts[id] || "0");
    if (!add || add <= 0) { toast.error("Enter an amount to add"); return; }
    updateGoal.mutate(
      { id, current_amount: currentAmount + add },
      {
        onSuccess: () => { toast.success("Money added! 💰"); setAddAmounts(prev => ({ ...prev, [id]: "" })); },
        onError: () => toast.error("Failed to update goal"),
      }
    );
  };

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">Savings Goals</h1>
        <p className="text-sm text-muted-foreground">Save for the things that matter to you</p>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Overview */}
        {goals.length > 0 && (
          <Card className="shadow-sm bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-accent" />
                <p className="text-sm font-semibold">Total Savings Progress</p>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-extrabold">${totalSaved.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ ${totalTarget.toLocaleString()}</span>
              </div>
              <Progress value={totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Create Goal */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4 space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Create a Goal
            </h2>
            <Input placeholder="Goal name (e.g., New Laptop)" value={name} onChange={e => setName(e.target.value)} className="h-10" />
            <div className="flex gap-2">
              <Input type="number" placeholder="Target ($)" value={target} onChange={e => setTarget(e.target.value)} className="flex-1 h-10" />
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="flex-1 h-10" />
            </div>
            <Button onClick={handleCreate} className="w-full h-10" disabled={addGoal.isPending}>
              <Plus className="w-4 h-4 mr-1.5" /> Create Goal
            </Button>
          </CardContent>
        </Card>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map(g => {
            const pct = Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100);
            const reached = pct >= 100;
            return (
              <Card key={g.id} className={`shadow-sm ${reached ? "border-primary/30 bg-primary/5" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{g.name} {reached && "🎉"}</p>
                      {g.deadline && <p className="text-[10px] text-muted-foreground">Due: {new Date(g.deadline).toLocaleDateString()}</p>}
                    </div>
                    <button onClick={() => deleteGoal.mutate(g.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className="text-lg font-bold tabular-nums">${Number(g.current_amount).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">/ ${Number(g.target_amount).toLocaleString()} ({pct}%)</span>
                  </div>
                  <Progress value={pct} className="h-2 mb-3" />
                  {!reached && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Add $"
                        value={addAmounts[g.id] || ""}
                        onChange={e => setAddAmounts(prev => ({ ...prev, [g.id]: e.target.value }))}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button size="sm" onClick={() => handleAddMoney(g.id, Number(g.current_amount))} className="h-9" disabled={updateGoal.isPending}>
                        + Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <Card className="shadow-sm"><CardContent className="p-8 text-center text-muted-foreground text-sm">No goals yet. Create one to start saving!</CardContent></Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
