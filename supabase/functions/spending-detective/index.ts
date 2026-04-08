import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transactions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ analysis: "No transactions to analyze yet. Start adding your expenses to get AI-powered spending insights!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a friendly AI Spending Detective for students. Analyze the user's transaction data and provide:

1. **🔍 Spending Patterns**: Identify recurring patterns (daily coffee, frequent takeout, subscription habits)
2. **🚨 Overspending Alerts**: Flag categories where spending seems unusually high compared to their income or other categories
3. **📊 Weekly vs Monthly Trends**: Compare recent spending to earlier periods - is spending increasing or decreasing?
4. **💸 Unnecessary Expenses**: Identify potential unnecessary or avoidable expenses
5. **💡 Smart Suggestions**: Give 3-5 actionable, student-friendly tips to reduce spending

Keep language simple, fun, and encouraging. Use emojis. Format with markdown headers and bullet points.
Don't be judgmental - be supportive like a helpful friend. Reference specific amounts and categories from their data.`;

    const txSummary = JSON.stringify(transactions.map((t: any) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.transaction_date,
      description: t.description,
    })));

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
          { role: "user", content: `Here are my recent transactions:\n${txSummary}\n\nAnalyze my spending and give me insights!` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("spending-detective error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
