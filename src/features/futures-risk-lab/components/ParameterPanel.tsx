import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Dices } from "lucide-react";
import type { SimulationConfig } from "../types";
import { MAX_SIMULATIONS, MAX_TRADES, MIN_SIMULATIONS, MIN_TRADES } from "../lib/defaults";

interface ParameterPanelProps {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
  disabled?: boolean;
}

function Field({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] uppercase tracking-wide text-text-muted">{label}</label>
        <span className="text-xs font-bold">{value}</span>
      </div>
      {children}
    </div>
  );
}

const ParameterPanel = ({ config, onChange, disabled }: ParameterPanelProps) => {
  const [seedDisplay, setSeedDisplay] = useState(config.seed);
  useEffect(() => setSeedDisplay(config.seed), [config.seed]);

  const isSynthetic = config.mode === "synthetic";

  return (
    <div className="border border-foreground/10 rounded-xl p-4 md:p-5 bg-foreground/[0.02] space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Starting Balance</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
          <Input
            type="number"
            min={1}
            className="pl-6"
            value={config.startingBalance}
            disabled={disabled}
            onChange={(e) => onChange({ ...config, startingBalance: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Risk Per Trade</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
          <Input
            type="number"
            min={1}
            className="pl-6"
            value={config.riskPerTrade}
            disabled={disabled}
            onChange={(e) => onChange({ ...config, riskPerTrade: Number(e.target.value) || 0 })}
          />
        </div>
        <p className="text-[10px] text-text-faded mt-1">This is what "1R" means in dollar terms.</p>
      </div>

      {isSynthetic && (
        <>
          <Field label="Win Rate" value={`${(config.synthetic.winRate * 100).toFixed(0)}%`}>
            <Slider
              min={1}
              max={99}
              step={1}
              disabled={disabled}
              value={[config.synthetic.winRate * 100]}
              onValueChange={([v]) =>
                onChange({ ...config, synthetic: { ...config.synthetic, winRate: v / 100 } })
              }
            />
          </Field>

          <Field label="Avg Winning Trade" value={`+${config.synthetic.avgWinR.toFixed(2)}R`}>
            <Slider
              min={0.1}
              max={5}
              step={0.1}
              disabled={disabled}
              value={[config.synthetic.avgWinR]}
              onValueChange={([v]) => onChange({ ...config, synthetic: { ...config.synthetic, avgWinR: v } })}
            />
          </Field>

          <Field label="Avg Losing Trade" value={`-${config.synthetic.avgLossR.toFixed(2)}R`}>
            <Slider
              min={0.1}
              max={5}
              step={0.1}
              disabled={disabled}
              value={[config.synthetic.avgLossR]}
              onValueChange={([v]) => onChange({ ...config, synthetic: { ...config.synthetic, avgLossR: v } })}
            />
          </Field>
        </>
      )}

      <Field label="Number of Trades" value={config.numTrades.toLocaleString()}>
        <Slider
          min={MIN_TRADES}
          max={MAX_TRADES}
          step={10}
          disabled={disabled}
          value={[config.numTrades]}
          onValueChange={([v]) => onChange({ ...config, numTrades: v })}
        />
      </Field>

      <Field label="Number of Simulations" value={config.numSimulations.toLocaleString()}>
        <Slider
          min={MIN_SIMULATIONS}
          max={MAX_SIMULATIONS}
          step={100}
          disabled={disabled}
          value={[config.numSimulations]}
          onValueChange={([v]) => onChange({ ...config, numSimulations: v })}
        />
      </Field>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Random Seed</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={seedDisplay}
            disabled={disabled}
            onChange={(e) => setSeedDisplay(Number(e.target.value) || 0)}
            onBlur={() => onChange({ ...config, seed: seedDisplay })}
          />
          <button
            type="button"
            title="Randomize seed"
            disabled={disabled}
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md border border-input text-text-muted hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
            onClick={() => {
              const next = Math.floor(Math.random() * 1_000_000);
              setSeedDisplay(next);
              onChange({ ...config, seed: next });
            }}
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-text-faded mt-1">Same seed + same inputs always reproduce the same paths.</p>
      </div>
    </div>
  );
};

export default ParameterPanel;
