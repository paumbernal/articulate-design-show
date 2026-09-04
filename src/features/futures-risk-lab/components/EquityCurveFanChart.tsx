import { useMemo } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { SimulationResult } from "../types";
import { formatCompactCurrency } from "../lib/formatters";

interface EquityCurveFanChartProps {
  result: SimulationResult;
  sampleLineCount?: number;
}

const SAMPLE_STROKE = "hsl(var(--foreground) / 0.06)";

const chartConfig = {
  p50: {
    label: "Median balance",
    color: "hsl(142 71% 45%)",
  },
} satisfies ChartConfig;

/** Reshapes the simulation result into one row per trade index, with percentile bands and a
 *  bounded number of individual sample-curve series, ready for recharts. */
function buildChartData(result: SimulationResult, sampleLineCount: number) {
  const sampleKeys = Array.from({ length: Math.min(sampleLineCount, result.sampledCurves.length) }, (_, i) => `curve_${i}`);
  const data = result.equityCurveBands.map((band, t) => {
    const row: Record<string, number> = {
      tradeIndex: band.tradeIndex,
      p5: Math.round(band.p5),
      p25: Math.round(band.p25),
      p50: Math.round(band.p50),
      p75: Math.round(band.p75),
      p95: Math.round(band.p95),
    };
    sampleKeys.forEach((key, i) => {
      row[key] = Math.round(result.sampledCurves[i][t]);
    });
    return row;
  });
  return { data, sampleKeys };
}

const EquityCurveFanChart = ({ result, sampleLineCount = 35 }: EquityCurveFanChartProps) => {
  const { data, sampleKeys } = useMemo(() => buildChartData(result, sampleLineCount), [result, sampleLineCount]);

  return (
    <Card className="py-4 sm:py-0 overflow-hidden">
      <CardHeader className="flex flex-col items-stretch gap-4 border-b p-0! sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 min-w-0">
          <CardTitle className="text-xl font-semibold tracking-tight whitespace-nowrap">Monte Carlo Equity Curve</CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-4 px-6 py-4 text-[10px] text-text-muted uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/15 border border-emerald-500/30" /> 5th to 95th pct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/35 border border-emerald-500/50" /> 25th to 75th pct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-foreground" /> Median
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-foreground/20" /> {sampleKeys.length} sample paths
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[460px] w-full">
          <ComposedChart data={data} margin={{ left: 12, right: 12, top: 12 }}>
            <defs>
              <linearGradient id="fanBandOuter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.16} />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fanBandInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="tradeIndex"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={32}
              tickFormatter={(v: number) => `#${v}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={56}
              tickFormatter={(v: number) => formatCompactCurrency(v)}
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  label={label !== undefined ? String(label) : undefined}
                  payload={payload?.filter((p) => p.dataKey === "p50")}
                  labelFormatter={(value) => `Trade ${value}`}
                />
              )}
            />

            <Area
              dataKey={(row: Record<string, number>) => [row.p5, row.p95]}
              type="monotone"
              stroke="none"
              fill="url(#fanBandOuter)"
              isAnimationActive={false}
            />
            <Area
              dataKey={(row: Record<string, number>) => [row.p25, row.p75]}
              type="monotone"
              stroke="none"
              fill="url(#fanBandInner)"
              isAnimationActive={false}
            />

            {sampleKeys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={SAMPLE_STROKE}
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            <Line
              dataKey="p50"
              type="monotone"
              stroke="var(--color-p50)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EquityCurveFanChart;
