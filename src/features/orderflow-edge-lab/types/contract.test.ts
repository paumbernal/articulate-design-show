import { readFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import type {
  BacktestStatistics,
  BacktestTrade,
  DetectedCondition,
  EdgeScoreResult,
  OHLCVBar,
  SetupDefinition,
  SyntheticOrderFlowBar,
} from "./index";

/**
 * Validates that hand-written TS fixtures conform to the JSON Schema
 * exported from the Python models (engine/schemas/*.schema.json). This is
 * the automatic tripwire against the two sides drifting — see
 * engine/src/edge_lab/cli/export_schemas.py.
 */

const schemasDir = path.resolve(__dirname, "../../../../engine/schemas");

function loadSchema(name: string): object {
  return JSON.parse(readFileSync(path.join(schemasDir, `${name}.schema.json`), "utf-8"));
}

const ajv = new Ajv2020({ strict: false });
addFormats(ajv);

function expectValid(schemaName: string, value: unknown) {
  const validate = ajv.compile(loadSchema(schemaName));
  const valid = validate(value);
  expect(valid, JSON.stringify(validate.errors)).toBe(true);
}

describe("Python <-> TS model contract", () => {
  it("OHLCVBar fixture matches schema", () => {
    const bar: OHLCVBar = {
      symbol: "MES",
      timeframe: "5m",
      timestamp: "2026-03-02T14:30:00Z",
      open: 5100,
      high: 5102,
      low: 5099,
      close: 5101,
      volume: 1200,
      session: "RTH",
      barIndex: 0,
    };
    expectValid("OHLCVBar", bar);
  });

  it("SyntheticOrderFlowBar fixture matches schema", () => {
    const bar: SyntheticOrderFlowBar = {
      symbol: "MNQ",
      timeframe: "5m",
      barIndex: 3,
      bidVolume: 400,
      askVolume: 650,
      delta: 250,
      cumulativeDelta: 1100,
      aggressiveBuyVolume: 300,
      aggressiveSellVolume: 120,
      imbalanceRatio: 1.625,
    };
    expectValid("SyntheticOrderFlowBar", bar);
  });

  it("DetectedCondition fixture matches schema", () => {
    const condition: DetectedCondition = {
      id: "cond-1",
      symbol: "MES",
      timeframe: "5m",
      barIndex: 42,
      timestamp: "2026-03-02T14:35:00Z",
      signalType: "poc_sweep",
      direction: "bullish",
      strength: 0.8,
      evidence: { sweptLevel: 5098.5, volumeMultiple: 3.2 },
    };
    expectValid("DetectedCondition", condition);
  });

  it("SetupDefinition fixture matches schema", () => {
    const setup: SetupDefinition = {
      id: "poc-sweep-absorption-reversal",
      name: "POC Sweep + Absorption Reversal",
      description: "Sweep of a prior high/low followed by absorption and failure to continue.",
      version: 1,
      rules: [
        { signalType: "poc_sweep", weight: 20, required: true, params: {} },
        { signalType: "absorption", weight: 20, required: true, sequenceWithinBars: 3, params: {} },
      ],
      minEdgeScoreDefault: 60,
      entryMethodology: "close_of_trigger_bar",
      stopMethodology: "swept_level_plus_buffer",
      targetMethodology: "fixed_r_multiple",
      maxHoldBars: 24,
    };
    expectValid("SetupDefinition", setup);
  });

  it("EdgeScoreResult fixture matches schema", () => {
    const result: EdgeScoreResult = {
      setupId: "poc-sweep-absorption-reversal",
      setupVersion: 1,
      symbol: "MES",
      timeframe: "5m",
      triggerBarIndex: 42,
      triggerTimestamp: "2026-03-02T14:35:00Z",
      direction: "bullish",
      score: 82,
      maxScore: 100,
      metRequiredRules: true,
      componentScores: [
        { signalType: "poc_sweep", weight: 20, present: true, contribution: 20 },
      ],
    };
    expectValid("EdgeScoreResult", result);
  });

  it("BacktestTrade fixture matches schema", () => {
    const trade: BacktestTrade = {
      id: "trade-1",
      setupId: "poc-sweep-absorption-reversal",
      setupVersion: 1,
      symbol: "MES",
      direction: "bullish",
      edgeScoreAtEntry: 82,
      entryBarIndex: 42,
      entryTimestamp: "2026-03-02T14:35:00Z",
      entryPrice: 5101,
      stopPrice: 5098,
      targetPrice: 5110,
      exitBarIndex: 50,
      exitTimestamp: "2026-03-02T15:00:00Z",
      exitPrice: 5110,
      exitReason: "target",
      holdBars: 8,
      pnlPoints: 9,
      pnlR: 3,
      mfePoints: 9.5,
      maePoints: 1.2,
      timeToExitBars: 8,
      session: "RTH",
      dayOfWeek: "Mon",
      hourOfDay: 9,
      costsAssumedPoints: 0.5,
      isOutOfSample: false,
    };
    expectValid("BacktestTrade", trade);
  });

  it("BacktestStatistics fixture matches schema", () => {
    const stats: BacktestStatistics = {
      config: {
        symbol: "MES",
        dateRangeStart: "2026-01-01T00:00:00Z",
        dateRangeEnd: "2026-03-01T00:00:00Z",
        session: "RTH",
        setupId: "poc-sweep-absorption-reversal",
        setupVersion: 1,
        minEdgeScore: 60,
        entryMethodology: "close_of_trigger_bar",
        stopMethodology: "swept_level_plus_buffer",
        targetMethodology: "fixed_r_multiple",
        maxHoldBars: 24,
        costsAssumedPoints: 0.5,
      },
      sampleSize: 42,
      winRate: 0.55,
      avgReturnPoints: 2.1,
      avgR: 0.6,
      expectancy: 0.35,
      profitFactor: 1.4,
      maxDrawdownPoints: -18,
      maxDrawdownR: -6,
      outcomeDistribution: [{ label: "-2R to -1R", n: 5 }],
      avgMfePoints: 5.2,
      avgMaePoints: 2.1,
      avgTimeToTargetBars: 6.5,
      avgTimeToStopBars: 3.2,
      breakdowns: {
        byTimeOfDay: [{ label: "09:00", n: 10, winRate: 0.6, avgR: 0.7, expectancy: 0.4 }],
        byDayOfWeek: [{ label: "Mon", n: 8, winRate: 0.5, avgR: 0.4, expectancy: 0.2 }],
        bySession: [{ label: "RTH", n: 42, winRate: 0.55, avgR: 0.6, expectancy: 0.35 }],
        byEdgeScoreBucket: [{ label: "60-80", n: 20, winRate: 0.5, avgR: 0.5, expectancy: 0.25 }],
      },
      validation: {
        inSampleN: 30,
        outOfSampleN: 12,
        significance: {
          method: "one-sample two-sided t-test against zero mean R",
          pValue: 0.04,
          ciLow: 0.05,
          ciHigh: 1.15,
        },
        warnings: ["Out-of-sample n < 30 — treat results as directional, not conclusive."],
      },
    };
    expectValid("BacktestStatistics", stats);
  });
});
