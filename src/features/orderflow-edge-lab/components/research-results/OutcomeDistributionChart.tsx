import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { BreakdownRow } from "../../types";

interface OutcomeDistributionChartProps {
  rows: BreakdownRow[];
}

const OutcomeDistributionChart = ({ rows }: OutcomeDistributionChartProps) => {
  const data = rows.map((r) => ({ label: r.label, n: r.n, negative: r.label.trim().startsWith("<=") || r.label.trim().startsWith("-") }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/5" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "monospace" }} stroke="currentColor" className="text-text-muted" />
          <YAxis tick={{ fontSize: 9, fontFamily: "monospace" }} stroke="currentColor" className="text-text-muted" allowDecimals={false} />
          <Bar dataKey="n" radius={[3, 3, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.negative ? "hsl(0 72% 58%)" : "hsl(142 71% 45%)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OutcomeDistributionChart;
