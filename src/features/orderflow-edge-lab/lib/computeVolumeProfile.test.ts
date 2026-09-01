import { describe, expect, it } from "vitest";
import { computeVolumeProfile } from "./computeVolumeProfile";
import type { OHLCVBar } from "../types";

const TICK = 0.25;

function bar(i: number, low: number, high: number, volume: number): OHLCVBar {
  return {
    symbol: "MES",
    timeframe: "5m",
    timestamp: new Date(2026, 2, 2, 14, 30 + 5 * i).toISOString(),
    open: (low + high) / 2,
    high,
    low,
    close: (low + high) / 2,
    volume,
    session: "RTH",
    barIndex: i,
  };
}

describe("computeVolumeProfile", () => {
  it("puts POC on the known highest-volume bucket", () => {
    const bars = [
      bar(0, 5100.0, 5100.25, 1000),
      bar(1, 5100.0, 5100.25, 1000),
      bar(2, 5100.0, 5100.25, 1000),
      bar(3, 5105.0, 5105.25, 50),
      bar(4, 5095.0, 5095.25, 50),
    ];
    const result = computeVolumeProfile(bars, TICK, 1);
    expect(result.poc).toBe(5100.0);
    expect(result.totalVolume).toBe(3100);
  });

  it("value area contains the target percentage of volume", () => {
    const bars = [
      bar(0, 5100.0, 5100.25, 1000),
      bar(1, 5105.0, 5105.25, 200),
      bar(2, 5095.0, 5095.25, 200),
      bar(3, 5110.0, 5110.25, 50),
    ];
    const result = computeVolumeProfile(bars, TICK, 1, 0.7);
    expect(result.val).toBeLessThanOrEqual(result.poc);
    expect(result.poc).toBeLessThanOrEqual(result.vah);
    expect(result.valueAreaVolumePct).toBeGreaterThanOrEqual(0.7);
  });

  it("returns a zeroed result for an empty bar list", () => {
    const result = computeVolumeProfile([], TICK);
    expect(result.levels).toEqual([]);
    expect(result.poc).toBe(0);
    expect(result.totalVolume).toBe(0);
  });

  it("detects a high-volume node at a known spike", () => {
    const bars = Array.from({ length: 10 }, (_, i) => bar(i, 5100.0 + i * 0.25, 5100.25 + i * 0.25, 50));
    bars.push(bar(10, 5102.0, 5102.25, 900));
    const result = computeVolumeProfile(bars, TICK, 1);
    expect(result.highVolumeNodes).toContain(5102.0);
  });
});
