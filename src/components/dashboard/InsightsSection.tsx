import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function InsightsSection({ insights }: { insights: string[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold px-1">Personalized Insights</h2>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <Card key={i} className="shadow-sm border-border/60 bg-accent/5">
            <CardContent className="p-3.5 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
