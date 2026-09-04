/**
 * Seedable pseudo-random number generation for the Monte Carlo engine.
 *
 * Using a seeded PRNG (instead of Math.random) is what makes a simulation reproducible: the
 * same config + the same seed always produces the exact same set of simulated paths, which is
 * required for the unit tests below and useful in the UI ("lock seed" to compare two parameter
 * sets on the same underlying randomness).
 */

export type Rng = () => number;

/** mulberry32 — small, fast, decent statistical quality, good enough for this use case. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal variate via the Marsaglia polar method. */
export function sampleGaussian(rng: Rng): number {
  let u: number, v: number, s: number;
  do {
    u = rng() * 2 - 1;
    v = rng() * 2 - 1;
    s = u * u + v * v;
  } while (s === 0 || s >= 1);
  const mul = Math.sqrt((-2 * Math.log(s)) / s);
  return u * mul;
}

/**
 * Gamma(shape, scale) variate via Marsaglia & Tsang (2000), "A Simple Method for Generating
 * Gamma Variables". Requires shape >= 1 (the trade-distribution model never needs shape < 1 —
 * see lib/tradeDistribution.ts — so the small-shape boost trick is intentionally left out to
 * keep this function simple).
 */
export function sampleGamma(rng: Rng, shape: number, scale: number): number {
  if (shape < 1) {
    throw new Error(`sampleGamma: shape must be >= 1, got ${shape}`);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = sampleGaussian(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    const x2 = x * x;
    if (u < 1 - 0.0331 * x2 * x2) return d * v * scale;
    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v * scale;
  }
}
