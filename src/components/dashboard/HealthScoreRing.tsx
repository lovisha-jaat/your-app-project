import { useEffect, useState } from "react";
import { getScoreLabel, getScoreColor } from "@/lib/financial-calculations";

interface HealthScoreRingProps {
  score: number;
  size?: number;
}

export default function HealthScoreRing({ score, size = 180 }: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  useEffect(() => {
    let frame: number;
    let current = 0;
    const step = () => {
      current += Math.max(1, (score - current) * 0.08);
      if (current >= score) {
        setAnimatedScore(score);
        return;
      }
      setAnimatedScore(Math.round(current));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2 score-ring">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>{animatedScore}</span>
        <span className="text-xs font-medium text-muted-foreground mt-0.5">{label}</span>
      </div>
    </div>
  );
}
