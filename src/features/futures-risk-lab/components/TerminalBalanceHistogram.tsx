import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildHistogram } from "../lib/histogram";
import { formatCurrency } from "../lib/formatters";

interface TerminalBalanceHistogramProps {
  terminalBalances: Float64Array;
  startingBalance: number;
  medianFinalBalance: number;
}

const TerminalBalanceHistogram = ({ terminalBalances, startingBalance, medianFinalBalance }: TerminalBalanceHistogramProps) => {
  const bins = useMemo(() => buildHistogram(terminalBalances, 40), [terminalBalances]);

  return (
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
            labelFormatter={(v: number) => `~${formatCurrency(v, 0)}`}
          />
          <ReferenceLine x={startingBalance} stroke="hsl(var(--foreground) / 0.4)" strokeDasharray="4 4" label={{ value: "Start", fontSize: 9, fill: "currentColor" }} />
          <ReferenceLine x={medianFinalBalance} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" label={{ value: "Median", fontSize: 9, fill: "hsl(142 71% 45%)" }} />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {bins.map((b) => (
              <Cell key={b.binStart} fill={b.midpoint >= startingBalance ? "hsl(142 71% 45%)" : "hsl(0 72% 58%)"} fillOpacity={0.55} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TerminalBalanceHistogram;
