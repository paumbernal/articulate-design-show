import { Input } from "@/components/ui/input";
import type { TargetProbabilities } from "../types";
import { formatCurrency, formatPercent } from "../lib/formatters";

interface TargetProbabilityPanelProps {
  startingBalance: number;
  targetBalance: number;
  onTargetBalanceChange: (value: number) => void;
  probabilities: TargetProbabilities;
}

const TargetProbabilityPanel = ({
  startingBalance,
  targetBalance,
  onTargetBalanceChange,
  probabilities,
}: TargetProbabilityPanelProps) => {
  return (
    <div className="border border-foreground/10 rounded-xl p-4 md:p-5 bg-foreground/[0.02]">
      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-3">Target Probabilities</p>

      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5 block">Account Target</label>
        <div className="relative max-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
          <Input
            type="number"
            min={startingBalance}
            className="pl-6"
            value={targetBalance}
            onChange={(e) => onTargetBalanceChange(Number(e.target.value) || startingBalance)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-emerald-500/25 bg-emerald-500/[0.06] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Reaches target (any point)</p>
          <p className="font-bold text-lg text-emerald-500">{formatPercent(probabilities.probReachTargetAnyPoint, 1)}</p>
        </div>
        <div className="border border-foreground/10 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Finishes at/above target</p>
          <p className="font-bold text-lg">{formatPercent(probabilities.probFinishAtOrAboveTarget, 1)}</p>
        </div>
        <div className="border border-red-500/25 bg-red-500/[0.06] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Finishes below start</p>
          <p className="font-bold text-lg text-red-500">{formatPercent(probabilities.probFinishBelowStart, 1)}</p>
        </div>
      </div>
      <p className="text-[10px] text-text-faded mt-3">
        "Reaches target" counts a path if its balance touches the target at any point in the simulated horizon, even if it
        pulls back afterward. That's different from finishing there.
      </p>
    </div>
  );
};

export default TargetProbabilityPanel;
