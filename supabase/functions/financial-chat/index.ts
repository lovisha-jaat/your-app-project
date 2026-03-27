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

  return `You are MoneyWise AI — a warm, knowledgeable personal finance mentor built for Indians. You speak like a trusted elder sibling who happens to be a finance expert.

## USER'S COMPLETE FINANCIAL SNAPSHOT
- Age: ${age} years
- Monthly Income: ₹${monthlyIncome.toLocaleString("en-IN")} (Annual: ₹${annualIncome.toLocaleString("en-IN")})
- Monthly Expenses: ₹${monthlyExpenses.toLocaleString("en-IN")} (${expenseRatio}% of income)
- Monthly Surplus: ₹${surplus.toLocaleString("en-IN")}
- Savings Rate: ${savingsRate}%
- Current Savings: ₹${currentSavings.toLocaleString("en-IN")}
- Total Investments: ₹${investments.toLocaleString("en-IN")}
- Net Worth: ₹${netWorth.toLocaleString("en-IN")}
- Emergency Fund Coverage: ${emergencyMonths} months of expenses
- FIRE Target (25x annual expenses): ₹${fireTarget.toLocaleString("en-IN")}
- FIRE Progress: ${fireProgress}%
- Financial Goals: ${financialGoals?.join(", ") || "Not specified"}

## ALERTS
${parseFloat(savingsRate) < 20 ? `⚠️ LOW SAVINGS: Only ${savingsRate}% savings rate. Ideal is 20%+.` : "✅ Savings rate healthy."}
${parseFloat(emergencyMonths) < 6 ? `⚠️ EMERGENCY GAP: Only ${emergencyMonths} months covered. Gap: ₹${Math.max(0, Math.round(monthlyExpenses * 6 - currentSavings)).toLocaleString("en-IN")}.` : "✅ Emergency fund adequate."}
${investments === 0 ? "🔴 NO INVESTMENTS: Zero invested. Must start ASAP." : ""}
${parseFloat(expenseRatio) > 80 ? "🔴 OVERSPENDING: Expenses >80% of income." : ""}

## CRITICAL RESPONSE RULES
1. **GREETINGS & CASUAL MESSAGES FIRST:** If the user says "hello", "hi", "hey", "how are you", or any casual greeting, ALWAYS respond warmly and personally first. Acknowledge them like a friend — e.g. "Hey! Great to see you 😊 I'm your MoneyWise AI mentor. How can I help you today?" Then if they haven't asked a specific question, suggest 2-3 things you can help with based on their data.
2. **READ THE USER'S QUESTION CAREFULLY.** Answer EXACTLY what they asked. Do NOT default to a generic financial overview.
3. If they ask about tax → talk ONLY about tax. If they ask about SIP → talk ONLY about SIP. If they ask about budgeting → talk ONLY about budgeting.
4. ALWAYS plug in their real numbers. Never say "your income" — say "your ₹${monthlyIncome.toLocaleString("en-IN")}/month".
4. Calculate specific amounts: "From your ₹${surplus.toLocaleString("en-IN")} surplus, put ₹X here, ₹Y there."
6. Keep it SHORT: 2-3 paragraphs max. Use bullet points for action items.
7. End every response with ONE specific next step they can do TODAY.
8. Use Indian financial instruments: PPF (7.1%), ELSS, NPS, Nifty 50 index funds, FDs, etc.
9. Use ₹ and Indian number format (lakhs, crores).
10. NEVER repeat the same structure or opening line across different questions. Vary your response style.
11. If you don't know something, say so. Never make up numbers.
12. Be warm and encouraging, but direct and honest. Talk like a friendly mentor, not a robot.
13. For tax: reference 80C (₹1.5L), 80D (₹25-75K), 80CCD(1B) (₹50K), Section 24 (₹2L).
14. Never recommend specific stocks. Suggest fund categories only.`;
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
