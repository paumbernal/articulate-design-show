import type {
  BacktestConfigSnapshot,
  BacktestStatistics,
  BacktestTrade,
  BreakdownRow,
  ValidationSummary,
} from "../types";

/**
 * Client-side mirror of engine/src/edge_lab/backtest/statistics.py, used to
 * re-aggregate a precomputed flat trade list against live filters (min Edge
 * Score, date range, session) in the static-build data mode — cheap
 * arithmetic over already-computed trades, not a re-simulation. Keep this
 * in sync with the Python version; there is no shared-schema contract for
 * this logic (only for the data shapes), so changes must be mirrored by
 * hand.
 */

const EDGE_SCORE_BUCKET_WIDTH = 10;

function winRate(trades: BacktestTrade[]): number | null {
  if (trades.length === 0) return null;
  return trades.filter((t) => t.pnlPoints > 0).length / trades.length;
}

function expectancy(trades: BacktestTrade[]): number | null {
  if (trades.length === 0) return null;
  return trades.reduce((sum, t) => sum + t.pnlR, 0) / trades.length;
}

function profitFactor(trades: BacktestTrade[]): number | null {
  const grossProfit = trades.filter((t) => t.pnlPoints > 0).reduce((s, t) => s + t.pnlPoints, 0);
  const grossLoss = trades.filter((t) => t.pnlPoints < 0).reduce((s, t) => s - t.pnlPoints, 0);
  if (grossLoss === 0) return null;
  return grossProfit / grossLoss;
}

function maxDrawdown(trades: BacktestTrade[], field: "pnlPoints" | "pnlR"): number {
  const ordered = [...trades].sort((a, b) => a.entryBarIndex - b.entryBarIndex);
  let cumulative = 0;
  let peak = 0;
  let maxDd = 0;
  for (const t of ordered) {
    cumulative += t[field];
    peak = Math.max(peak, cumulative);
    maxDd = Math.min(maxDd, cumulative - peak);
  }
  return maxDd;
}

function outcomeDistribution(trades: BacktestTrade[]): BreakdownRow[] {
  const buckets: [string, (r: number) => boolean][] = [
    ["<= -2R", (r) => r <= -2],
    ["-2R to -1R", (r) => r > -2 && r <= -1],
    ["-1R to 0R", (r) => r > -1 && r <= 0],
    ["0R to 1R", (r) => r > 0 && r <= 1],
    ["1R to 2R", (r) => r > 1 && r <= 2],
    ["> 2R", (r) => r > 2],
  ];
  return buckets.map(([label, predicate]) => ({
    label,
    n: trades.filter((t) => predicate(t.pnlR)).length,
  }));
}

function breakdownBy(trades: BacktestTrade[], keyFn: (t: BacktestTrade) => string): BreakdownRow[] {
  const groups = new Map<string, BacktestTrade[]>();
  for (const t of trades) {
    const key = keyFn(t);
    const group = groups.get(key);
    if (group) group.push(t);
    else groups.set(key, [t]);
  }
  return Array.from(groups.entries()).map(([label, group]) => ({
    label,
    n: group.length,
    winRate: winRate(group) ?? undefined,
    avgR: group.reduce((s, t) => s + t.pnlR, 0) / group.length,
    expectancy: expectancy(group) ?? undefined,
  }));
}

function edgeScoreBucketLabel(score: number): string {
  const low = Math.floor(score / EDGE_SCORE_BUCKET_WIDTH) * EDGE_SCORE_BUCKET_WIDTH;
  return `${low}-${low + EDGE_SCORE_BUCKET_WIDTH}`;
}

export function computeStatistics(
  trades: BacktestTrade[],
  config: BacktestConfigSnapshot,
  validation: ValidationSummary,
): BacktestStatistics {
  const n = trades.length;
  const targetTrades = trades.filter((t) => t.exitReason === "target");
  const stopTrades = trades.filter((t) => t.exitReason === "stop");

  return {
    config,
    sampleSize: n,
    winRate: winRate(trades) ?? undefined,
    avgReturnPoints: n ? trades.reduce((s, t) => s + t.pnlPoints, 0) / n : undefined,
    avgR: n ? trades.reduce((s, t) => s + t.pnlR, 0) / n : undefined,
    expectancy: expectancy(trades) ?? undefined,
    profitFactor: profitFactor(trades) ?? undefined,
    maxDrawdownPoints: n ? maxDrawdown(trades, "pnlPoints") : undefined,
    maxDrawdownR: n ? maxDrawdown(trades, "pnlR") : undefined,
    outcomeDistribution: outcomeDistribution(trades),
    avgMfePoints: n ? trades.reduce((s, t) => s + t.mfePoints, 0) / n : undefined,
    avgMaePoints: n ? trades.reduce((s, t) => s + t.maePoints, 0) / n : undefined,
    avgTimeToTargetBars: targetTrades.length
      ? targetTrades.reduce((s, t) => s + t.timeToExitBars, 0) / targetTrades.length
      : undefined,
    avgTimeToStopBars: stopTrades.length
      ? stopTrades.reduce((s, t) => s + t.timeToExitBars, 0) / stopTrades.length
      : undefined,
    breakdowns: {
      byTimeOfDay: breakdownBy(trades, (t) => `${String(t.hourOfDay).padStart(2, "0")}:00`),
      byDayOfWeek: breakdownBy(trades, (t) => t.dayOfWeek),
      bySession: breakdownBy(trades, (t) => t.session),
      byEdgeScoreBucket: breakdownBy(trades, (t) => edgeScoreBucketLabel(t.edgeScoreAtEntry)),
    },
    validation,
  };
}

export function buildValidationWarnings(trades: BacktestTrade[]): string[] {
  const warnings: string[] = [
    "This is a research backtest on synthetic data, not a live-trading simulation.",
    "Fills assume no slippage beyond the fixed cost assumption on every trade. Real fills may be worse, especially in fast markets.",
    "When a bar touches both the stop and target, the stop is conservatively assumed to fill first; the true intrabar sequence is unknowable from OHLC bars.",
    "Detected conditions and Edge Scores are retrospective pattern matches, not forecasts. A high score describes the past, not the future.",
  ];
  const outOfSample = trades.filter((t) => t.isOutOfSample);
  const inSample = trades.filter((t) => !t.isOutOfSample);
  if (trades.length < 30) {
    warnings.push(`Total sample size (${trades.length}) is below 30. Treat any statistic here as exploratory, not conclusive.`);
  }
  if (outOfSample.length < 30) {
    warnings.push(
      `Out-of-sample count (${outOfSample.length}) is below 30. In-sample performance may not generalize; this is a primary overfitting risk.`,
    );
  }
  if (inSample.length === 0 || outOfSample.length === 0) {
    warnings.push("No true in-sample/out-of-sample comparison is possible without trades on both sides.");
  }
  return warnings;
}

export function filterTrades(
  trades: BacktestTrade[],
  filters: { minEdgeScore?: number; session?: string; dateStart?: string; dateEnd?: string },
): BacktestTrade[] {
  return trades.filter((t) => {
    if (filters.minEdgeScore != null && t.edgeScoreAtEntry < filters.minEdgeScore) return false;
    if (filters.session && filters.session !== "ANY" && t.session !== filters.session) return false;
    if (filters.dateStart && t.entryTimestamp < filters.dateStart) return false;
    if (filters.dateEnd && t.entryTimestamp > filters.dateEnd) return false;
    return true;
  });
}
