import { describe, expect, it } from "vitest";
import { computeEmpiricalStats, parseTradeCsv, resolveRMultiples } from "./csvParser";

describe("parseTradeCsv", () => {
  it("parses a well-formed date,pnl,r_multiple CSV", () => {
    const csv = ["date,pnl,r_multiple", "2026-01-02,240,1.2", "2026-01-03,-200,-1.0"].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(issues).toEqual([]);
    expect(trades).toHaveLength(2);
    expect(trades[0]).toMatchObject({ date: "2026-01-02", pnl: 240, rMultiple: 1.2 });
    expect(trades[1]).toMatchObject({ date: "2026-01-03", pnl: -200, rMultiple: -1.0 });
  });

  it("accepts optional extra columns and ignores unknown ones with a warning", () => {
    const csv = [
      "date,pnl,r_multiple,instrument,entry_price,exit_price,position_size,fees,notes",
      "2026-01-02,240,1.2,MNQ,21500,21510,1,2.5,great trade",
    ].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(trades).toHaveLength(1);
    expect(trades[0].instrument).toBe("MNQ");
    expect(trades[0].fees).toBe(2.5);
    expect(issues.some((i) => i.message.includes("notes"))).toBe(true);
  });

  it("handles quoted fields containing commas", () => {
    const csv = ['date,pnl,r_multiple,instrument', '2026-01-02,240,1.2,"MNQ, front month"'].join("\n");
    const { trades } = parseTradeCsv(csv);
    expect(trades[0].instrument).toBe("MNQ, front month");
  });

  it("works with only an r_multiple column (no pnl)", () => {
    const csv = ["date,r_multiple", "2026-01-02,1.2", "2026-01-03,-1.0"].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(issues).toEqual([]);
    expect(trades).toHaveLength(2);
  });

  it("skips rows with a non-numeric pnl and reports why", () => {
    const csv = ["date,pnl", "2026-01-02,240", "2026-01-03,not-a-number"].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(trades).toHaveLength(1);
    expect(issues.some((i) => i.row === 3)).toBe(true);
  });

  it("skips rows missing both pnl and r_multiple", () => {
    const csv = ["date,pnl,r_multiple", "2026-01-02,,", "2026-01-03,240,1.2"].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(trades).toHaveLength(1);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("rejects a CSV with neither pnl nor r_multiple columns", () => {
    const csv = ["date,instrument", "2026-01-02,MNQ"].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(trades).toEqual([]);
    expect(issues[0].message).toMatch(/pnl.*r_multiple/i);
  });

  it("returns an issue for a completely empty file", () => {
    const { trades, issues } = parseTradeCsv("");
    expect(trades).toEqual([]);
    expect(issues.length).toBe(1);
  });

  it("skips malformed rows with a mismatched column count", () => {
    const csv = ["date,pnl,r_multiple", "2026-01-02,240,1.2,extra-field"].join("\n");
    const { trades, issues } = parseTradeCsv(csv);
    expect(trades).toHaveLength(0);
    expect(issues[0].message).toMatch(/column/i);
  });
});

describe("resolveRMultiples", () => {
  it("prefers explicit r_multiple over a derived value from pnl", () => {
    const trades = [{ pnl: 999, rMultiple: 1.2 }];
    expect(resolveRMultiples(trades, 200)).toEqual([1.2]);
  });

  it("derives r_multiple from pnl / riskPerTrade when r_multiple is absent", () => {
    const trades = [{ pnl: 240 }, { pnl: -200 }];
    expect(resolveRMultiples(trades, 200)).toEqual([1.2, -1.0]);
  });

  it("drops trades with neither field", () => {
    const trades = [{ instrument: "MNQ" }];
    expect(resolveRMultiples(trades, 200)).toEqual([]);
  });
});

describe("computeEmpiricalStats", () => {
  it("computes win rate, averages, expectancy, profit factor, and drawdown on a known set", () => {
    // R multiples: +1.2, +1.2, +1.2, -1, -1  => win rate 3/5, avgWin 1.2, avgLoss -1
    const trades = [
      { rMultiple: 1.2 },
      { rMultiple: 1.2 },
      { rMultiple: 1.2 },
      { rMultiple: -1 },
      { rMultiple: -1 },
    ];
    const stats = computeEmpiricalStats(trades, 200);
    expect(stats.sampleSize).toBe(5);
    expect(stats.winRate).toBeCloseTo(0.6, 6);
    expect(stats.avgWinR).toBeCloseTo(1.2, 6);
    expect(stats.avgLossR).toBeCloseTo(-1.0, 6);
    expect(stats.expectancyR).toBeCloseTo((1.2 * 3 - 1 * 2) / 5, 6);
    // grossProfit = 3.6, grossLoss = 2 -> profit factor 1.8
    expect(stats.profitFactor).toBeCloseTo(1.8, 6);
  });

  it("computes historical max drawdown in R as the worst peak-to-trough decline", () => {
    // cumulative R: 1, 2, 1, 0, 2 -> drawdown from peak 2 down to 0 = 2R
    const trades = [{ rMultiple: 1 }, { rMultiple: 1 }, { rMultiple: -1 }, { rMultiple: -1 }, { rMultiple: 2 }];
    const stats = computeEmpiricalStats(trades, 200);
    expect(stats.historicalMaxDrawdownR).toBeCloseTo(2, 6);
  });

  it("returns nulls for an empty trade list rather than throwing", () => {
    const stats = computeEmpiricalStats([], 200);
    expect(stats.sampleSize).toBe(0);
    expect(stats.winRate).toBeNull();
    expect(stats.profitFactor).toBeNull();
  });

  it("handles an all-winners set (undefined profit factor denominator) without throwing", () => {
    const trades = [{ rMultiple: 1 }, { rMultiple: 2 }];
    const stats = computeEmpiricalStats(trades, 200);
    expect(stats.profitFactor).toBeNull();
    expect(stats.avgLossR).toBeNull();
  });
});
