import { CountryCode } from "./country-config";

// ── Common types ──
export interface TaxInput {
  country: CountryCode;
  // Shared
  grossIncome: number;
  // India-specific
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  lta: number;
  rentPaid: number;
  isMetro: boolean;
  section80C: number;
  section80D: number;
  nps80CCD: number;
  homeLoanInterest: number;
  // US-specific
  filing401k: number;
  iraContribution: number;
  hsaContribution: number;
  // UK-specific
  pensionContribution: number;
  isaContribution: number;
  // Canada-specific
  rrspContribution: number;
  tfsaContribution: number;
  // Australia-specific
  superContribution: number;
}

export function createDefaultTaxInput(country: CountryCode): TaxInput {
  return {
    country,
    grossIncome: 0,
    basicSalary: 0, hra: 0, specialAllowance: 0, lta: 0,
    rentPaid: 0, isMetro: true,
    section80C: 0, section80D: 0, nps80CCD: 0, homeLoanInterest: 0,
    filing401k: 0, iraContribution: 0, hsaContribution: 0,
    pensionContribution: 0, isaContribution: 0,
    rrspContribution: 0, tfsaContribution: 0,
    superContribution: 0,
  };
}

interface TaxSlab { from: number; to: number; rate: number; }

function calcFromSlabs(income: number, slabs: TaxSlab[]): number {
  let tax = 0;
  for (const s of slabs) {
    if (income <= s.from) break;
    tax += (Math.min(income, s.to) - s.from) * s.rate;
  }
  return Math.round(tax);
}

export interface TaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  tax: number;
  cess: number;
  totalTax: number;
  breakdown: Record<string, number>;
  label: string;
}

// ═══════════════ INDIA ═══════════════
const IN_OLD: TaxSlab[] = [
  { from: 0, to: 250000, rate: 0 }, { from: 250000, to: 500000, rate: 0.05 },
  { from: 500000, to: 1000000, rate: 0.2 }, { from: 1000000, to: Infinity, rate: 0.3 },
];
const IN_NEW: TaxSlab[] = [
  { from: 0, to: 300000, rate: 0 }, { from: 300000, to: 700000, rate: 0.05 },
  { from: 700000, to: 1000000, rate: 0.1 }, { from: 1000000, to: 1200000, rate: 0.15 },
  { from: 1200000, to: 1500000, rate: 0.2 }, { from: 1500000, to: Infinity, rate: 0.3 },
];

export function calculateHRAExemption(input: TaxInput): number {
  const { basicSalary, hra, rentPaid, isMetro } = input;
  if (!rentPaid || !hra) return 0;
  return Math.max(0, Math.round(Math.min(hra, rentPaid - 0.1 * basicSalary, (isMetro ? 0.5 : 0.4) * basicSalary)));
}

function calcIndiaOld(input: TaxInput): TaxResult {
  const gross = input.basicSalary + input.hra + input.specialAllowance + input.lta;
  const hraEx = calculateHRAExemption(input);
  const sd = 50000;
  const s80C = Math.min(input.section80C, 150000);
  const s80D = Math.min(input.section80D, 75000);
  const nps = Math.min(input.nps80CCD, 50000);
  const hl = Math.min(input.homeLoanInterest, 200000);
  const totalDed = sd + hraEx + s80C + s80D + nps + hl;
  const taxable = Math.max(0, gross - totalDed);
  const tax = calcFromSlabs(taxable, IN_OLD);
  const cess = Math.round(tax * 0.04);
  return { grossIncome: gross, totalDeductions: totalDed, taxableIncome: taxable, tax, cess, totalTax: tax + cess, label: "Old Regime", breakdown: { "Standard Deduction": sd, "HRA Exemption": hraEx, "Section 80C": s80C, "Section 80D": s80D, "NPS 80CCD(1B)": nps, "Home Loan Interest": hl } };
}

function calcIndiaNew(input: TaxInput): TaxResult {
  const gross = input.basicSalary + input.hra + input.specialAllowance + input.lta;
  const sd = 75000;
  const taxable = Math.max(0, gross - sd);
  let tax = calcFromSlabs(taxable, IN_NEW);
  if (taxable <= 700000) tax = 0;
  const cess = Math.round(tax * 0.04);
  return { grossIncome: gross, totalDeductions: sd, taxableIncome: taxable, tax, cess, totalTax: tax + cess, label: "New Regime", breakdown: { "Standard Deduction": sd } };
}

// ═══════════════ USA ═══════════════
const US_SINGLE: TaxSlab[] = [
  { from: 0, to: 11600, rate: 0.10 }, { from: 11600, to: 47150, rate: 0.12 },
  { from: 47150, to: 100525, rate: 0.22 }, { from: 100525, to: 191950, rate: 0.24 },
  { from: 191950, to: 243725, rate: 0.32 }, { from: 243725, to: 609350, rate: 0.35 },
  { from: 609350, to: Infinity, rate: 0.37 },
];

function calcUSStandard(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const sd = 14600;
  const k401 = Math.min(input.filing401k, 23000);
  const ira = Math.min(input.iraContribution, 7000);
  const hsa = Math.min(input.hsaContribution, 4150);
  const totalDed = sd + k401 + ira + hsa;
  const taxable = Math.max(0, gross - totalDed);
  const tax = calcFromSlabs(taxable, US_SINGLE);
  return { grossIncome: gross, totalDeductions: totalDed, taxableIncome: taxable, tax, cess: 0, totalTax: tax, label: "Standard Deduction", breakdown: { "Standard Deduction": sd, "401(k)": k401, "IRA": ira, "HSA": hsa } };
}

function calcUSItemized(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const k401 = Math.min(input.filing401k, 23000);
  const ira = Math.min(input.iraContribution, 7000);
  const hsa = Math.min(input.hsaContribution, 4150);
  const totalDed = k401 + ira + hsa;
  const taxable = Math.max(0, gross - totalDed);
  const tax = calcFromSlabs(taxable, US_SINGLE);
  return { grossIncome: gross, totalDeductions: totalDed, taxableIncome: taxable, tax, cess: 0, totalTax: tax, label: "Itemized (No Std Ded)", breakdown: { "401(k)": k401, "IRA": ira, "HSA": hsa } };
}

// ═══════════════ UK ═══════════════
const UK_SLABS: TaxSlab[] = [
  { from: 0, to: 12570, rate: 0 }, { from: 12570, to: 50270, rate: 0.20 },
  { from: 50270, to: 125140, rate: 0.40 }, { from: 125140, to: Infinity, rate: 0.45 },
];

function calcUKWithRelief(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const pension = Math.min(input.pensionContribution, 60000);
  const taxable = Math.max(0, gross - pension);
  const tax = calcFromSlabs(taxable, UK_SLABS);
  const ni = gross > 12570 ? Math.round(Math.min(gross - 12570, 50270 - 12570) * 0.08 + Math.max(0, gross - 50270) * 0.02) : 0;
  return { grossIncome: gross, totalDeductions: pension, taxableIncome: taxable, tax, cess: ni, totalTax: tax + ni, label: "With Pension Relief", breakdown: { "Pension Relief": pension, "National Insurance": ni } };
}

function calcUKBase(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const tax = calcFromSlabs(gross, UK_SLABS);
  const ni = gross > 12570 ? Math.round(Math.min(gross - 12570, 50270 - 12570) * 0.08 + Math.max(0, gross - 50270) * 0.02) : 0;
  return { grossIncome: gross, totalDeductions: 0, taxableIncome: gross, tax, cess: ni, totalTax: tax + ni, label: "Without Relief", breakdown: { "National Insurance": ni } };
}

// ═══════════════ CANADA ═══════════════
const CA_SLABS: TaxSlab[] = [
  { from: 0, to: 55867, rate: 0.15 }, { from: 55867, to: 111733, rate: 0.205 },
  { from: 111733, to: 154906, rate: 0.26 }, { from: 154906, to: 220000, rate: 0.29 },
  { from: 220000, to: Infinity, rate: 0.33 },
];

function calcCAWithRRSP(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const bpa = 15705;
  const rrsp = Math.min(input.rrspContribution, Math.min(gross * 0.18, 31560));
  const totalDed = bpa + rrsp;
  const taxable = Math.max(0, gross - totalDed);
  const tax = calcFromSlabs(taxable, CA_SLABS);
  return { grossIncome: gross, totalDeductions: totalDed, taxableIncome: taxable, tax, cess: 0, totalTax: tax, label: "With RRSP", breakdown: { "Basic Personal Amount": bpa, "RRSP": rrsp } };
}

function calcCABase(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const bpa = 15705;
  const taxable = Math.max(0, gross - bpa);
  const tax = calcFromSlabs(taxable, CA_SLABS);
  return { grossIncome: gross, totalDeductions: bpa, taxableIncome: taxable, tax, cess: 0, totalTax: tax, label: "Without RRSP", breakdown: { "Basic Personal Amount": bpa } };
}

// ═══════════════ AUSTRALIA ═══════════════
const AU_SLABS: TaxSlab[] = [
  { from: 0, to: 18200, rate: 0 }, { from: 18200, to: 45000, rate: 0.19 },
  { from: 45000, to: 120000, rate: 0.325 }, { from: 120000, to: 180000, rate: 0.37 },
  { from: 180000, to: Infinity, rate: 0.45 },
];

function calcAUWithSuper(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const superExtra = Math.min(input.superContribution, 27500);
  const taxable = Math.max(0, gross - superExtra);
  const tax = calcFromSlabs(taxable, AU_SLABS);
  const medicare = Math.round(taxable * 0.02);
  return { grossIncome: gross, totalDeductions: superExtra, taxableIncome: taxable, tax, cess: medicare, totalTax: tax + medicare, label: "With Extra Super", breakdown: { "Extra Super": superExtra, "Medicare Levy": medicare } };
}

function calcAUBase(input: TaxInput): TaxResult {
  const gross = input.grossIncome;
  const tax = calcFromSlabs(gross, AU_SLABS);
  const medicare = Math.round(gross * 0.02);
  return { grossIncome: gross, totalDeductions: 0, taxableIncome: gross, tax, cess: medicare, totalTax: tax + medicare, label: "Base", breakdown: { "Medicare Levy": medicare } };
}

// ═══════════════ UNIFIED API ═══════════════
export function calculateTaxComparison(input: TaxInput): { optionA: TaxResult; optionB: TaxResult } {
  switch (input.country) {
    case "IN": return { optionA: calcIndiaOld(input), optionB: calcIndiaNew(input) };
    case "US": return { optionA: calcUSStandard(input), optionB: calcUSItemized(input) };
    case "GB": return { optionA: calcUKWithRelief(input), optionB: calcUKBase(input) };
    case "CA": return { optionA: calcCAWithRRSP(input), optionB: calcCABase(input) };
    case "AU": return { optionA: calcAUWithSuper(input), optionB: calcAUBase(input) };
    default: return { optionA: calcUSStandard(input), optionB: calcUSItemized(input) };
  }
}

// ═══════════════ TAX SAVING SUGGESTIONS ═══════════════
export interface TaxSavingSuggestion {
  section: string;
  title: string;
  maxLimit: number;
  currentUsed: number;
  remaining: number;
  suggestions: string[];
}

export function getTaxSavingSuggestions(input: TaxInput): TaxSavingSuggestion[] {
  const results: TaxSavingSuggestion[] = [];

  if (input.country === "IN") {
    const s80C = Math.min(input.section80C, 150000);
    if (s80C < 150000) results.push({ section: "80C", title: "Section 80C Deductions", maxLimit: 150000, currentUsed: s80C, remaining: 150000 - s80C, suggestions: ["PPF (Public Provident Fund)", "ELSS Mutual Funds (3-yr lock-in)", "NSC, Tax-saver FDs", "Life Insurance Premium"] });
    const s80D = Math.min(input.section80D, 75000);
    if (s80D < 75000) results.push({ section: "80D", title: "Health Insurance (80D)", maxLimit: 75000, currentUsed: s80D, remaining: 75000 - s80D, suggestions: ["Self & family health insurance (₹25K)", "Parents' health insurance (₹25–50K)", "Preventive health check-up (₹5K)"] });
    const nps = Math.min(input.nps80CCD, 50000);
    if (nps < 50000) results.push({ section: "80CCD(1B)", title: "NPS Extra Deduction", maxLimit: 50000, currentUsed: nps, remaining: 50000 - nps, suggestions: ["Additional NPS contribution for extra ₹50K deduction", "This is over and above the 80C limit"] });
  }

  if (input.country === "US") {
    const k = Math.min(input.filing401k, 23000);
    if (k < 23000) results.push({ section: "401(k)", title: "401(k) Contribution", maxLimit: 23000, currentUsed: k, remaining: 23000 - k, suggestions: ["Maximize employer match first", "Pre-tax reduces taxable income", "Catch-up if 50+: extra $7,500"] });
    const ira = Math.min(input.iraContribution, 7000);
    if (ira < 7000) results.push({ section: "IRA", title: "IRA Contribution", maxLimit: 7000, currentUsed: ira, remaining: 7000 - ira, suggestions: ["Traditional IRA for tax deduction", "Roth IRA for tax-free growth", "Backdoor Roth if income too high"] });
    const hsa = Math.min(input.hsaContribution, 4150);
    if (hsa < 4150) results.push({ section: "HSA", title: "Health Savings Account", maxLimit: 4150, currentUsed: hsa, remaining: 4150 - hsa, suggestions: ["Triple tax advantage", "Invest HSA balance for growth", "Use for medical expenses tax-free"] });
  }

  if (input.country === "GB") {
    const pen = Math.min(input.pensionContribution, 60000);
    if (pen < 60000) results.push({ section: "Pension", title: "Pension Contributions", maxLimit: 60000, currentUsed: pen, remaining: 60000 - pen, suggestions: ["Tax relief at your marginal rate", "Employer pension matching", "SIPP for self-employed"] });
    const isa = Math.min(input.isaContribution, 20000);
    if (isa < 20000) results.push({ section: "ISA", title: "ISA Allowance", maxLimit: 20000, currentUsed: isa, remaining: 20000 - isa, suggestions: ["Stocks & Shares ISA for growth", "Cash ISA for safety", "LISA for first home (25% bonus)"] });
  }

  if (input.country === "CA") {
    const rrsp = Math.min(input.rrspContribution, 31560);
    if (rrsp < 31560) results.push({ section: "RRSP", title: "RRSP Contribution", maxLimit: 31560, currentUsed: rrsp, remaining: 31560 - rrsp, suggestions: ["Tax-deferred growth", "Home Buyers' Plan (HBP)", "Employer matching RRSP"] });
    const tfsa = Math.min(input.tfsaContribution, 7000);
    if (tfsa < 7000) results.push({ section: "TFSA", title: "TFSA Contribution", maxLimit: 7000, currentUsed: tfsa, remaining: 7000 - tfsa, suggestions: ["Tax-free growth & withdrawals", "No impact on government benefits", "Invest in ETFs within TFSA"] });
  }

  if (input.country === "AU") {
    const sup = Math.min(input.superContribution, 27500);
    if (sup < 27500) results.push({ section: "Super", title: "Super Contribution", maxLimit: 27500, currentUsed: sup, remaining: 27500 - sup, suggestions: ["Salary sacrifice into super", "Concessional at 15% tax rate", "Co-contribution if income < $58K"] });
  }

  return results;
}
