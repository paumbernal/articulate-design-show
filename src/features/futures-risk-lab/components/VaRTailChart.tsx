import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildHistogram } from "../lib/histogram";
import { computeCVaR, computeVaR } from "../lib/riskMetrics";
import { formatCurrency, formatLossMetric } from "../lib/formatters";

interface VaRTailChartProps {
  terminalBalances: Float64Array;
  startingBalance: number;
}

const CONFIDENCE_OPTIONS = [0.95, 0.99] as const;

const VaRTailChart = ({ terminalBalances, startingBalance }: VaRTailChartProps) => {
  const [confidence, setConfidence] = useState<(typeof CONFIDENCE_OPTIONS)[number]>(0.95);

  const pnl = useMemo(() => Array.from(terminalBalances, (b) => b - startingBalance), [terminalBalances, startingBalance]);
  const bins = useMemo(() => buildHistogram(pnl, 40), [pnl]);
  const varLoss = useMemo(() => computeVaR(terminalBalances, startingBalance, confidence), [terminalBalances, startingBalance, confidence]);
  const cvarLoss = useMemo(() => computeCVaR(terminalBalances, startingBalance, confidence), [terminalBalances, startingBalance, confidence]);
  const varThresholdPnl = -varLoss;
  const varDisplay = formatLossMetric(varLoss);
  const cvarDisplay = formatLossMetric(cvarLoss);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs text-text-muted">
          Loss distribution with the VaR cutoff and Expected Shortfall (CVaR) tail shaded beyond it.
        </p>
        <div className="flex gap-1 border border-foreground/10 rounded-lg p-1">
          {CONFIDENCE_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConfidence(c)}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                confidence === c ? "bg-foreground text-background" : "text-text-muted hover:text-foreground"
              }`}
            >
              {(c * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className={`border rounded-lg p-3 ${varDisplay.isActualLoss ? "border-amber-500/25 bg-amber-500/[0.06]" : "border-emerald-500/25 bg-emerald-500/[0.06]"}`}
        >
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">
            {(confidence * 100).toFixed(0)}% VaR
          </p>
          <p className={`font-bold text-lg ${varDisplay.isActualLoss ? "text-amber-500" : "text-emerald-500"}`}>
            {varDisplay.text}
          </p>
          <p className="text-[10px] text-text-faded mt-1">
            {(confidence * 100).toFixed(0)}% of simulated paths do no worse than this.
          </p>
        </div>
        <div
          className={`border rounded-lg p-3 ${cvarDisplay.isActualLoss ? "border-red-500/25 bg-red-500/[0.06]" : "border-emerald-500/25 bg-emerald-500/[0.06]"}`}
        >
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">
            {(confidence * 100).toFixed(0)}% CVaR (Expected Shortfall)
          </p>
          <p className={`font-bold text-lg ${cvarDisplay.isActualLoss ? "text-red-500" : "text-emerald-500"}`}>
            {cvarDisplay.text}
          </p>
          <p className="text-[10px] text-text-faded mt-1">Average outcome in the worst {((1 - confidence) * 100).toFixed(0)}% of paths.</p>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/5" vertical={false} />
            <XAxis
              dataKey="midpoint"
              tick={{ fontSize: 9 }}
              stroke="currentColor"
              className="text-text-muted"
              tickFormatter={(v: number) => formatCurrency(v, 0)}
              minTickGap={40}
            />
            <YAxis tick={{ fontSize: 9 }} stroke="currentColor" className="text-text-muted" allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              formatter={(value: number) => [value, "paths"]}
              labelFormatter={(v: number) => `${v >= 0 ? "+" : ""}${formatCurrency(v, 0)} P&L`}
            />
            <ReferenceLine
              x={varThresholdPnl}
              stroke="hsl(38 92% 50%)"
              strokeWidth={2}
              label={{ value: "VaR", fontSize: 9, fill: "hsl(38 92% 50%)" }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {bins.map((b) => (
                <Cell key={b.binStart} fill={b.midpoint <= varThresholdPnl ? "hsl(0 72% 58%)" : "hsl(0 0% 60%)"} fillOpacity={b.midpoint <= varThresholdPnl ? 0.75 : 0.35} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-text-faded mt-2 ">
        Shaded red bars = the tail beyond {(confidence * 100).toFixed(0)}% VaR that CVaR averages over.
      </p>
    </div>
  );
};

export default VaRTailChart;
