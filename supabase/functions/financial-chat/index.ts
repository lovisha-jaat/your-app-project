import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COUNTRY_CONFIG: Record<string, { currency: string; locale: string; instruments: string; taxInfo: string }> = {
  IN: {
    currency: "₹", locale: "en-IN",
    instruments: "PPF (7.1%), ELSS, NPS, Nifty 50 index funds, FDs, SIPs",
    taxInfo: "For tax: reference 80C (₹1.5L), 80D (₹25-75K), 80CCD(1B) (₹50K), Section 24 (₹2L). Use Indian number format (lakhs, crores).",
  },
  US: {
    currency: "$", locale: "en-US",
    instruments: "401(k), Roth IRA, Traditional IRA, S&P 500 index funds, HSA, Treasury bonds",
    taxInfo: "For tax: reference Standard Deduction ($14,600), 401(k) ($23,000 limit), IRA ($7,000 limit), HSA ($4,150 limit). Use US dollar formatting.",
  },
  GB: {
    currency: "£", locale: "en-GB",
    instruments: "ISA, Stocks & Shares ISA, SIPP, Workplace Pension, LISA, Premium Bonds",
    taxInfo: "For tax: reference Personal Allowance (£12,570), ISA (£20,000), Pension Annual Allowance (£60,000), LISA (£4,000 + 25% bonus). Use British pound formatting.",
  },
  CA: {
    currency: "C$", locale: "en-CA",
    instruments: "RRSP, TFSA, FHSA, GICs, Canadian index ETFs, CPP",
    taxInfo: "For tax: reference RRSP (18% of income, max C$31,560), TFSA (C$7,000), Basic Personal Amount (C$15,705), FHSA (C$8,000). Use Canadian dollar formatting.",
  },
  AU: {
    currency: "A$", locale: "en-AU",
    instruments: "Superannuation, ETFs, Term Deposits, Australian shares, Govt bonds",
    taxInfo: "For tax: reference Super contributions (A$27,500 concessional cap), Tax-Free Threshold (A$18,200), Medicare Levy (2%), HELP repayment. Use Australian dollar formatting.",
  },
};

function buildSystemPrompt(userData: any): string {
  if (!userData) {
    return "You are FinMentor AI, a personal finance advisor. Ask the user to complete onboarding first.";
  }

  const { age, monthlyIncome, monthlyExpenses, currentSavings, investments, financialGoals, country } = userData;
  const cc = COUNTRY_CONFIG[country] || COUNTRY_CONFIG["US"];
  const sym = cc.currency;
  const locale = cc.locale;

  const fmt = (n: number) => `${sym}${n.toLocaleString(locale)}`;
  const surplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((surplus / monthlyIncome) * 100).toFixed(1) : "0";
  const emergencyMonths = monthlyExpenses > 0 ? (currentSavings / monthlyExpenses).toFixed(1) : "0";
  const netWorth = currentSavings + investments;
  const expenseRatio = monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) : "100";
  const annualIncome = monthlyIncome * 12;
  const fireTarget = monthlyExpenses * 12 * 25;
  const fireProgress = fireTarget > 0 ? ((netWorth / fireTarget) * 100).toFixed(1) : "0";

  return `You are FinMentor AI — a warm, knowledgeable personal finance mentor. You speak like a trusted friend who happens to be a finance expert.

## USER'S COUNTRY: ${country}
## CURRENCY: ${sym}

## USER'S COMPLETE FINANCIAL SNAPSHOT
- Age: ${age} years
- Monthly Income: ${fmt(monthlyIncome)} (Annual: ${fmt(annualIncome)})
- Monthly Expenses: ${fmt(monthlyExpenses)} (${expenseRatio}% of income)
- Monthly Surplus: ${fmt(surplus)}
- Savings Rate: ${savingsRate}%
- Current Savings: ${fmt(currentSavings)}
- Total Investments: ${fmt(investments)}
- Net Worth: ${fmt(netWorth)}
- Emergency Fund Coverage: ${emergencyMonths} months of expenses
- FIRE Target (25x annual expenses): ${fmt(fireTarget)}
- FIRE Progress: ${fireProgress}%
- Financial Goals: ${financialGoals?.join(", ") || "Not specified"}

## ALERTS
${parseFloat(savingsRate) < 20 ? `⚠️ LOW SAVINGS: Only ${savingsRate}% savings rate. Ideal is 20%+.` : "✅ Savings rate healthy."}
${parseFloat(emergencyMonths) < 6 ? `⚠️ EMERGENCY GAP: Only ${emergencyMonths} months covered. Gap: ${fmt(Math.max(0, Math.round(monthlyExpenses * 6 - currentSavings)))}.` : "✅ Emergency fund adequate."}
${investments === 0 ? "🔴 NO INVESTMENTS: Zero invested. Must start ASAP." : ""}
${parseFloat(expenseRatio) > 80 ? "🔴 OVERSPENDING: Expenses >80% of income." : ""}

## CRITICAL RESPONSE RULES
1. **GREETINGS:** If the user's message includes a greeting, start with a warm acknowledgment. If the same message ALSO contains a question, answer that immediately after the greeting in the SAME response.
2. **ANSWER EXACTLY WHAT THEY ASKED.** Do NOT default to a generic overview.
3. ALWAYS plug in their real numbers. Never say "your income" — say "your ${fmt(monthlyIncome)}/month".
4. Calculate specific amounts: "From your ${fmt(surplus)} surplus, put ${sym}X here, ${sym}Y there."
5. Keep it SHORT: 2-3 paragraphs max. Use bullet points for action items.
7. End every response with ONE specific next step they can do TODAY.
8. Use financial instruments relevant to the user's country: ${cc.instruments}
9. ${cc.taxInfo}
10. NEVER repeat the same structure or opening line. Vary your response style.
11. If you don't know something, say so. Never make up numbers.
12. Be warm and encouraging, but direct and honest. Talk like a friendly mentor, not a robot.
13. Never recommend specific stocks. Suggest fund categories only.
14. Always use ${sym} currency symbol and ${locale} number formatting.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = buildSystemPrompt(userData);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
