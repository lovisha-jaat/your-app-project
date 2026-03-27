import BottomNav from "@/components/layout/BottomNav";
import DemoWalkthrough from "@/components/guide/DemoWalkthrough";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  Target,
  PiggyBank,
  MessageCircle,
  IndianRupee,
  HelpCircle,
  BookOpen,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const APP_STEPS = [
  {
    step: 1,
    title: "Sign Up & Onboard",
    desc: "Create your account and enter basic details like your age, monthly income, expenses, savings, and investments. It takes less than 2 minutes!",
    icon: Sparkles,
    tip: "Don't worry about exact numbers — estimates work fine to start.",
  },
  {
    step: 2,
    title: "Get Your Money Health Score",
    desc: "We instantly analyze your financial data and give you a score out of 100. This tells you how healthy your money habits are.",
    icon: BarChart3,
    tip: "A score above 70 means you're doing well. Below 50? Don't worry — we'll help you improve.",
  },
  {
    step: 3,
    title: "Explore Your Dashboard",
    desc: "See your monthly surplus, net worth, category-wise breakdown, and smart alerts — all in one beautiful dashboard.",
    icon: TrendingUp,
    tip: "Check your dashboard weekly to track your progress.",
  },
  {
    step: 4,
    title: "Chat with AI Mentor",
    desc: "Say 'Hello' and the AI will greet you warmly like a friend! Ask any financial question in simple language — it uses YOUR data to give personalized answers, not generic advice. You can also tap 🔊 Listen to hear responses read aloud.",
    icon: MessageCircle,
    tip: 'Try saying "Hi" first! Then ask: "How much SIP should I start?" or "How can I save tax?"',
  },
  {
    step: 5,
    title: "Plan & Take Action",
    desc: "Use the FIRE Planner, Tax Optimizer, Goal Planner, and Emergency Fund tools to build a complete financial plan.",
    icon: Target,
    tip: "Start with one tool at a time. The Goal Planner is a great first step!",
  },
];

const FINANCIAL_TERMS = [
  {
    term: "Net Worth",
    meaning: "Total money you own (savings + investments) minus what you owe (loans/debts). Think of it as your financial scorecard.",
    example: "If you have ₹5L in savings, ₹3L in investments, and ₹2L loan → Net Worth = ₹6L",
    icon: Wallet,
  },
  {
    term: "Monthly Surplus",
    meaning: "Money left over after all your expenses each month. This is what you can save or invest.",
    example: "Income ₹50,000 – Expenses ₹35,000 = Surplus ₹15,000",
    icon: IndianRupee,
  },
  {
    term: "SIP (Systematic Investment Plan)",
    meaning: "Investing a fixed amount every month into mutual funds. Like a recurring deposit but with potentially higher returns.",
    example: "₹5,000/month SIP in an equity fund can grow to ₹25L+ in 15 years!",
    icon: TrendingUp,
  },
  {
    term: "Emergency Fund",
    meaning: "Money saved for unexpected situations — job loss, medical emergency, etc. You should have 6 months of expenses saved.",
    example: "Monthly expenses ₹30,000 → Emergency Fund target = ₹1,80,000",
    icon: Shield,
  },
  {
    term: "FIRE (Financial Independence, Retire Early)",
    meaning: "A movement to save and invest aggressively so you can stop working for money earlier than the traditional retirement age.",
    example: "Saving 50% of income from age 25 could let you retire by 40-45!",
    icon: Target,
  },
  {
    term: "80C Deduction",
    meaning: "A tax-saving section that lets you save up to ₹1.5 lakh per year through investments like ELSS, PPF, or EPF.",
    example: "Investing ₹1.5L in ELSS saves you ₹46,800 in tax (30% bracket)",
    icon: Calculator,
  },
  {
    term: "PPF (Public Provident Fund)",
    meaning: "A safe government-backed savings scheme with tax-free returns. Locked for 15 years but great for long-term savings.",
    example: "₹12,500/month in PPF → ₹40L+ in 15 years (tax-free!)",
    icon: PiggyBank,
  },
  {
    term: "NPS (National Pension System)",
    meaning: "A retirement savings scheme with extra tax benefits. You get additional ₹50,000 deduction under 80CCD(1B).",
    example: "₹50,000 in NPS saves extra ₹15,600 in tax beyond 80C limit",
    icon: Shield,
  },
];

const FAQ_ITEMS = [
  {
    q: "I have zero financial knowledge. Can I still use this app?",
    a: "Absolutely! This app is built specifically for beginners. Just enter your income, expenses, and savings — we handle all the calculations and give you simple, actionable advice.",
  },
  {
    q: "I don't know my exact net worth or monthly surplus. What should I do?",
    a: "No problem! Just enter approximate values. Check your bank balance for savings, estimate your monthly spending, and we'll calculate everything. You can always update later.",
  },
  {
    q: "Is my financial data safe?",
    a: "Yes! Your data is securely stored and encrypted. We never share your financial information with anyone. Only you can see your data.",
  },
  {
    q: "How accurate is the AI advice?",
    a: "Our AI uses your actual financial data to give personalized suggestions. While it's not a certified financial advisor, it uses proven financial principles to guide you in the right direction.",
  },
  {
    q: "What if I have no savings or investments at all?",
    a: "That's exactly why this app exists! Enter ₹0 for savings/investments — your health score will show areas to improve, and the AI will give you a step-by-step plan to start building wealth.",
  },
  {
    q: "Do I need to pay to use this app?",
    a: "The app is completely free to use. All features — dashboard, AI chat, tax planner, FIRE calculator — are available at no cost.",
  },
];

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Beginner's Guide
          </div>
          <h1 className="text-xl font-bold tracking-tight">How FinMentor AI Works</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you need to know to start your financial journey
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        {/* Interactive Demo */}
        <DemoWalkthrough />

        {/* Quick Start Alert */}
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-4 flex gap-3 items-start">
            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">New to finance?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Don't worry! You don't need any financial knowledge to use this app. 
                Just answer a few simple questions about your income and expenses — 
                we'll do all the heavy lifting for you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How The App Works */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">How The App Works</h2>
          </div>

          <div className="space-y-3">
            {APP_STEPS.map((step) => (
              <Card key={step.step} className="border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                          Step {step.step}
                        </Badge>
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{step.desc}</p>
                      <div className="flex items-start gap-1.5 bg-accent/10 rounded-lg px-2.5 py-2">
                        <Lightbulb className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                        <p className="text-[11px] text-accent">{step.tip}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What If You Don't Know */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold">Don't Know Your Numbers?</h2>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you're unsure about your financial details, here's how to find them quickly:
              </p>
              
              {[
                { label: "Monthly Income", how: "Check your salary slip or bank statement for the amount credited each month." },
                { label: "Monthly Expenses", how: "Look at your UPI/bank app's monthly spending summary. Or estimate: rent + food + transport + bills." },
                { label: "Current Savings", how: "Open your bank app → check your savings account balance. That's it!" },
                { label: "Investments", how: "Check any mutual fund app (Groww, Zerodha), PPF passbook, or FD receipts. If you have none, enter ₹0." },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.how}</p>
                  </div>
                </div>
              ))}

              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Pro tip:</span> Even rough estimates are better than not starting at all. You can always update your numbers later!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Financial Terms Explained */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-chart-4" />
            <h2 className="text-lg font-bold">Financial Terms Simplified</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Confused by jargon? Here's everything explained in simple language.
          </p>

          <div className="space-y-3">
            {FINANCIAL_TERMS.map((item) => (
              <Card key={item.term} className="border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-chart-4" />
                    </div>
                    <h3 className="font-semibold text-sm">{item.term}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.meaning}</p>
                  <div className="bg-secondary/50 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-foreground/80">
                      <span className="font-semibold">Example:</span> {item.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-chart-2" />
            <h2 className="text-lg font-bold">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/60 rounded-xl px-4 shadow-sm">
                <AccordionTrigger className="text-sm font-medium text-left py-3 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 shadow-md">
          <CardContent className="p-5 text-center space-y-3">
            <h3 className="font-bold text-base">Ready to start?</h3>
            <p className="text-xs text-muted-foreground">
              Take 2 minutes to set up your profile and get your personalized financial health score.
            </p>
            <Button
              onClick={() => navigate("/onboarding")}
              className="h-11 px-6 text-sm font-semibold shadow-lg shadow-primary/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
