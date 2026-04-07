import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBadges } from "@/hooks/useBadges";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogOut, User, Award, TrendingUp, TrendingDown, Download } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/types/finance";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { transactions } = useTransactions();
  const { badges } = useBadges();
  const { goals } = useSavingsGoals();
  const navigate = useNavigate();

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const exportCSV = () => {
    if (transactions.length === 0) { toast.error("No data to export"); return; }
    const headers = "Date,Type,Category,Amount,Notes\n";
    const rows = transactions.map(t =>
      `${t.transaction_date},${t.type},${t.category},${t.amount},"${(t.description || "").replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* User Info */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total Income</p>
              <p className="text-sm font-bold text-primary">${totalIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-sm font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Award className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Badges</p>
              <p className="text-sm font-bold">{badges.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-chart-4" /> Achievements
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
                const earned = badges.some(b => b.badge_name === key);
                return (
                  <div key={key} className={`p-3 rounded-lg border text-center ${earned ? "border-accent/30 bg-accent/5" : "border-border/40 opacity-40"}`}>
                    <p className="text-2xl mb-1">{def.icon}</p>
                    <p className="text-xs font-semibold">{def.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{def.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Button variant="outline" className="w-full" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export Transactions (CSV)
        </Button>

        {/* Sign Out */}
        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
