import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Target,
  Wallet,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronRight,
  Zap,
  Award,
} from "lucide-react";

const FEATURES = [
  { icon: BarChart3, title: "Spending Analytics", desc: "Visual charts showing where your money goes each month.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Wallet, title: "Budget Tracker", desc: "Set budgets for categories and track progress with smart alerts.", color: "text-chart-2", bg: "bg-chart-2/10" },
  { icon: PiggyBank, title: "Savings Goals", desc: "Create goals for gadgets, trips, or fees and watch your progress grow.", color: "text-accent", bg: "bg-accent/10" },
  { icon: Target, title: "Expense Tracking", desc: "Log every expense with categories, dates, and notes.", color: "text-chart-4", bg: "bg-chart-4/10" },
  { icon: TrendingUp, title: "Smart Tips", desc: "Get personalized advice to save more and spend wisely.", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Award, title: "Achievements", desc: "Earn badges like Smart Saver and Budget Master as you build habits.", color: "text-primary", bg: "bg-primary/10" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign up for free", desc: "Create your account in seconds — no credit card needed.", icon: Sparkles },
  { step: "02", title: "Track your money", desc: "Log your income and expenses, set budgets, and create savings goals.", icon: BarChart3 },
  { step: "03", title: "Get smarter with money", desc: "See analytics, earn badges, and build better financial habits.", icon: TrendingUp },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <section className="relative px-4 pt-12 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            <Wallet className="w-4 h-4" />
            Student Finance Tracker
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Master Your
            <span className="block text-primary">Student Budget</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Track expenses, set budgets, save for goals, and build smart money habits — all in one simple app designed for students.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-accent" /> Quick setup</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> 100% free</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-chart-4" /> Gamified</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-14 bg-card/50 border-y border-border/40">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</p>
            <h2 className="text-2xl font-bold tracking-tight">Start in 3 simple steps</h2>
          </div>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((item, i) => (
              <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary/60">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider">Features</p>
            <h2 className="text-2xl font-bold tracking-tight">Everything you need to manage money</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 bg-card/50 border-t border-border/40">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Built for Students
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Ready to take control of your finances?</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Join students who are building smarter money habits with simple tracking and analytics.
          </p>
          <Button
            size="lg"
            className="h-13 px-10 text-base font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            onClick={() => navigate("/auth")}
          >
            Start Tracking Free
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      <footer className="px-4 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© 2026 Student Finance Tracker · Your smart money companion</p>
      </footer>
    </div>
  );
}
