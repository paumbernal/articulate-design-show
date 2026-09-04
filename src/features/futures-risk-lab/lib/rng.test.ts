import { describe, expect, it } from "vitest";
import { createRng, sampleGamma, sampleGaussian } from "./rng";

describe("createRng", () => {
  it("is deterministic for a given seed", () => {
    const a = createRng(123);
    const b = createRng(123);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it("stays within [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 5000; i++) {
      const x = rng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it("has a roughly uniform mean over many draws", () => {
    const rng = createRng(99);
    let sum = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) sum += rng();
    expect(sum / n).toBeGreaterThan(0.47);
    expect(sum / n).toBeLessThan(0.53);
  });
});

describe("sampleGaussian", () => {
  it("has approximately mean 0, stdev 1 over many draws", () => {
    const rng = createRng(5);
    const n = 20000;
    const samples = Array.from({ length: n }, () => sampleGaussian(rng));
    const mean = samples.reduce((s, x) => s + x, 0) / n;
    const variance = samples.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    expect(mean).toBeGreaterThan(-0.05);
    expect(mean).toBeLessThan(0.05);
    expect(Math.sqrt(variance)).toBeGreaterThan(0.9);
    expect(Math.sqrt(variance)).toBeLessThan(1.1);
  });
});

describe("sampleGamma", () => {
  it("converges to the requested mean (shape * scale)", () => {
    const rng = createRng(11);
    const shape = 3;
    const scale = 2;
    const n = 20000;
    const samples = Array.from({ length: n }, () => sampleGamma(rng, shape, scale));
    const mean = samples.reduce((s, x) => s + x, 0) / n;
    expect(mean).toBeGreaterThan(shape * scale * 0.95);
    expect(mean).toBeLessThan(shape * scale * 1.05);
  });

  it("only produces positive values", () => {
    const rng = createRng(12);
    for (let i = 0; i < 2000; i++) {
      expect(sampleGamma(rng, 2.5, 0.5)).toBeGreaterThan(0);
    }
  });

  it("throws for shape < 1", () => {
    const rng = createRng(1);
    expect(() => sampleGamma(rng, 0.5, 1)).toThrow();
  });

  it("a higher shape (for a fixed mean) produces lower variance", () => {
    const mean = 1.2;
    const nSamples = 20000;
    const tightShape = 20;
    const wideShape = 1.5;

    const rngTight = createRng(21);
    const tight = Array.from({ length: nSamples }, () => sampleGamma(rngTight, tightShape, mean / tightShape));
    const rngWide = createRng(22);
    const wide = Array.from({ length: nSamples }, () => sampleGamma(rngWide, wideShape, mean / wideShape));

    const varianceOf = (xs: number[]) => {
      const m = xs.reduce((s, x) => s + x, 0) / xs.length;
      return xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length;
    };

    expect(varianceOf(tight)).toBeLessThan(varianceOf(wide));
  });
});
