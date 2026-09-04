import type { ComponentScore } from "../../types";

interface EdgeScoreBadgeProps {
  score: number;
  maxScore: number;
  componentScores: ComponentScore[];
}

const SIGNAL_LABELS: Record<string, string> = {
  poc_sweep: "POC Sweep",
  absorption: "Absorption",
  delta_divergence: "Delta Divergence",
};

const EdgeScoreBadge = ({ score, maxScore, componentScores }: EdgeScoreBadgeProps) => {
  const pct = maxScore > 0 ? score / maxScore : 0;

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <div className="flex items-baseline gap-1.5">
        <span className="font-bold text-lg">{score.toFixed(0)}</span>
        <span className="text-xs text-text-muted">/ {maxScore.toFixed(0)}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-500"
          style={{ width: `${Math.min(pct * 100, 100)}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {componentScores.map((c) => (
          <span
            key={c.signalType}
            title={`${SIGNAL_LABELS[c.signalType] ?? c.signalType}: ${c.present ? `+${c.weight}` : "absent"}`}
            className={`text-[9px] px-1.5 py-0.5 rounded border ${
              c.present
                ? "border-foreground/25 text-foreground"
                : "border-foreground/5 text-text-faded line-through"
            }`}
          >
            {(SIGNAL_LABELS[c.signalType] ?? c.signalType).split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EdgeScoreBadge;
