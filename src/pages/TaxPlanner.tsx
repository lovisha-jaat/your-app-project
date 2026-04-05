import { useState } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Receipt, CheckCircle2, TrendingDown, Scale } from "lucide-react";
import { formatCurrency, COUNTRIES } from "@/lib/country-config";
import {
  TaxInput,
  createDefaultTaxInput,
  calculateTaxComparison,
  getTaxSavingSuggestions,
} from "@/lib/tax-calculations";

interface FieldDef { label: string; key: keyof TaxInput; hint?: string; }

function getFieldsForCountry(country: string): FieldDef[] {
  switch (country) {
    case "IN": return [
      { label: "Basic Salary (Annual)", key: "basicSalary" },
      { label: "HRA (Annual)", key: "hra" },
      { label: "Special Allowance", key: "specialAllowance" },
      { label: "LTA", key: "lta" },
      { label: "Rent Paid (Annual)", key: "rentPaid", hint: "For HRA exemption" },
      { label: "80C Investments", key: "section80C", hint: "PPF, ELSS, EPF (max ₹1.5L)" },
      { label: "80D Health Insurance", key: "section80D", hint: "Self + parents (max ₹75K)" },
      { label: "NPS 80CCD(1B)", key: "nps80CCD", hint: "Extra ₹50K deduction" },
      { label: "Home Loan Interest", key: "homeLoanInterest", hint: "Section 24 (max ₹2L)" },
    ];
    case "US": return [
      { label: "Annual Gross Income", key: "grossIncome" },
      { label: "401(k) Contribution", key: "filing401k", hint: "Max $23,000/year" },
      { label: "IRA Contribution", key: "iraContribution", hint: "Max $7,000/year" },
      { label: "HSA Contribution", key: "hsaContribution", hint: "Max $4,150/year (individual)" },
    ];
    case "GB": return [
      { label: "Annual Gross Income", key: "grossIncome" },
      { label: "Pension Contribution", key: "pensionContribution", hint: "Annual allowance £60,000" },
      { label: "ISA Contribution", key: "isaContribution", hint: "Annual allowance £20,000" },
    ];
    case "CA": return [
      { label: "Annual Gross Income", key: "grossIncome" },
      { label: "RRSP Contribution", key: "rrspContribution", hint: "18% of income, max C$31,560" },
      { label: "TFSA Contribution", key: "tfsaContribution", hint: "Annual limit C$7,000" },
    ];
    case "AU": return [
      { label: "Annual Gross Income", key: "grossIncome" },
      { label: "Extra Super Contribution", key: "superContribution", hint: "Concessional cap A$27,500" },
    ];
    default: return [{ label: "Annual Gross Income", key: "grossIncome" }];
  }
}

export default function TaxPlanner() {
  const { userData, isOnboarded } = useUserData();

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const country = userData.country;
  const cc = COUNTRIES[country];
  const fmt = (v: number) => formatCurrency(v, country);

  const [showResults, setShowResults] = useState(false);
  const [input, setInput] = useState<TaxInput>(() => {
    const def = createDefaultTaxInput(country);
    const annualIncome = userData.monthlyIncome * 12;
    if (country === "IN") {
      def.basicSalary = Math.round(annualIncome * 0.5);
      def.hra = Math.round(annualIncome * 0.2);
      def.specialAllowance = Math.round(annualIncome * 0.25);
      def.lta = Math.round(annualIncome * 0.05);
      def.rentPaid = Math.round(userData.monthlyExpenses * 12 * 0.3);
    } else {
      def.grossIncome = annualIncome;
    }
    return def;
  });

  const update = (field: keyof TaxInput, value: string | boolean) => {
    setInput((p) => ({ ...p, [field]: typeof value === "boolean" ? value : parseFloat(value) || 0 }));
    setShowResults(false);
  };

  const { optionA, optionB } = calculateTaxComparison(input);
  const suggestions = getTaxSavingSuggestions(input);
  const better = optionA.totalTax <= optionB.totalTax ? "A" : "B";
  const bestResult = better === "A" ? optionA : optionB;
  const savings = Math.abs(optionA.totalTax - optionB.totalTax);

  const fields = getFieldsForCountry(country);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-chart-2" />
          <h1 className="text-xl font-bold tracking-tight">Tax Planner</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{cc.flag} {cc.name} · Tax Year 2024</p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-base font-semibold">Income & Deductions</h2>
            {fields.map(({ label, key, hint }) => (
              <div key={key}>
                <Label className="text-sm mb-1.5 block">{label}</Label>
                <Input
                  type="number" inputMode="numeric"
                  value={input[key] as number || ""}
                  onChange={(e) => update(key, e.target.value)}
                  className="h-11" placeholder="0"
                />
                {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
              </div>
            ))}
            {country === "IN" && (
              <div className="flex items-center justify-between">
                <Label className="text-sm">Living in Metro City?</Label>
                <Switch checked={input.isMetro} onCheckedChange={(v) => update("isMetro", v)} />
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full h-12 text-base font-semibold active:scale-[0.98] transition-transform" onClick={() => setShowResults(true)}>
          <Scale className="w-5 h-5 mr-2" /> Compare Options
        </Button>

        {showResults && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[{ res: optionA, id: "A" }, { res: optionB, id: "B" }].map(({ res, id }) => (
                <Card key={id} className={`shadow-md ${better === id ? "ring-2 ring-primary" : ""}`}>
                  <CardContent className="p-4 text-center">
                    {better === id && <Badge className="mb-2 bg-primary/10 text-primary border-0 text-[10px]">Recommended</Badge>}
                    <p className="text-xs text-muted-foreground mb-1">{res.label}</p>
                    <p className="text-xl font-bold tabular-nums text-foreground">{fmt(res.totalTax)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Taxable: {fmt(res.taxableIncome)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm bg-primary/5 border-primary/15">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">You save {fmt(savings)} with {bestResult.label}</p>
                  <p className="text-xs text-muted-foreground">That's {fmt(Math.round(savings / 12))}/month extra</p>
                </div>
              </CardContent>
            </Card>

            {/* Deduction breakdown for option A */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h2 className="text-base font-semibold mb-3">{optionA.label} Breakdown</h2>
                <div className="space-y-2">
                  {Object.entries(optionA.breakdown).filter(([, v]) => v > 0).map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium tabular-nums">{fmt(val)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                    <span>Total Deductions</span>
                    <span className="text-primary tabular-nums">{fmt(optionA.totalDeductions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold px-1">💡 Tax-Saving Opportunities</h2>
                {suggestions.map((s) => (
                  <Card key={s.section} className="shadow-sm border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.section}</p>
                        </div>
                        <Badge variant="outline" className="text-xs tabular-nums">{fmt(s.remaining)} left</Badge>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(s.currentUsed / s.maxLimit) * 100}%` }} />
                      </div>
                      <ul className="space-y-1.5">
                        {s.suggestions.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
