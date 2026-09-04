import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Session } from "../../types";

interface BacktestConfigFormProps {
  minEdgeScore: number;
  maxScore: number;
  onMinEdgeScoreChange: (value: number) => void;
  session: Session | "ANY";
  onSessionChange: (value: Session | "ANY") => void;
}

const BacktestConfigForm = ({
  minEdgeScore,
  maxScore,
  onMinEdgeScoreChange,
  session,
  onSessionChange,
}: BacktestConfigFormProps) => {
  // Local display value, decoupled from the parent's fetch-triggering
  // state: dragging updates this on every pixel for smooth visual
  // feedback, but only commits to the parent (and therefore refetches the
  // backtest) once, on release — via onValueCommit, not onValueChange.
  const [displayValue, setDisplayValue] = useState(minEdgeScore);

  useEffect(() => {
    setDisplayValue(minEdgeScore);
  }, [minEdgeScore]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02]">
      <div className="flex-1 min-w-[220px]">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="min-edge-score" className="text-[10px] uppercase tracking-wide text-text-muted">
            Min Edge Score
          </label>
          <span className="text-xs font-bold">{displayValue}</span>
        </div>
        <Slider
          id="min-edge-score"
          min={0}
          max={maxScore}
          step={1}
          value={[displayValue]}
          onValueChange={([v]) => setDisplayValue(v)}
          onValueCommit={([v]) => onMinEdgeScoreChange(v)}
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-text-muted mb-2 block">Session</label>
        <Select value={session} onValueChange={(v) => onSessionChange(v as Session | "ANY")}>
          <SelectTrigger className="w-[120px] text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY" className="text-xs">
              Any
            </SelectItem>
            <SelectItem value="RTH" className="text-xs">
              RTH
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BacktestConfigForm;
