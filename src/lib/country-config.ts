export type CountryCode = "IN" | "US" | "GB" | "CA" | "AU";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: { symbol: string; code: string; locale: string };
  retirementAge: number;
  financialInstruments: string[];
  taxSections: string[];
  speechLang: string;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  IN: {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: { symbol: "₹", code: "INR", locale: "en-IN" },
    retirementAge: 60,
    financialInstruments: ["PPF", "ELSS", "NPS", "SIP", "FD", "EPF"],
    taxSections: ["80C", "80D", "80CCD(1B)", "Section 24"],
    speechLang: "en-IN",
  },
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: { symbol: "$", code: "USD", locale: "en-US" },
    retirementAge: 65,
    financialInstruments: ["401(k)", "IRA", "Roth IRA", "Index Funds", "S&P 500", "HSA"],
    taxSections: ["Standard Deduction", "401(k)", "IRA", "HSA"],
    speechLang: "en-US",
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: { symbol: "£", code: "GBP", locale: "en-GB" },
    retirementAge: 67,
    financialInstruments: ["ISA", "SIPP", "Pension", "Stocks & Shares ISA", "LISA"],
    taxSections: ["Personal Allowance", "ISA", "Pension Relief", "Marriage Allowance"],
    speechLang: "en-GB",
  },
  CA: {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: { symbol: "C$", code: "CAD", locale: "en-CA" },
    retirementAge: 65,
    financialInstruments: ["RRSP", "TFSA", "FHSA", "GIC", "Index Funds"],
    taxSections: ["RRSP", "TFSA", "Basic Personal Amount", "FHSA"],
    speechLang: "en-CA",
  },
  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: { symbol: "A$", code: "AUD", locale: "en-AU" },
    retirementAge: 67,
    financialInstruments: ["Super", "ETFs", "Term Deposits", "Shares"],
    taxSections: ["Super Contributions", "Negative Gearing", "Tax-Free Threshold", "HELP Repayment"],
    speechLang: "en-AU",
  },
};

export function detectCountry(): CountryCode {
  try {
    const lang = navigator.language || navigator.languages?.[0] || "en-US";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    if (lang.includes("IN") || tz.includes("Kolkata") || tz.includes("Calcutta")) return "IN";
    if (lang.includes("GB") || tz.includes("London")) return "GB";
    if (lang.includes("AU") || tz.includes("Sydney") || tz.includes("Melbourne")) return "AU";
    if (lang.includes("CA") || tz.includes("Toronto") || tz.includes("Vancouver")) return "CA";
    if (lang.includes("US") || tz.includes("America")) return "US";

    return "US"; // default
  } catch {
    return "US";
  }
}

export function getCountryConfig(code: CountryCode): CountryConfig {
  return COUNTRIES[code];
}

export function formatCurrency(amount: number, country: CountryCode): string {
  const config = COUNTRIES[country];
  return `${config.currency.symbol}${amount.toLocaleString(config.currency.locale)}`;
}

export function formatCurrencyCompact(amount: number, country: CountryCode): string {
  const config = COUNTRIES[country];
  if (country === "IN") {
    if (amount >= 10000000) return `${config.currency.symbol}${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${config.currency.symbol}${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000000) return `${config.currency.symbol}${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${config.currency.symbol}${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount, country);
}
