import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Flame, Receipt, Target, Settings, SlidersHorizontal, Brain, ShieldCheck, MoreHorizontal, MessageCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const PRIMARY_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fire", label: "FIRE", icon: Flame },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/goals", label: "Goals", icon: Target },
];

const MORE_ITEMS = [
  { to: "/tax", label: "Tax", icon: Receipt },
  { to: "/simulator", label: "Simulator", icon: SlidersHorizontal },
  { to: "/personality", label: "Personality", icon: Brain },
  { to: "/emergency", label: "Emergency", icon: ShieldCheck },
  { to: "/guide", label: "Guide", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMoreActive = MORE_ITEMS.some((item) => location.pathname === item.to);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 z-50">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {PRIMARY_ITEMS.map(({ to, label, icon: Icon }) => {
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

        {/* More button */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors active:scale-95",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "stroke-[2.5]")} />
            <span className="text-[10px] font-medium">More</span>
          </button>

          {showMore && (
            <div className="absolute bottom-full right-0 mb-2 w-44 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden">
              {MORE_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm transition-colors active:scale-[0.98]",
                      active ? "text-primary bg-primary/5" : "text-foreground/80 hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
