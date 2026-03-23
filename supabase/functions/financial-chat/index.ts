import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are MoneyWise AI, a friendly and knowledgeable personal finance advisor for Indian users. You speak in simple, clear language — avoid jargon.

You have access to the user's financial data:
${userData ? `
- Age: ${userData.age}
- Monthly Income: ₹${userData.monthlyIncome?.toLocaleString("en-IN")}
- Monthly Expenses: ₹${userData.monthlyExpenses?.toLocaleString("en-IN")}
- Monthly Surplus: ₹${(userData.monthlyIncome - userData.monthlyExpenses)?.toLocaleString("en-IN")}
- Current Savings: ₹${userData.currentSavings?.toLocaleString("en-IN")}
- Investments: ₹${userData.investments?.toLocaleString("en-IN")}
- Financial Goals: ${userData.financialGoals?.join(", ") || "Not specified"}
` : "No financial data available yet."}

Guidelines:
- Always personalize advice using the user's actual numbers
- Suggest specific SIP amounts, tax-saving instruments (80C, 80D, NPS), and budgeting strategies
- When discussing investments, mention Indian instruments: PPF, ELSS, NPS, FDs, index funds, Nifty 50
- Use ₹ for currency and Indian number formatting (lakhs, crores)
- Keep responses concise (2-4 paragraphs max) unless asked for detail
- If asked about concepts, explain them simply with examples using the user's numbers
- Be encouraging but honest about financial gaps
- Never give specific stock picks or guarantee returns`;

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
