import { describe, expect, it } from "vitest";
import { buildHistogram } from "./histogram";

describe("buildHistogram", () => {
  it("counts every value exactly once across all bins", () => {
    const values = Array.from({ length: 500 }, (_, i) => i);
    const bins = buildHistogram(values, 20);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(500);
    expect(bins).toHaveLength(20);
  });

  it("places known values into the expected bin", () => {
    // 0..99 in 10 bins of width 10: values 0-9 in bin 0, 90-99 in bin 9
    const values = Array.from({ length: 100 }, (_, i) => i);
    const bins = buildHistogram(values, 10);
    expect(bins[0].count).toBe(10);
    expect(bins[9].count).toBe(10);
  });

  it("returns a single full bin when all values are identical", () => {
    const bins = buildHistogram([5, 5, 5, 5], 10);
    expect(bins).toHaveLength(1);
    expect(bins[0].count).toBe(4);
  });

  it("returns an empty array for an empty input", () => {
    expect(buildHistogram([], 10)).toEqual([]);
  });

  it("produces contiguous, non-overlapping bin edges", () => {
    const values = [1, 5, 9, 20, 33, 47, 50];
    const bins = buildHistogram(values, 5);
    for (let i = 1; i < bins.length; i++) {
      expect(bins[i].binStart).toBeCloseTo(bins[i - 1].binEnd, 9);
    }
  });
});
