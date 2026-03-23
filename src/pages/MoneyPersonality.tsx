import { useState } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, RotateCcw, PiggyBank, ShoppingCart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: { label: string; scores: { saver: number; spender: number; investor: number } }[];
}

const QUESTIONS: Question[] = [
  {
    question: "You receive an unexpected bonus of ₹50,000. What's your first thought?",
    options: [
      { label: "Put it straight into savings", scores: { saver: 3, spender: 0, investor: 1 } },
      { label: "Treat myself — I deserve it!", scores: { saver: 0, spender: 3, investor: 0 } },
      { label: "Research where to invest it", scores: { saver: 0, spender: 0, investor: 3 } },
      { label: "Split between fun and investing", scores: { saver: 1, spender: 1, investor: 2 } },
    ],
  },
  {
    question: "How do you feel when checking your bank balance?",
    options: [
      { label: "Relieved when it's high", scores: { saver: 3, spender: 0, investor: 1 } },
      { label: "I don't check very often", scores: { saver: 0, spender: 3, investor: 0 } },
      { label: "I track it alongside my portfolio", scores: { saver: 1, spender: 0, investor: 3 } },
      { label: "Anxious about spending too much", scores: { saver: 2, spender: 1, investor: 0 } },
    ],
  },
  {
    question: "Your friend suggests a weekend trip. Your reaction?",
    options: [
      { label: "Check my budget first", scores: { saver: 3, spender: 0, investor: 1 } },
      { label: "Book it immediately!", scores: { saver: 0, spender: 3, investor: 0 } },
      { label: "Only if my investments are on track", scores: { saver: 0, spender: 0, investor: 3 } },
      { label: "Find the most affordable option", scores: { saver: 2, spender: 1, investor: 0 } },
    ],
  },
  {
    question: "What's your approach to a big sale or discount?",
    options: [
      { label: "I ignore sales — I buy what I need", scores: { saver: 3, spender: 0, investor: 0 } },
      { label: "I love deals — I stock up!", scores: { saver: 0, spender: 3, investor: 0 } },
      { label: "I'd rather invest the money I'd save", scores: { saver: 0, spender: 0, investor: 3 } },
      { label: "I buy only if I planned to anyway", scores: { saver: 2, spender: 1, investor: 1 } },
    ],
  },
  {
    question: "How would you describe your ideal financial future?",
    options: [
      { label: "A large emergency fund and zero debt", scores: { saver: 3, spender: 0, investor: 1 } },
      { label: "Freedom to spend on experiences", scores: { saver: 0, spender: 3, investor: 0 } },
      { label: "Passive income covering all expenses", scores: { saver: 0, spender: 0, investor: 3 } },
      { label: "A balanced, comfortable lifestyle", scores: { saver: 1, spender: 2, investor: 1 } },
    ],
  },
  {
    question: "Someone asks for your financial advice. You say:",
    options: [
      { label: "Always save before you spend", scores: { saver: 3, spender: 0, investor: 0 } },
      { label: "Life's short — enjoy your money", scores: { saver: 0, spender: 3, investor: 0 } },
      { label: "Make your money work for you", scores: { saver: 0, spender: 0, investor: 3 } },
      { label: "It depends on your goals", scores: { saver: 1, spender: 1, investor: 1 } },
    ],
  },
];

type PersonalityType = "saver" | "spender" | "investor";

const PERSONALITY_DATA: Record<PersonalityType, {
  title: string;
  emoji: string;
  icon: typeof PiggyBank;
  color: string;
  description: string;
  strengths: string[];
  watchOuts: string[];
  tip: string;
}> = {
  saver: {
    title: "The Saver",
    emoji: "🐿️",
    icon: PiggyBank,
    color: "hsl(var(--chart-1))",
    description: "You're careful with money and prioritize security. Building a financial cushion comes naturally to you.",
    strengths: ["Disciplined with spending", "Strong emergency fund habit", "Low financial stress"],
    watchOuts: ["May miss investment opportunities", "Could under-spend on experiences", "Risk of hoarding cash that loses to inflation"],
    tip: "Consider moving excess savings into index funds or SIPs — your cash is losing purchasing power sitting idle.",
  },
  spender: {
    title: "The Spender",
    emoji: "🛍️",
    icon: ShoppingCart,
    color: "hsl(var(--chart-3))",
    description: "You believe money is meant to be enjoyed. You're generous and love living in the moment.",
    strengths: ["Enjoys life fully", "Generous with others", "Open to new experiences"],
    watchOuts: ["May lack emergency savings", "Impulse purchases add up", "Retirement planning often delayed"],
    tip: "Try the 50/30/20 rule — automate 20% into savings and investments before you spend.",
  },
  investor: {
    title: "The Investor",
    emoji: "📈",
    icon: BarChart3,
    color: "hsl(var(--chart-2))",
    description: "You see money as a tool for growth. You're always looking for ways to make your money multiply.",
    strengths: ["Long-term thinker", "Understands compounding", "Wealth-building mindset"],
    watchOuts: ["May over-optimize at the cost of living", "Can take excessive risk", "Analysis paralysis on decisions"],
    tip: "Balance is key — ensure you have 6 months of expenses in liquid savings before concentrating on growth.",
  },
};

export default function MoneyPersonality() {
  const { isOnboarded } = useUserData();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<PersonalityType | null>(null);

  if (!isOnboarded) return <Navigate to="/" replace />;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate result
      const totals = { saver: 0, spender: 0, investor: 0 };
      newAnswers.forEach((ansIdx, qIdx) => {
        const scores = QUESTIONS[qIdx].options[ansIdx].scores;
        totals.saver += scores.saver;
        totals.spender += scores.spender;
        totals.investor += scores.investor;
      });

      const winner = (Object.entries(totals) as [PersonalityType, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      setResult(winner);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const progress = result ? 100 : Math.round((currentQ / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Money Personality</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Discover your financial behavior type</p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{result ? "Complete" : `Question ${currentQ + 1} of ${QUESTIONS.length}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!result ? (
          /* Quiz */
          <Card className="shadow-md">
            <CardContent className="p-5 space-y-4">
              <p className="text-base font-semibold leading-snug">{QUESTIONS[currentQ].question}</p>
              <div className="space-y-2.5">
                {QUESTIONS[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border border-border/60 text-sm transition-all",
                      "hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Results */
          (() => {
            const data = PERSONALITY_DATA[result];
            const Icon = data.icon;
            return (
              <div className="space-y-4">
                <Card className="shadow-md overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: data.color }} />
                  <CardContent className="p-5 text-center space-y-3">
                    <div className="text-4xl">{data.emoji}</div>
                    <div>
                      <h2 className="text-xl font-bold">{data.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{data.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      ✅ Your Strengths
                    </h3>
                    <ul className="space-y-1.5">
                      {data.strengths.map((s) => (
                        <li key={s} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-accent flex items-center gap-1.5">
                      ⚠️ Watch Out For
                    </h3>
                    <ul className="space-y-1.5">
                      {data.watchOuts.map((w) => (
                        <li key={w} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm bg-primary/5 border-primary/10">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-1.5">💡 Pro Tip</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">{data.tip}</p>
                  </CardContent>
                </Card>

                <Button onClick={reset} variant="outline" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" /> Retake Quiz
                </Button>
              </div>
            );
          })()
        )}
      </div>

      <BottomNav />
    </div>
  );
}
