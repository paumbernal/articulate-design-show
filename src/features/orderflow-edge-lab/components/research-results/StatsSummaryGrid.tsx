import type { BacktestStatistics } from "../../types";
import { formatPercent, formatR, formatSigned } from "../../lib/formatters";

interface StatsSummaryGridProps {
  stats: BacktestStatistics;
}

const StatsSummaryGrid = ({ stats }: StatsSummaryGridProps) => {
  const cells: { label: string; value: string; accent?: boolean }[] = [
    { label: "Sample Size", value: `${stats.sampleSize}` },
    { label: "Win Rate", value: formatPercent(stats.winRate), accent: true },
    { label: "Avg R", value: formatR(stats.avgR) },
    { label: "Expectancy", value: formatR(stats.expectancy) },
    { label: "Profit Factor", value: stats.profitFactor != null ? stats.profitFactor.toFixed(2) : "—" },
    { label: "Max Drawdown", value: formatSigned(stats.maxDrawdownR, 2) + "R" },
    { label: "Avg MFE", value: formatSigned(stats.avgMfePoints, 2) + " pts" },
    { label: "Avg MAE", value: formatSigned(stats.avgMaePoints, 2) + " pts" },
    {
      label: "Time to Target",
      value: stats.avgTimeToTargetBars != null ? `${stats.avgTimeToTargetBars.toFixed(1)} bars` : "—",
    },
    {
      label: "Time to Stop",
      value: stats.avgTimeToStopBars != null ? `${stats.avgTimeToStopBars.toFixed(1)} bars` : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cells.map((cell) => (
        <div key={cell.label} className="border border-foreground/10 rounded-lg p-3 bg-foreground/[0.02]">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-muted mb-1">{cell.label}</p>
          <p className={`font-mono font-bold text-lg ${cell.accent ? "text-amber-500" : ""}`}>{cell.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsSummaryGrid;
