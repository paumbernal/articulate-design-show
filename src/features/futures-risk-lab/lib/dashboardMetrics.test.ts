import { describe, expect, it } from "vitest";
import { computeDashboardMetrics } from "./dashboardMetrics";
import { runMonteCarloSimulation } from "./monteCarlo";
import { DEFAULT_CONFIG, DEFAULT_DRAWDOWN_THRESHOLDS_PCT, DEFAULT_RUIN_THRESHOLD_PCT } from "./defaults";

describe("computeDashboardMetrics", () => {
  const result = runMonteCarloSimulation({ ...DEFAULT_CONFIG, numSimulations: 3000, numTrades: 150, seed: 42 });
  const metrics = computeDashboardMetrics(result, {
    ruinThresholdPct: DEFAULT_RUIN_THRESHOLD_PCT,
    targetBalance: DEFAULT_CONFIG.startingBalance * 1.5,
    drawdownThresholdsPct: DEFAULT_DRAWDOWN_THRESHOLDS_PCT,
  });

  it("orders the terminal-balance percentiles consistently", () => {
    expect(metrics.p5FinalBalance).toBeLessThanOrEqual(metrics.medianFinalBalance);
    expect(metrics.medianFinalBalance).toBeLessThanOrEqual(metrics.p95FinalBalance);
  });

  it("has a positive expected value per trade for the profitable MNQ default assumptions", () => {
    // 0.59*1.2R - 0.41*1.0R = 0.298R * $200 = $59.60
    expect(metrics.expectedValuePerTradeUsd).toBeCloseTo(59.6, 6);
  });

  it("orders VaR/CVaR at increasing confidence and severity", () => {
    expect(metrics.var99).toBeGreaterThanOrEqual(metrics.var95);
    expect(metrics.cvar95).toBeGreaterThanOrEqual(metrics.var95);
    expect(metrics.cvar99).toBeGreaterThanOrEqual(metrics.var99);
  });

  it("keeps risk of ruin and drawdown-threshold probabilities within [0, 1]", () => {
    expect(metrics.riskOfRuin).toBeGreaterThanOrEqual(0);
    expect(metrics.riskOfRuin).toBeLessThanOrEqual(1);
    for (const r of metrics.drawdownThresholdResults) {
      expect(r.probabilityExceeded).toBeGreaterThanOrEqual(0);
      expect(r.probabilityExceeded).toBeLessThanOrEqual(1);
    }
  });

  it("returns drawdown-threshold results for every requested threshold, in order", () => {
    expect(metrics.drawdownThresholdResults.map((r) => r.thresholdPct)).toEqual(DEFAULT_DRAWDOWN_THRESHOLDS_PCT);
  });

  it("worst drawdown is at least the median drawdown", () => {
    expect(metrics.worstMaxDrawdownPct).toBeGreaterThanOrEqual(metrics.medianMaxDrawdownPct);
  });
});
