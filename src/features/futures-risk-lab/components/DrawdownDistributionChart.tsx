import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildHistogram } from "../lib/histogram";
import { formatPercent } from "../lib/formatters";

interface DrawdownDistributionChartProps {
  maxDrawdownPcts: Float64Array;
  medianMaxDrawdownPct: number;
}

const DrawdownDistributionChart = ({ maxDrawdownPcts, medianMaxDrawdownPct }: DrawdownDistributionChartProps) => {
  const bins = useMemo(() => buildHistogram(maxDrawdownPcts, 30), [maxDrawdownPcts]);

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
            tickFormatter={(v: number) => formatPercent(v, 0)}
            minTickGap={30}
          />
          <YAxis tick={{ fontSize: 9 }} stroke="currentColor" className="text-text-muted" allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            formatter={(value: number) => [value, "paths"]}
            labelFormatter={(v: number) => `~${formatPercent(v, 1)} drawdown`}
          />
          <ReferenceLine
            x={medianMaxDrawdownPct}
            stroke="hsl(38 92% 50%)"
            strokeDasharray="4 4"
            label={{ value: "Median", fontSize: 9, fill: "hsl(38 92% 50%)" }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]} fill="hsl(0 72% 58%)" fillOpacity={0.5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DrawdownDistributionChart;
