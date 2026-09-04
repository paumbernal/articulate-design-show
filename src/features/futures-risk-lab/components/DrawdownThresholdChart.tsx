import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { computeDrawdownThresholdProbabilities } from "../lib/riskMetrics";
import { formatPercent } from "../lib/formatters";
import { DEFAULT_DRAWDOWN_THRESHOLDS_PCT } from "../lib/defaults";

interface DrawdownThresholdChartProps {
  maxDrawdownPcts: Float64Array;
}

const DrawdownThresholdChart = ({ maxDrawdownPcts }: DrawdownThresholdChartProps) => {
  const [customThreshold, setCustomThreshold] = useState(40);

  const thresholds = useMemo(() => {
    const set = new Set([...DEFAULT_DRAWDOWN_THRESHOLDS_PCT, customThreshold]);
    return Array.from(set).sort((a, b) => a - b);
  }, [customThreshold]);

  const results = useMemo(
    () => computeDrawdownThresholdProbabilities(maxDrawdownPcts, thresholds),
    [maxDrawdownPcts, thresholds],
  );

  const data = results.map((r) => ({
    label: `${r.thresholdPct}%`,
    probability: r.probabilityExceeded,
    isCustom: r.thresholdPct === customThreshold && !DEFAULT_DRAWDOWN_THRESHOLDS_PCT.includes(r.thresholdPct),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs text-text-muted">P(max drawdown over the simulated horizon ≥ threshold)</p>
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-wide text-text-muted">Custom</label>
          <div className="relative w-20">
            <Input
              type="number"
              min={1}
              max={99}
              className="text-xs h-8 pr-6"
              value={customThreshold}
              onChange={(e) => setCustomThreshold(Math.min(99, Math.max(1, Number(e.target.value) || 0)))}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">%</span>
          </div>
        </div>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/5" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="currentColor" className="text-text-muted" />
            <YAxis
              tick={{ fontSize: 9 }}
              stroke="currentColor"
              className="text-text-muted"
              tickFormatter={(v: number) => formatPercent(v, 0)}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              formatter={(value: number) => [formatPercent(value, 1), "probability"]}
            />
            <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.isCustom ? "hsl(38 92% 50%)" : "hsl(0 72% 58%)"} fillOpacity={0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DrawdownThresholdChart;
