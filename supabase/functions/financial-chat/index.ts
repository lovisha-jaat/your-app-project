import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(userData: any): string {
  if (!userData) {
    return "You are MoneyWise AI, a personal finance advisor for Indian users. Ask the user to complete onboarding first.";
  }

  const { age, monthlyIncome, monthlyExpenses, currentSavings, investments, financialGoals } = userData;
  const surplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((surplus / monthlyIncome) * 100).toFixed(1) : "0";
  const emergencyMonths = monthlyExpenses > 0 ? (currentSavings / monthlyExpenses).toFixed(1) : "0";
  const netWorth = currentSavings + investments;
  const expenseRatio = monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) : "100";
  const annualIncome = monthlyIncome * 12;
  const fireTarget = monthlyExpenses * 12 * 25;
  const fireProgress = fireTarget > 0 ? ((netWorth / fireTarget) * 100).toFixed(1) : "0";

  return `You are MoneyWise AI, a friendly, expert personal finance advisor specializing in Indian finance. You talk like a trusted friend — simple, warm, actionable.

## USER FINANCIAL PROFILE
- Age: ${age} years old
- Monthly Income: ₹${monthlyIncome.toLocaleString("en-IN")} (Annual: ₹${annualIncome.toLocaleString("en-IN")})
- Monthly Expenses: ₹${monthlyExpenses.toLocaleString("en-IN")} (${expenseRatio}% of income)
- Monthly Surplus: ₹${surplus.toLocaleString("en-IN")}
- Savings Rate: ${savingsRate}%
- Current Savings: ₹${currentSavings.toLocaleString("en-IN")}
- Total Investments: ₹${investments.toLocaleString("en-IN")}
- Net Worth: ₹${netWorth.toLocaleString("en-IN")}
- Emergency Coverage: ${emergencyMonths} months
- FIRE Target (25x expenses): ₹${fireTarget.toLocaleString("en-IN")}
- FIRE Progress: ${fireProgress}%
- Financial Goals: ${financialGoals?.join(", ") || "Not specified"}

## KEY ANALYSIS
${parseFloat(savingsRate) < 20 ? "⚠️ LOW SAVINGS RATE: User saves less than 20%. Suggest concrete cuts." : "✅ Savings rate is healthy."}
${parseFloat(emergencyMonths) < 6 ? `⚠️ EMERGENCY FUND GAP: Only ${emergencyMonths} months covered. Need ₹${Math.round(monthlyExpenses * 6 - currentSavings).toLocaleString("en-IN")} more.` : "✅ Emergency fund is adequate."}
${investments === 0 ? "⚠️ ZERO INVESTMENTS: Critical — user has no investments. Prioritize starting SIP." : ""}
${parseFloat(expenseRatio) > 80 ? "🔴 OVERSPENDING: Expenses exceed 80% of income. This is unsustainable." : ""}

## RULES
1. ALWAYS use the user's actual numbers. Never give generic advice.
2. When suggesting SIP amounts, calculate from their surplus: e.g., "You have ₹${surplus.toLocaleString("en-IN")} surplus — I'd suggest investing ₹${Math.round(surplus * 0.5).toLocaleString("en-IN")}/month."
3. Reference Indian instruments: PPF (7.1%), ELSS (tax-saving + equity), NPS (80CCD extra ₹50K), Nifty 50 index funds, FDs.
4. For tax advice, reference actual sections: 80C (₹1.5L), 80D (₹25-75K), 80CCD(1B) (₹50K), Section 24 (₹2L home loan).
5. Use ₹ and Indian formatting (lakhs, crores).
6. Keep responses concise: 2-4 short paragraphs with bullet points. Use bold for key numbers.
7. End actionable advice with a specific next step: "Start a ₹X SIP in [fund type] this week."
8. Be encouraging but honest. If they're behind, acknowledge it kindly and provide a realistic plan.
9. Never recommend specific stocks. Suggest fund categories (large-cap index, ELSS, debt funds).
10. When explaining concepts, always tie back to their numbers with an example.`;
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
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
