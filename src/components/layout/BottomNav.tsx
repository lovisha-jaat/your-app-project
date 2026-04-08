import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Brain, User, MoreHorizontal, Flame, CreditCard, CalendarDays, Layers, Trophy, Users, Search, PiggyBank, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const MAIN_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/transactions", label: "Add", icon: PlusCircle },
  { to: "/money-coach", label: "Coach", icon: Brain },
  { to: "/streaks", label: "Streaks", icon: Flame },
];

const MORE_NAV = [
  { to: "/detective", label: "Spending Detective", icon: Search },
  { to: "/saving-plan", label: "Saving Plan", icon: CalendarDays },
  { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/budgets", label: "Budgets", icon: BarChart3 },
  { to: "/goals", label: "Savings Goals", icon: PiggyBank },
  { to: "/lifestyle", label: "Lifestyle Simulator", icon: Layers },
  { to: "/achievements", label: "Achievement Report", icon: Trophy },
  { to: "/peers", label: "Peer Comparison", icon: Users },
  { to: "/profile", label: "Profile & Settings", icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const moreActive = MORE_NAV.some(n => location.pathname === n.to);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 z-50">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {MAIN_NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors active:scale-95",
                moreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className={cn("w-5 h-5", moreActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader>
              <SheetTitle className="text-left">More Features</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {MORE_NAV.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:shadow-sm active:scale-[0.97]",
                      active ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
