import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Shield,
  TrendingUp,
  Brain,
  Target,
  PiggyBank,
  BarChart3,
  MessageCircle,
  Sparkles,
  ChevronRight,
  IndianRupee,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Money Health Score",
    desc: "Get a score out of 100 based on your savings, expenses, investments & retirement readiness.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "AI Chat Mentor",
    desc: "Ask anything about investing, taxes, or budgeting — get personalized answers using your data.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: TrendingUp,
    title: "FIRE Planner",
    desc: "See when you can retire early and how much you need to invest monthly to get there.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Tax Optimizer",
    desc: "Compare tax regimes for your country. Discover deductions and save more on taxes.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Target,
    title: "Goal Planner",
    desc: "Plan for a car, house, or vacation — we calculate the monthly SIP needed.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: PiggyBank,
    title: "Emergency Fund",
    desc: "Know exactly how much you need for a 6-month safety net and track your progress.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about yourself",
    desc: "Enter your age, income, expenses, savings & goals in under 2 minutes.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Get your health score",
    desc: "We instantly analyze your finances and generate a personalized dashboard.",
    icon: BarChart3,
  },
  {
    step: "03",
    title: "Take action with AI",
    desc: "Chat with your AI mentor, optimize taxes, plan goals & build wealth.",
    icon: MessageCircle,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-lg mx-auto text-center space-y-6">
          {/* Logo / Brand */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            <IndianRupee className="w-4 h-4" />
            FinMentor AI
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Your Personal
            <span className="block text-primary">Finance Mentor</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            AI-powered financial planning for everyone. Get your money health score, save taxes, plan retirement & build wealth — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              onClick={() => navigate("/onboarding")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 text-base"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See How It Works
            </Button>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => navigate("/guide")}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Beginner's Guide
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" /> 2 min setup
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" /> 100% free
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-chart-4" /> AI-powered
            </span>
          </div>
        </div>
      </section>

      {/* How It Works */}
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

      {/* Features Grid */}
      <section className="px-4 py-14">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider">Features</p>
            <h2 className="text-2xl font-bold tracking-tight">Everything you need to master money</h2>
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

      {/* CTA Section */}
      <section className="px-4 py-14 bg-card/50 border-t border-border/40">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Built for Everyone
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Join thousands of users worldwide who are building a smarter financial future with AI-powered guidance.
          </p>
          <Button
            size="lg"
            className="h-13 px-10 text-base font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            onClick={() => navigate("/onboarding")}
          >
            Start Your Free Analysis
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© 2026 FinMentor AI · Your AI-powered financial companion</p>
      </footer>
    </div>
  );
}
