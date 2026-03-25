import { useUserData } from "@/context/UserDataContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, User, LogOut } from "lucide-react";

export default function Settings() {
  const { userData, resetData } = useUserData();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleReset = () => {
    resetData();
    navigate("/");
  };

  const handleSignOut = async () => {
    resetData();
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {userData && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your Profile</p>
                  <p className="text-xs text-muted-foreground">Age {userData.age} · ₹{userData.monthlyIncome.toLocaleString("en-IN")}/mo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="font-semibold tabular-nums">₹{userData.currentSavings.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="text-xs text-muted-foreground">Investments</p>
                  <p className="font-semibold tabular-nums">₹{userData.investments.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button variant="destructive" className="w-full active:scale-[0.98] transition-transform" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset & Start Over
        </Button>

        <Button variant="outline" className="w-full active:scale-[0.98] transition-transform" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {user && (
          <p className="text-xs text-muted-foreground text-center">
            Signed in as {user.email}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
