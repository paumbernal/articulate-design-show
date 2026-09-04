import { describe, expect, it } from "vitest";
import { runMonteCarloSimulation } from "./monteCarlo";
import { DEFAULT_CONFIG } from "./defaults";
import type { SimulationConfig } from "../types";

function configWith(overrides: Partial<SimulationConfig>): SimulationConfig {
  return { ...DEFAULT_CONFIG, ...overrides, synthetic: { ...DEFAULT_CONFIG.synthetic, ...overrides.synthetic } };
}

describe("runMonteCarloSimulation output dimensions", () => {
  it("produces one terminal balance / drawdown / min / max entry per simulation", () => {
    const config = configWith({ numSimulations: 250, numTrades: 40 });
    const result = runMonteCarloSimulation(config);
    expect(result.terminalBalances.length).toBe(250);
    expect(result.maxDrawdownPcts.length).toBe(250);
    expect(result.minBalances.length).toBe(250);
    expect(result.maxBalances.length).toBe(250);
  });

  it("produces equity curve bands with numTrades + 1 checkpoints (including trade 0)", () => {
    const config = configWith({ numSimulations: 100, numTrades: 40 });
    const result = runMonteCarloSimulation(config);
    expect(result.equityCurveBands.length).toBe(41);
    expect(result.equityCurveBands[0].tradeIndex).toBe(0);
    expect(result.equityCurveBands[0].p50).toBe(config.startingBalance);
    expect(result.equityCurveBands[40].tradeIndex).toBe(40);
  });

  it("caps sampled curves at the tracked limit even when numSimulations is huge", () => {
    const config = configWith({ numSimulations: 5000, numTrades: 10 });
    const result = runMonteCarloSimulation(config);
    expect(result.sampledCurves.length).toBeLessThanOrEqual(2000);
    expect(result.sampledCurves.length).toBeGreaterThan(0);
    // every sampled curve has numTrades + 1 points
    for (const curve of result.sampledCurves) {
      expect(curve.length).toBe(11);
    }
  });

  it("every terminal balance equals the last point of its curve, for tracked paths", () => {
    const config = configWith({ numSimulations: 50, numTrades: 20 });
    const result = runMonteCarloSimulation(config);
    for (let i = 0; i < result.sampledCurves.length; i++) {
      const curve = result.sampledCurves[i];
      expect(curve[curve.length - 1]).toBeCloseTo(result.terminalBalances[i], 6);
    }
  });
});

describe("runMonteCarloSimulation reproducibility", () => {
  it("produces identical results for the same seed", () => {
    const config = configWith({ numSimulations: 500, numTrades: 50, seed: 777 });
    const a = runMonteCarloSimulation(config);
    const b = runMonteCarloSimulation(config);
    expect(Array.from(a.terminalBalances)).toEqual(Array.from(b.terminalBalances));
    expect(Array.from(a.maxDrawdownPcts)).toEqual(Array.from(b.maxDrawdownPcts));
  });

  it("produces different results for different seeds", () => {
    const a = runMonteCarloSimulation(configWith({ numSimulations: 500, numTrades: 50, seed: 1 }));
    const b = runMonteCarloSimulation(configWith({ numSimulations: 500, numTrades: 50, seed: 2 }));
    expect(Array.from(a.terminalBalances)).not.toEqual(Array.from(b.terminalBalances));
  });
});

describe("runMonteCarloSimulation statistical sanity", () => {
  it("converges to the theoretical expectancy for a large run", () => {
    const config = configWith({ numSimulations: 5000, numTrades: 300, seed: 3 });
    const result = runMonteCarloSimulation(config);
    const meanPnlPerTrade =
      (Array.from(result.terminalBalances).reduce((s, b) => s + b, 0) / result.terminalBalances.length -
        config.startingBalance) /
      config.numTrades;
    expect(meanPnlPerTrade).toBeGreaterThan(result.theoreticalExpectancyPerTrade - 15);
    expect(meanPnlPerTrade).toBeLessThan(result.theoreticalExpectancyPerTrade + 15);
  });

  it("a 100% win rate strategy never draws down", () => {
    const config = configWith({
      numSimulations: 100,
      numTrades: 30,
      synthetic: { winRate: 0.999999, avgWinR: 1, avgLossR: 1, winnerShape: 10, loserShape: 10 },
    });
    const result = runMonteCarloSimulation(config);
    // with win rate this close to 1, drawdowns across 30 trades should be at or near zero for nearly all paths
    const meanDrawdown = Array.from(result.maxDrawdownPcts).reduce((s, d) => s + d, 0) / result.maxDrawdownPcts.length;
    expect(meanDrawdown).toBeLessThan(0.01);
  });

  it("minBalance is always <= startingBalance <= maxBalance when a loss is possible", () => {
    const config = configWith({ numSimulations: 200, numTrades: 30 });
    const result = runMonteCarloSimulation(config);
    for (let i = 0; i < result.minBalances.length; i++) {
      expect(result.minBalances[i]).toBeLessThanOrEqual(result.maxBalances[i]);
      expect(result.minBalances[i]).toBeLessThanOrEqual(config.startingBalance);
    }
  });
});

describe("runMonteCarloSimulation empirical mode", () => {
  it("bootstraps only from the provided R multiples", () => {
    const config = configWith({
      mode: "empirical",
      numSimulations: 20,
      numTrades: 15,
      empiricalRMultiples: [1, -1],
    });
    const result = runMonteCarloSimulation(config);
    // every trade moves balance by exactly +riskPerTrade or -riskPerTrade, so every curve
    // point should differ from its predecessor by exactly riskPerTrade in absolute value
    for (const curve of result.sampledCurves) {
      for (let t = 1; t < curve.length; t++) {
        expect(Math.abs(curve[t] - curve[t - 1])).toBeCloseTo(config.riskPerTrade, 6);
      }
    }
  });
});
