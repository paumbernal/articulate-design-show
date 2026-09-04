import type { DashboardMetrics } from "../lib/dashboardMetrics";
import { formatCurrency, formatLossMetric, formatPercent, formatSignedCurrency } from "../lib/formatters";

interface KeyMetricsGridProps {
  metrics: DashboardMetrics;
}

const KeyMetricsGrid = ({ metrics }: KeyMetricsGridProps) => {
  const var95 = formatLossMetric(metrics.var95);
  const var99 = formatLossMetric(metrics.var99);
  const cvar95 = formatLossMetric(metrics.cvar95);
  const cvar99 = formatLossMetric(metrics.cvar99);

  const cells: { label: string; value: string; accent?: "green" | "amber" | "red" }[] = [
    {
      label: "Expected Value / Trade",
      value: formatSignedCurrency(metrics.expectedValuePerTradeUsd),
      accent: metrics.expectedValuePerTradeUsd >= 0 ? "green" : "red",
    },
    { label: "Mean Return", value: formatPercent(metrics.meanReturnPct), accent: metrics.meanReturnPct >= 0 ? "green" : "red" },
    { label: "Median Final Balance", value: formatCurrency(metrics.medianFinalBalance) },
    { label: "5th Pct Final Balance", value: formatCurrency(metrics.p5FinalBalance) },
    { label: "95th Pct Final Balance", value: formatCurrency(metrics.p95FinalBalance) },
    { label: "95% VaR", value: var95.text, accent: var95.isActualLoss ? "amber" : "green" },
    { label: "99% VaR", value: var99.text, accent: var99.isActualLoss ? "amber" : "green" },
    { label: "95% CVaR (Expected Shortfall)", value: cvar95.text, accent: cvar95.isActualLoss ? "red" : "green" },
    { label: "99% CVaR (Expected Shortfall)", value: cvar99.text, accent: cvar99.isActualLoss ? "red" : "green" },
    { label: "Median Max Drawdown", value: formatPercent(metrics.medianMaxDrawdownPct) },
    { label: "Worst Simulated Drawdown", value: formatPercent(metrics.worstMaxDrawdownPct), accent: "red" },
    { label: "Risk of Ruin", value: formatPercent(metrics.riskOfRuin), accent: "red" },
  ];

  const accentClass: Record<string, string> = {
    green: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-red-500",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cells.map((cell) => (
        <div key={cell.label} className="border border-foreground/10 rounded-lg p-3 bg-foreground/[0.02]">
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">{cell.label}</p>
          <p className={`font-bold text-lg ${cell.accent ? accentClass[cell.accent] : ""}`}>{cell.value}</p>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsGrid;
