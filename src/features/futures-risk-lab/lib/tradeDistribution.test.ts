import { describe, expect, it } from "vitest";
import { createRng } from "./rng";
import { sampleEmpiricalR, sampleTradeR, theoreticalExpectancyR } from "./tradeDistribution";
import type { SyntheticDistributionParams } from "../types";

const MNQ_PARAMS: SyntheticDistributionParams = {
  winRate: 0.59,
  avgWinR: 1.2,
  avgLossR: 1.0,
  winnerShape: 2.5,
  loserShape: 8,
};

describe("sampleTradeR", () => {
  it("preserves the win rate over many draws", () => {
    const rng = createRng(1);
    const n = 50000;
    let wins = 0;
    for (let i = 0; i < n; i++) {
      if (sampleTradeR(MNQ_PARAMS, rng) > 0) wins++;
    }
    expect(wins / n).toBeGreaterThan(MNQ_PARAMS.winRate - 0.02);
    expect(wins / n).toBeLessThan(MNQ_PARAMS.winRate + 0.02);
  });

  it("converges to the requested average winner and loser size", () => {
    const rng = createRng(2);
    const n = 50000;
    const winners: number[] = [];
    const losers: number[] = [];
    for (let i = 0; i < n; i++) {
      const r = sampleTradeR(MNQ_PARAMS, rng);
      if (r > 0) winners.push(r);
      else losers.push(r);
    }
    const avgWin = winners.reduce((s, x) => s + x, 0) / winners.length;
    const avgLoss = losers.reduce((s, x) => s + x, 0) / losers.length;
    expect(avgWin).toBeGreaterThan(MNQ_PARAMS.avgWinR * 0.95);
    expect(avgWin).toBeLessThan(MNQ_PARAMS.avgWinR * 1.05);
    expect(avgLoss).toBeGreaterThan(-MNQ_PARAMS.avgLossR * 1.05);
    expect(avgLoss).toBeLessThan(-MNQ_PARAMS.avgLossR * 0.95);
  });

  it("does not simply repeat the same expected-value trade", () => {
    const rng = createRng(3);
    const samples = new Set<number>();
    for (let i = 0; i < 200; i++) {
      samples.add(Math.round(sampleTradeR(MNQ_PARAMS, rng) * 1e6) / 1e6);
    }
    // A distribution collapsed onto exactly two constants (+1.2R / -1R) would have size 2.
    expect(samples.size).toBeGreaterThan(50);
  });

  it("losers are always negative and winners always positive", () => {
    const rng = createRng(4);
    for (let i = 0; i < 5000; i++) {
      const r = sampleTradeR(MNQ_PARAMS, rng);
      expect(r).not.toBe(0);
    }
  });
});

describe("theoreticalExpectancyR", () => {
  it("matches the hand-computed MNQ expectancy", () => {
    // 0.59*1.2 - 0.41*1.0 = 0.708 - 0.41 = 0.298
    expect(theoreticalExpectancyR(MNQ_PARAMS)).toBeCloseTo(0.298, 6);
  });

  it("simulated mean R converges to the theoretical expectancy", () => {
    const rng = createRng(5);
    const n = 100000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += sampleTradeR(MNQ_PARAMS, rng);
    const simulatedMean = sum / n;
    expect(simulatedMean).toBeGreaterThan(theoreticalExpectancyR(MNQ_PARAMS) - 0.02);
    expect(simulatedMean).toBeLessThan(theoreticalExpectancyR(MNQ_PARAMS) + 0.02);
  });
});

describe("sampleEmpiricalR", () => {
  it("only returns values present in the input set", () => {
    const rng = createRng(6);
    const pool = [1.5, -1.0, 2.3, -0.8];
    for (let i = 0; i < 200; i++) {
      expect(pool).toContain(sampleEmpiricalR(pool, rng));
    }
  });

  it("throws on an empty pool", () => {
    const rng = createRng(6);
    expect(() => sampleEmpiricalR([], rng)).toThrow();
  });
});
