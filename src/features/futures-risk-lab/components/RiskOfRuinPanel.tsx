import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatPercent } from "../lib/formatters";

interface RiskOfRuinPanelProps {
  startingBalance: number;
  ruinThresholdPct: number;
  onRuinThresholdPctChange: (value: number) => void;
  riskOfRuin: number;
}

const RiskOfRuinPanel = ({ startingBalance, ruinThresholdPct, onRuinThresholdPctChange, riskOfRuin }: RiskOfRuinPanelProps) => {
  const floorDollars = startingBalance * (ruinThresholdPct / 100);

  return (
    <div className="border border-foreground/10 rounded-xl p-4 md:p-5 bg-foreground/[0.02]">
      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-3">Risk of Ruin</p>
      <p className="text-sm text-foreground/70 leading-relaxed mb-4">
        "Ruin" is defined here as the account balance falling to or below{" "}
        <span className="font-bold text-foreground">{formatPercent(ruinThresholdPct / 100, 0)}</span> of the
        starting balance (<span className="font-bold text-foreground">{formatCurrency(floorDollars)}</span>){" "}
        <em>at any point</em> during the simulated trade sequence, not just at the end. Adjust the definition below.
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] uppercase tracking-wide text-text-muted">Ruin Threshold (% of start)</label>
          <span className="text-xs font-bold">{ruinThresholdPct}%</span>
        </div>
        <Slider min={5} max={90} step={5} value={[ruinThresholdPct]} onValueChange={([v]) => onRuinThresholdPctChange(v)} />
      </div>

      <div className="border border-red-500/25 bg-red-500/[0.06] rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">
          P(balance ever ≤ {formatCurrency(floorDollars)})
        </p>
        <p className="font-bold text-2xl text-red-500">{formatPercent(riskOfRuin, 1)}</p>
      </div>
    </div>
  );
};

export default RiskOfRuinPanel;
