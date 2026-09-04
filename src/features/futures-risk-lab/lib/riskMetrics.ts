import type {
  DrawdownThresholdResult,
  PercentileSet,
  TargetProbabilities,
} from "../types";

/**
 * Linear-interpolation percentile (the same convention as numpy.percentile's default
 * "linear" method). `p` is in [0, 100]. `values` need not be pre-sorted.
 */
export function percentile(values: ArrayLike<number>, p: number): number {
  const n = values.length;
  if (n === 0) return NaN;
  if (n === 1) return values[0];
  const sorted = Array.from(values).sort((a, b) => a - b);
  if (p <= 0) return sorted[0];
  if (p >= 100) return sorted[n - 1];
  const rank = (p / 100) * (n - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sorted[lower];
  const frac = rank - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * frac;
}

export function computePercentileSet(values: ArrayLike<number>): PercentileSet {
  const sorted = Array.from(values).sort((a, b) => a - b);
  return {
    p5: percentile(sorted, 5),
    p10: percentile(sorted, 10),
    p25: percentile(sorted, 25),
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
  };
}

/**
 * Value-at-Risk on the simulated terminal-P&L distribution, expressed as a positive dollar
 * loss amount.
 *
 * Methodology: P&L_i = terminalBalance_i - startingBalance for every simulated path. VaR at
 * confidence level c (e.g. 0.95) is the loss such that c of the simulated outcomes are no worse
 * than it — i.e. the (1-c)-th percentile of the P&L distribution, negated. This is the standard
 * "historical/simulation method" for VaR (percentile of the realized/simulated distribution),
 * applied to Monte Carlo output instead of a historical return series — see the root README's
 * methodology section for the historical-data equivalent.
 *
 * Note the horizon here is the *entire simulated trade sequence* (numTrades trades), not a fixed
 * calendar period like the 1-day VaR common in market risk — this is a strategy-level, per-track-
 * record VaR, and that distinction is called out explicitly in the dashboard.
 */
export function computeVaR(
  terminalBalances: ArrayLike<number>,
  startingBalance: number,
  confidence: number,
): number {
  const pnl = Array.from(terminalBalances, (b) => b - startingBalance);
  const tailPercentile = (1 - confidence) * 100;
  return -percentile(pnl, tailPercentile);
}

/**
 * Expected Shortfall / Conditional VaR: the average loss among only the outcomes at least as bad
 * as VaR. Where VaR answers "how bad, at this confidence level", CVaR answers "given that it's
 * that bad, how bad on average" — it describes the shape of the tail beyond VaR rather than just
 * its edge.
 */
export function computeCVaR(
  terminalBalances: ArrayLike<number>,
  startingBalance: number,
  confidence: number,
): number {
  const pnl = Array.from(terminalBalances, (b) => b - startingBalance);
  const varLoss = computeVaR(terminalBalances, startingBalance, confidence);
  const varThreshold = -varLoss; // P&L value corresponding to the VaR cutoff
  const tail = pnl.filter((x) => x <= varThreshold);
  if (tail.length === 0) return varLoss;
  const meanTail = tail.reduce((s, x) => s + x, 0) / tail.length;
  return -meanTail;
}

/** P(maxDrawdownPct >= threshold) for each requested threshold, across all simulated paths. */
export function computeDrawdownThresholdProbabilities(
  maxDrawdownPcts: ArrayLike<number>,
  thresholdsPct: number[],
): DrawdownThresholdResult[] {
  const n = maxDrawdownPcts.length;
  return thresholdsPct.map((thresholdPct) => {
    if (n === 0) return { thresholdPct, probabilityExceeded: NaN };
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (maxDrawdownPcts[i] >= thresholdPct / 100) count++;
    }
    return { thresholdPct, probabilityExceeded: count / n };
  });
}

/**
 * Risk of ruin: the fraction of simulated paths whose balance falls to or below the ruin
 * threshold *at any point* during the simulated horizon — not just at the end. Ruin is defined
 * as a percentage of the starting balance (e.g. 50 => ruin if the account ever drops to 50% of
 * where it started), which the caller resolves to a dollar floor.
 */
export function computeRiskOfRuin(
  minBalances: ArrayLike<number>,
  startingBalance: number,
  ruinThresholdPct: number,
): number {
  const n = minBalances.length;
  if (n === 0) return NaN;
  const floor = startingBalance * (ruinThresholdPct / 100);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (minBalances[i] <= floor) count++;
  }
  return count / n;
}

export function computeTargetProbabilities(
  maxBalances: ArrayLike<number>,
  terminalBalances: ArrayLike<number>,
  startingBalance: number,
  targetBalance: number,
): TargetProbabilities {
  const n = terminalBalances.length;
  if (n === 0) {
    return { probReachTargetAnyPoint: NaN, probFinishAtOrAboveTarget: NaN, probFinishBelowStart: NaN };
  }
  let reachAny = 0;
  let finishAbove = 0;
  let finishBelow = 0;
  for (let i = 0; i < n; i++) {
    if (maxBalances[i] >= targetBalance) reachAny++;
    if (terminalBalances[i] >= targetBalance) finishAbove++;
    if (terminalBalances[i] < startingBalance) finishBelow++;
  }
  return {
    probReachTargetAnyPoint: reachAny / n,
    probFinishAtOrAboveTarget: finishAbove / n,
    probFinishBelowStart: finishBelow / n,
  };
}
