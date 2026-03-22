import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/context/UserDataContext";
import { FINANCIAL_GOALS } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, Target, Wallet, PiggyBank, TrendingUp } from "lucide-react";

const STEPS = [
  { title: "About You", subtitle: "Let's start with the basics", icon: Sparkles },
  { title: "Income & Expenses", subtitle: "Your monthly cash flow", icon: Wallet },
  { title: "Savings & Investments", subtitle: "What you've built so far", icon: PiggyBank },
  { title: "Your Goals", subtitle: "What are you working toward?", icon: Target },
];

export default function OnboardingForm() {
  const navigate = useNavigate();
  const { setUserData } = useUserData();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    currentSavings: "",
    investments: "",
    financialGoals: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progress = ((step + 1) / STEPS.length) * 100;
  const StepIcon = STEPS[step].icon;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal],
    }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      const age = parseInt(formData.age);
      if (!formData.age || isNaN(age) || age < 18 || age > 100) {
        newErrors.age = "Enter a valid age (18–100)";
      }
    }
    if (step === 1) {
      const income = parseFloat(formData.monthlyIncome);
      const expenses = parseFloat(formData.monthlyExpenses);
      if (!formData.monthlyIncome || isNaN(income) || income <= 0) {
        newErrors.monthlyIncome = "Enter a valid income";
      }
      if (!formData.monthlyExpenses || isNaN(expenses) || expenses < 0) {
        newErrors.monthlyExpenses = "Enter valid expenses";
      }
      if (income > 0 && expenses > income) {
        newErrors.monthlyExpenses = "Expenses can't exceed income";
      }
    }
    if (step === 2) {
      if (!formData.currentSavings || isNaN(parseFloat(formData.currentSavings)) || parseFloat(formData.currentSavings) < 0) {
        newErrors.currentSavings = "Enter a valid amount";
      }
      if (!formData.investments || isNaN(parseFloat(formData.investments)) || parseFloat(formData.investments) < 0) {
        newErrors.investments = "Enter a valid amount";
      }
    }
    if (step === 3 && formData.financialGoals.length === 0) {
      newErrors.financialGoals = "Select at least one goal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setUserData({
        age: parseInt(formData.age),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        monthlyExpenses: parseFloat(formData.monthlyExpenses),
        currentSavings: parseFloat(formData.currentSavings),
        investments: parseFloat(formData.investments),
        financialGoals: formData.financialGoals,
      });
      navigate("/dashboard");
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          {step > 0 && (
            <button onClick={handleBack} className="p-1 -ml-1 active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mb-6" />
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{STEPS[step].title}</h1>
            <p className="text-sm text-muted-foreground">{STEPS[step].subtitle}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="age" className="text-sm font-medium mb-2 block">How old are you?</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 28"
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
                className="text-lg h-12"
                min={18}
                max={100}
              />
              {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
            </div>
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Your age helps us calculate retirement timelines and recommend age-appropriate investment strategies.
              </CardContent>
            </Card>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="income" className="text-sm font-medium mb-2 block">Monthly Income (₹)</Label>
              <Input
                id="income"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 50000"
                value={formData.monthlyIncome}
                onChange={(e) => updateField("monthlyIncome", e.target.value)}
                className="text-lg h-12"
              />
              {errors.monthlyIncome && <p className="text-sm text-destructive mt-1">{errors.monthlyIncome}</p>}
            </div>
            <div>
              <Label htmlFor="expenses" className="text-sm font-medium mb-2 block">Monthly Expenses (₹)</Label>
              <Input
                id="expenses"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 30000"
                value={formData.monthlyExpenses}
                onChange={(e) => updateField("monthlyExpenses", e.target.value)}
                className="text-lg h-12"
              />
              {errors.monthlyExpenses && <p className="text-sm text-destructive mt-1">{errors.monthlyExpenses}</p>}
            </div>
            {formData.monthlyIncome && formData.monthlyExpenses && (
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Surplus</span>
                  <span className="font-bold text-primary">
                    ₹{(parseFloat(formData.monthlyIncome || "0") - parseFloat(formData.monthlyExpenses || "0")).toLocaleString("en-IN")}
                  </span>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="savings" className="text-sm font-medium mb-2 block">Current Savings (₹)</Label>
              <Input
                id="savings"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 200000"
                value={formData.currentSavings}
                onChange={(e) => updateField("currentSavings", e.target.value)}
                className="text-lg h-12"
              />
              {errors.currentSavings && <p className="text-sm text-destructive mt-1">{errors.currentSavings}</p>}
              <p className="text-xs text-muted-foreground mt-1">Bank balance, FDs, liquid funds</p>
            </div>
            <div>
              <Label htmlFor="investments" className="text-sm font-medium mb-2 block">Total Investments (₹)</Label>
              <Input
                id="investments"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 500000"
                value={formData.investments}
                onChange={(e) => updateField("investments", e.target.value)}
                className="text-lg h-12"
              />
              {errors.investments && <p className="text-sm text-destructive mt-1">{errors.investments}</p>}
              <p className="text-xs text-muted-foreground mt-1">Stocks, mutual funds, PPF, NPS, etc.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Pick all that apply — we'll personalize your dashboard.</p>
            <div className="flex flex-wrap gap-2">
              {FINANCIAL_GOALS.map((goal) => (
                <Badge
                  key={goal}
                  variant={formData.financialGoals.includes(goal) ? "default" : "outline"}
                  className={`cursor-pointer py-2.5 px-4 text-sm transition-all active:scale-95 ${
                    formData.financialGoals.includes(goal)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
            {errors.financialGoals && <p className="text-sm text-destructive">{errors.financialGoals}</p>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-8 pt-2">
        <Button
          onClick={handleNext}
          className="w-full h-12 text-base font-semibold active:scale-[0.98] transition-transform"
          size="lg"
        >
          {step === STEPS.length - 1 ? (
            <>
              <TrendingUp className="w-5 h-5 mr-2" /> See My Dashboard
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
