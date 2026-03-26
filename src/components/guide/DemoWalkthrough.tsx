import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  BarChart3,
  MessageCircle,
  Target,
  Shield,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_SLIDES = [
  {
    id: 1,
    title: "Step 1: Sign Up",
    icon: UserPlus,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "Create your free account with email. Takes 30 seconds.",
    mockUI: (
      <div className="bg-background rounded-xl border border-border/60 p-4 space-y-3">
        <div className="text-center mb-4">
          <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold">Create Account</p>
        </div>
        <div className="space-y-2">
          <div className="h-9 rounded-lg bg-secondary/50 border border-border/40 flex items-center px-3 text-xs text-muted-foreground">
            yourname@email.com
          </div>
          <div className="h-9 rounded-lg bg-secondary/50 border border-border/40 flex items-center px-3 text-xs text-muted-foreground">
            ••••••••
          </div>
          <div className="h-9 rounded-lg bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
            Sign Up Free →
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Step 2: Enter Your Details",
    icon: BarChart3,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    description: "Tell us your income, expenses & savings. Approximate values work!",
    mockUI: (
      <div className="bg-background rounded-xl border border-border/60 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">ONBOARDING</p>
        <div className="space-y-2.5">
          {[
            { label: "Monthly Income", value: "₹50,000" },
            { label: "Monthly Expenses", value: "₹35,000" },
            { label: "Current Savings", value: "₹2,00,000" },
            { label: "Investments", value: "₹50,000" },
          ].map((field) => (
            <div key={field.label} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
              <span className="text-xs text-muted-foreground">{field.label}</span>
              <span className="text-xs font-semibold text-primary">{field.value}</span>
            </div>
          ))}
        </div>
        <div className="h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
          ✓ Analyze My Finances
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Step 3: See Your Health Score",
    icon: BarChart3,
    color: "text-accent",
    bg: "bg-accent/10",
    description: "Instantly get a score out of 100 showing your financial health.",
    mockUI: (
      <div className="bg-background rounded-xl border border-border/60 p-4 space-y-3">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className="stroke-secondary"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray="68, 100"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary">68</span>
          </div>
          <p className="text-xs font-medium text-muted-foreground mt-1">Money Health Score</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary/5 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Surplus</p>
            <p className="text-sm font-bold text-primary">₹15,000</p>
          </div>
          <div className="bg-accent/5 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Net Worth</p>
            <p className="text-sm font-bold text-accent">₹2.5L</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Step 4: Chat with AI Mentor",
    icon: MessageCircle,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    description: "Ask any question — get personalized advice using YOUR numbers. Tap 🔊 to listen!",
    mockUI: (
      <div className="bg-background rounded-xl border border-border/60 p-3 space-y-2">
        <div className="flex gap-2 justify-end">
          <div className="bg-primary text-primary-foreground text-xs rounded-xl rounded-br-sm px-3 py-2 max-w-[75%]">
            How much SIP should I start?
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-2.5 h-2.5 text-primary" />
          </div>
          <div className="bg-card border border-border/50 text-xs rounded-xl rounded-bl-sm px-3 py-2 max-w-[80%]">
            <p>From your <strong className="text-primary">₹15,000</strong> surplus, I recommend:</p>
            <p className="mt-1">• ₹5,000 → Nifty 50 Index Fund</p>
            <p>• ₹3,000 → ELSS (tax saving)</p>
            <p>• ₹2,000 → PPF</p>
            <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
              <Volume2 className="w-3 h-3" /> <span className="text-[10px]">Tap to listen</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Step 5: Plan & Grow",
    icon: Target,
    color: "text-destructive",
    bg: "bg-destructive/10",
    description: "Use FIRE Planner, Tax Optimizer, Goal Planner & Emergency Fund tools.",
    mockUI: (
      <div className="bg-background rounded-xl border border-border/60 p-3 space-y-2">
        {[
          { icon: "🔥", name: "FIRE Planner", desc: "Retire by age 45" },
          { icon: "💰", name: "Tax Optimizer", desc: "Save ₹46,800/yr" },
          { icon: "🎯", name: "Goal Planner", desc: "Buy car in 3 years" },
          { icon: "🛡️", name: "Emergency Fund", desc: "₹2.1L target" },
        ].map((tool) => (
          <div key={tool.name} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2.5">
            <span className="text-lg">{tool.icon}</span>
            <div>
              <p className="text-xs font-semibold">{tool.name}</p>
              <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function DemoWalkthrough() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slide = DEMO_SLIDES[currentSlide];
  const Icon = slide.icon;

  const next = () => setCurrentSlide((p) => Math.min(p + 1, DEMO_SLIDES.length - 1));
  const prev = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  // Auto-play
  const startAutoPlay = () => {
    setIsPlaying(true);
    setCurrentSlide(0);
  };

  // Auto-advance when playing
  useState(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((p) => {
        if (p >= DEMO_SLIDES.length - 1) {
          setIsPlaying(false);
          clearInterval(timer);
          return p;
        }
        return p + 1;
      });
    }, 3000);
    return () => clearInterval(timer);
  });

  return (
    <Card className="border-border/60 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Interactive Demo</span>
          </div>
          <div className="flex items-center gap-1">
            {DEMO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentSlide ? "bg-primary w-4" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Slide Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", slide.bg)}>
              <Icon className={cn("w-4 h-4", slide.color)} />
            </div>
            <div>
              <p className="text-sm font-bold">{slide.title}</p>
              <p className="text-[11px] text-muted-foreground">{slide.description}</p>
            </div>
          </div>

          {/* Mock UI Preview */}
          <div className="transform scale-[0.95] origin-top">{slide.mockUI}</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
          <Button
            size="sm"
            variant="ghost"
            onClick={prev}
            disabled={currentSlide === 0}
            className="text-xs h-8"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentSlide + 1} / {DEMO_SLIDES.length}
          </span>
          <Button
            size="sm"
            variant={currentSlide === DEMO_SLIDES.length - 1 ? "default" : "ghost"}
            onClick={currentSlide === DEMO_SLIDES.length - 1 ? () => setCurrentSlide(0) : next}
            className="text-xs h-8"
          >
            {currentSlide === DEMO_SLIDES.length - 1 ? "Restart" : "Next"}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
