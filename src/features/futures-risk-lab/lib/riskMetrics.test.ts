import { describe, expect, it } from "vitest";
import {
  computeCVaR,
  computeDrawdownThresholdProbabilities,
  computePercentileSet,
  computeRiskOfRuin,
  computeTargetProbabilities,
  computeVaR,
  percentile,
} from "./riskMetrics";

describe("percentile", () => {
  it("matches known values for a simple 0-100 dataset", () => {
    const values = Array.from({ length: 101 }, (_, i) => i); // 0..100
    expect(percentile(values, 0)).toBe(0);
    expect(percentile(values, 50)).toBe(50);
    expect(percentile(values, 100)).toBe(100);
    expect(percentile(values, 25)).toBe(25);
  });

  it("interpolates between the two nearest ranks", () => {
    const values = [10, 20, 30, 40];
    // rank = 0.5 * 3 = 1.5 -> interpolate between values[1]=20 and values[2]=30
    expect(percentile(values, 50)).toBeCloseTo(25, 6);
  });

  it("handles unsorted input", () => {
    expect(percentile([30, 10, 20], 50)).toBe(20);
  });

  it("returns NaN for an empty array", () => {
    expect(percentile([], 50)).toBeNaN();
  });

  it("returns the single value for a one-element array at any percentile", () => {
    expect(percentile([42], 5)).toBe(42);
    expect(percentile([42], 95)).toBe(42);
  });
});

describe("computePercentileSet", () => {
  it("returns a monotonically non-decreasing set of percentiles", () => {
    const values = [5, 100, 3, 88, 42, 17, 63, 29, 71, 8];
    const set = computePercentileSet(values);
    expect(set.p5).toBeLessThanOrEqual(set.p10);
    expect(set.p10).toBeLessThanOrEqual(set.p25);
    expect(set.p25).toBeLessThanOrEqual(set.p50);
    expect(set.p50).toBeLessThanOrEqual(set.p75);
    expect(set.p75).toBeLessThanOrEqual(set.p90);
    expect(set.p90).toBeLessThanOrEqual(set.p95);
  });
});

describe("computeVaR / computeCVaR", () => {
  // Construct a known terminal-balance distribution: 100 paths, starting balance 1000.
  // 90 paths end at 1100 (+100), 10 paths end at a spread of losses averaging -500.
  const startingBalance = 1000;
  const winners = Array.from({ length: 90 }, () => 1100);
  const losers = [700, 650, 600, 550, 500, 450, 400, 350, 300, 250];
  const terminalBalances = [...winners, ...losers];

  it("VaR at 95% equals the loss at the 5th percentile of the P&L distribution", () => {
    const pnl = terminalBalances.map((b) => b - startingBalance).sort((a, b) => a - b);
    const expected = -percentile(pnl, 5);
    expect(computeVaR(terminalBalances, startingBalance, 0.95)).toBeCloseTo(expected, 6);
  });

  it("CVaR is at least as large as VaR (the tail average is at least as bad as its edge)", () => {
    const varLoss = computeVaR(terminalBalances, startingBalance, 0.95);
    const cvarLoss = computeCVaR(terminalBalances, startingBalance, 0.95);
    expect(cvarLoss).toBeGreaterThanOrEqual(varLoss - 1e-9);
  });

  it("a 99% VaR is at least as large as a 95% VaR on the same distribution", () => {
    const var95 = computeVaR(terminalBalances, startingBalance, 0.95);
    const var99 = computeVaR(terminalBalances, startingBalance, 0.99);
    expect(var99).toBeGreaterThanOrEqual(var95 - 1e-9);
  });

  it("returns ~0 VaR/CVaR when every path is profitable", () => {
    const allWinners = Array.from({ length: 50 }, () => 1200);
    expect(computeVaR(allWinners, startingBalance, 0.95)).toBeLessThanOrEqual(0);
    expect(computeCVaR(allWinners, startingBalance, 0.95)).toBeLessThanOrEqual(0);
  });
});

describe("computeDrawdownThresholdProbabilities", () => {
  it("computes exceedance probability correctly for known drawdowns", () => {
    // 4 paths: drawdowns of 5%, 15%, 25%, 35%
    const drawdowns = [0.05, 0.15, 0.25, 0.35];
    const results = computeDrawdownThresholdProbabilities(drawdowns, [10, 20, 30]);
    expect(results).toEqual([
      { thresholdPct: 10, probabilityExceeded: 0.75 }, // 15,25,35 >= 10
      { thresholdPct: 20, probabilityExceeded: 0.5 }, // 25,35 >= 20
      { thresholdPct: 30, probabilityExceeded: 0.25 }, // 35 >= 30
    ]);
  });

  it("returns 0 for a threshold no path exceeds", () => {
    const results = computeDrawdownThresholdProbabilities([0.01, 0.02], [50]);
    expect(results[0].probabilityExceeded).toBe(0);
  });
});

describe("computeRiskOfRuin", () => {
  it("counts paths whose minimum balance breached the ruin floor", () => {
    const startingBalance = 1000;
    // ruin floor at 50% = 500
    const minBalances = [900, 400, 500, 501, 100];
    // 400, 500, and 100 are all <= the 500 floor; 900 and 501 are not -> 3/5
    expect(computeRiskOfRuin(minBalances, startingBalance, 50)).toBeCloseTo(0.6, 6);
  });

  it("is 0 when no path ever breaches the floor", () => {
    const minBalances = [900, 950, 999];
    expect(computeRiskOfRuin(minBalances, 1000, 50)).toBe(0);
  });

  it("is 1 when every path breaches the floor", () => {
    const minBalances = [100, 200, 300];
    expect(computeRiskOfRuin(minBalances, 1000, 50)).toBe(1);
  });
});

describe("computeTargetProbabilities", () => {
  it("computes all three target metrics correctly on a known set", () => {
    const startingBalance = 1000;
    const target = 1500;
    // path 1: reaches target mid-path but ends lower; path 2: ends at target; path 3: never reaches, ends below start
    const maxBalances = [1600, 1500, 900];
    const terminalBalances = [1400, 1500, 800];
    const result = computeTargetProbabilities(maxBalances, terminalBalances, startingBalance, target);
    expect(result.probReachTargetAnyPoint).toBeCloseTo(2 / 3, 6); // paths 1 & 2
    expect(result.probFinishAtOrAboveTarget).toBeCloseTo(1 / 3, 6); // path 2 only
    expect(result.probFinishBelowStart).toBeCloseTo(1 / 3, 6); // path 3 only
  });
});
