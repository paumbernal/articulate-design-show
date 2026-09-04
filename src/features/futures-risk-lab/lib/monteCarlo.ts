import { createRng } from "./rng";
import { sampleEmpiricalR, sampleTradeR, theoreticalExpectancyR } from "./tradeDistribution";
import type { EquityCurveBandPoint, SimulationConfig, SimulationResult } from "../types";
import { percentile } from "./riskMetrics";

/**
 * Upper bound on how many full equity curves we keep in memory (for the fan-chart percentile
 * bands + spaghetti sample). Scalar per-path stats (terminal balance, max drawdown, min/max
 * balance) are tracked for *every* simulated path regardless of numSimulations — only the full
 * curve, which costs O(numTrades) instead of O(1) per path, is capped. Because paths are
 * independent and identically distributed, the first N of them are as representative a sample
 * as any other N, so capping this way introduces no bias.
 */
const MAX_TRACKED_CURVES = 2000;

/**
 * Runs the Monte Carlo simulation described by `config` and returns per-path summary
 * distributions plus a bounded sample of full equity curves for charting.
 *
 * This function is pure and has no UI dependencies, so it's directly unit-testable (see
 * monteCarlo.test.ts) independent of the dashboard that calls it.
 */
export function runMonteCarloSimulation(config: SimulationConfig): SimulationResult {
  const { startingBalance, riskPerTrade, numTrades, numSimulations, seed, mode } = config;

  const rng = createRng(seed);
  const trackedCount = Math.min(numSimulations, MAX_TRACKED_CURVES);

  const terminalBalances = new Float64Array(numSimulations);
  const maxDrawdownPcts = new Float64Array(numSimulations);
  const minBalances = new Float64Array(numSimulations);
  const maxBalances = new Float64Array(numSimulations);
  const sampledCurves: number[][] = [];

  // Running sums per checkpoint, used to build percentile bands from the tracked subsample only.
  const trackedByCheckpoint: number[][] = Array.from({ length: numTrades + 1 }, () => []);

  for (let sim = 0; sim < numSimulations; sim++) {
    let balance = startingBalance;
    let peak = startingBalance;
    let minBalance = startingBalance;
    let maxBalance = startingBalance;
    let maxDrawdown = 0;

    const keepCurve = sim < trackedCount;
    const curve: number[] | null = keepCurve ? [balance] : null;
    if (keepCurve) trackedByCheckpoint[0].push(balance);

    for (let t = 1; t <= numTrades; t++) {
      const r =
        mode === "empirical"
          ? sampleEmpiricalR(config.empiricalRMultiples, rng)
          : sampleTradeR(config.synthetic, rng);
      balance += r * riskPerTrade;

      if (balance > peak) peak = balance;
      if (balance < minBalance) minBalance = balance;
      if (balance > maxBalance) maxBalance = balance;
      const drawdown = peak > 0 ? (peak - balance) / peak : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;

      if (keepCurve) {
        curve!.push(balance);
        trackedByCheckpoint[t].push(balance);
      }
    }

    terminalBalances[sim] = balance;
    maxDrawdownPcts[sim] = maxDrawdown;
    minBalances[sim] = minBalance;
    maxBalances[sim] = maxBalance;
    if (curve) sampledCurves.push(curve);
  }

  const equityCurveBands: EquityCurveBandPoint[] = trackedByCheckpoint.map((balancesAtT, tradeIndex) => ({
    tradeIndex,
    p5: percentile(balancesAtT, 5),
    p25: percentile(balancesAtT, 25),
    p50: percentile(balancesAtT, 50),
    p75: percentile(balancesAtT, 75),
    p95: percentile(balancesAtT, 95),
  }));

  const theoreticalExpectancyPerTrade =
    mode === "empirical"
      ? (config.empiricalRMultiples.reduce((s, r) => s + r, 0) / Math.max(config.empiricalRMultiples.length, 1)) *
        riskPerTrade
      : theoreticalExpectancyR(config.synthetic) * riskPerTrade;

  return {
    config,
    terminalBalances,
    maxDrawdownPcts,
    minBalances,
    maxBalances,
    sampledCurves,
    equityCurveBands,
    theoreticalExpectancyPerTrade,
  };
}
