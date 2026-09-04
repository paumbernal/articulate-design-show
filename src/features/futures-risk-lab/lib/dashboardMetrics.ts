import {
  computeCVaR,
  computeDrawdownThresholdProbabilities,
  computePercentileSet,
  computeRiskOfRuin,
  computeTargetProbabilities,
  computeVaR,
} from "./riskMetrics";
import type {
  DrawdownThresholdResult,
  PercentileSet,
  SimulationResult,
  TargetProbabilities,
} from "../types";

export interface DashboardMetricsOptions {
  ruinThresholdPct: number;
  targetBalance: number;
  drawdownThresholdsPct: number[];
}

export interface DashboardMetrics {
  expectedValuePerTradeUsd: number;
  meanReturnPct: number;
  medianFinalBalance: number;
  p5FinalBalance: number;
  p95FinalBalance: number;
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  medianMaxDrawdownPct: number;
  worstMaxDrawdownPct: number;
  riskOfRuin: number;
  terminalPercentiles: PercentileSet;
  drawdownPercentiles: PercentileSet;
  drawdownThresholdResults: DrawdownThresholdResult[];
  targetProbabilities: TargetProbabilities;
}

/**
 * Composes the primitive risk-metric functions in riskMetrics.ts into the full set of numbers
 * the dashboard displays. Deliberately separate from runMonteCarloSimulation: these are all
 * cheap (linear scans / sorts over already-simulated arrays), so the UI recomputes this on every
 * threshold/target change without re-running the Monte Carlo simulation itself.
 */
export function computeDashboardMetrics(
  result: SimulationResult,
  options: DashboardMetricsOptions,
): DashboardMetrics {
  const { startingBalance } = result.config;
  const { terminalBalances, maxDrawdownPcts, minBalances, maxBalances } = result;

  const terminalPercentiles = computePercentileSet(terminalBalances);
  const drawdownPercentiles = computePercentileSet(maxDrawdownPcts);

  const meanTerminal = Array.from(terminalBalances).reduce((s, b) => s + b, 0) / terminalBalances.length;

  return {
    expectedValuePerTradeUsd: result.theoreticalExpectancyPerTrade,
    meanReturnPct: (meanTerminal - startingBalance) / startingBalance,
    medianFinalBalance: terminalPercentiles.p50,
    p5FinalBalance: terminalPercentiles.p5,
    p95FinalBalance: terminalPercentiles.p95,
    var95: computeVaR(terminalBalances, startingBalance, 0.95),
    var99: computeVaR(terminalBalances, startingBalance, 0.99),
    cvar95: computeCVaR(terminalBalances, startingBalance, 0.95),
    cvar99: computeCVaR(terminalBalances, startingBalance, 0.99),
    medianMaxDrawdownPct: drawdownPercentiles.p50,
    worstMaxDrawdownPct: Math.max(...Array.from(maxDrawdownPcts)),
    riskOfRuin: computeRiskOfRuin(minBalances, startingBalance, options.ruinThresholdPct),
    terminalPercentiles,
    drawdownPercentiles,
    drawdownThresholdResults: computeDrawdownThresholdProbabilities(maxDrawdownPcts, options.drawdownThresholdsPct),
    targetProbabilities: computeTargetProbabilities(maxBalances, terminalBalances, startingBalance, options.targetBalance),
  };
}
