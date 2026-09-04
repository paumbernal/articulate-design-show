import { describe, expect, it } from "vitest";
import { formatCompactCurrency, formatLossMetric } from "./formatters";

describe("formatLossMetric", () => {
  it("labels a positive value as an actual loss", () => {
    const { text, isActualLoss } = formatLossMetric(6150);
    expect(isActualLoss).toBe(true);
    expect(text).toContain("$6,150");
    expect(text).not.toContain("gain");
  });

  it("labels a negative value as a guaranteed minimum gain, not a loss", () => {
    const { text, isActualLoss } = formatLossMetric(-6150);
    expect(isActualLoss).toBe(false);
    expect(text).toContain("gain");
    expect(text).toContain("$6,150");
  });

  it("treats exactly zero as no loss", () => {
    const { isActualLoss } = formatLossMetric(0);
    expect(isActualLoss).toBe(false);
  });
});

describe("formatCompactCurrency", () => {
  it("abbreviates large values with a k/M suffix", () => {
    expect(formatCompactCurrency(60000)).toBe("$60K");
    expect(formatCompactCurrency(1500000)).toBe("$1.5M");
  });

  it("renders small values as plain currency", () => {
    expect(formatCompactCurrency(500)).toBe("$500");
  });
});
