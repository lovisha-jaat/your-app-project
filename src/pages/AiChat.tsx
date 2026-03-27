import { useState, useRef, useEffect } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, Volume2, VolumeX, Square, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`;

const QUICK_PROMPTS = [
  { label: "💰 Tax savings tips", text: "What tax-saving options do I have based on my income? Give me specific amounts for 80C, 80D, and NPS." },
  { label: "📈 Start investing", text: "I want to start investing. Based on my surplus, suggest a specific SIP plan with fund types and amounts." },
  { label: "🛡️ Emergency fund", text: "How much should my emergency fund be? What's my current gap and how fast can I fill it?" },
  { label: "🔥 FIRE plan", text: "Can I retire early? What monthly investment do I need to reach financial independence?" },
  { label: "💸 Cut expenses", text: "My expenses seem high. Give me a practical budget breakdown and savings targets." },
  { label: "🎯 My goals", text: "Based on my financial goals, create a priority-ordered action plan with timelines." },
];

// Strip markdown for TTS
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[-*+]\s/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/₹/g, "rupees ")
    .trim();
}

export default function AiChat() {
  const { userData, isOnboarded } = useUserData();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not supported", description: "Speech recognition is not supported in your browser. Try Chrome.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim = transcript;
        }
      }
      setInput(finalTranscript || interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== "no-speech") {
        toast({ title: "Mic error", description: `Could not recognize speech: ${event.error}`, variant: "destructive" });
      }
    };

    recognition.start();
  };

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  const speak = (text: string, index: number) => {
    if (speakingIdx === index) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to pick an Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === "en-IN") || voices.find(v => v.lang.startsWith("en"));
    if (indianVoice) utterance.voice = indianVoice;

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(index);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingIdx(null);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          userData,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to get AI response. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-14">
      {/* Header */}
      <div className="bg-card px-4 pt-6 pb-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">MoneyWise AI</h1>
            <p className="text-xs text-muted-foreground">
              Knows your ₹{userData.monthlyIncome.toLocaleString("en-IN")}/mo profile
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">Hi! I'm your AI Financial Advisor</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                I know your income, expenses, savings & goals. Ask me anything — I'll give you specific, actionable advice.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2 flex items-center justify-center gap-1">
                <Volume2 className="w-3 h-3" /> Tap the speaker icon to hear responses read aloud
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.text)}
                  className="text-xs text-left p-3 rounded-xl border border-border/60 text-foreground/80 hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-[0.97]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className="flex flex-col max-w-[80%]">
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/50 rounded-bl-md shadow-sm"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {/* Audio button for assistant messages */}
              {msg.role === "assistant" && !isLoading && (
                <button
                  onClick={() => speakingIdx === i ? stopSpeaking() : speak(msg.content, i)}
                  className={cn(
                    "mt-1.5 self-start flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors",
                    speakingIdx === i
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {speakingIdx === i ? (
                    <>
                      <Square className="w-3 h-3" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      Listen
                    </>
                  )}
                </button>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/40 bg-card px-4 py-3 shrink-0 mb-14">
        <div className="flex gap-2 items-end max-w-lg mx-auto">
          <Button
            size="icon"
            variant={isListening ? "default" : "outline"}
            onClick={toggleListening}
            disabled={isLoading}
            className={cn("rounded-xl h-10 w-10 shrink-0", isListening && "animate-pulse bg-destructive hover:bg-destructive/90")}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask about your finances..."}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-24 overflow-y-auto"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="rounded-xl h-10 w-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
