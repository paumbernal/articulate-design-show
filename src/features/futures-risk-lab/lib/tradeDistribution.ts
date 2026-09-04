import { sampleGamma, type Rng } from "./rng";
import type { SyntheticDistributionParams } from "../types";

export const DEFAULT_WINNER_SHAPE = 2.5;
export const DEFAULT_LOSER_SHAPE = 8;

/**
 * Draws one trade outcome in R multiples from the synthetic distribution.
 *
 * Rather than emitting exactly +avgWinR on every win and exactly -avgLossR on every loss, each
 * side is modeled as a Gamma distribution whose mean is pinned to the requested average
 * (mean of Gamma(shape, scale) === shape * scale, so scale = target / shape). Gamma is a natural
 * choice here: it's supported on (0, infinity) — trade sizes in R can't be negative on their own
 * side of the coin — and its shape parameter directly controls skew/spread:
 *
 * - Winners default to a lower shape (more spread, right-skewed) to reflect that a trend/breakout
 *   style edge occasionally lets a winner run well past the "average" target.
 * - Losers default to a higher shape (tighter, closer to a spike at avgLossR) to reflect that a
 *   hard stop-loss caps most losing trades at close to the same size, with only modest variation
 *   from slippage/gaps.
 *
 * Both shape parameters are configurable so a user can widen/narrow either tail.
 */
export function sampleTradeR(params: SyntheticDistributionParams, rng: Rng): number {
  const isWin = rng() < params.winRate;
  if (isWin) {
    const scale = params.avgWinR / params.winnerShape;
    return sampleGamma(rng, params.winnerShape, scale);
  }
  const scale = params.avgLossR / params.loserShape;
  return -sampleGamma(rng, params.loserShape, scale);
}

/** Bootstrap-samples one R multiple, with replacement, from an empirical trade set. */
export function sampleEmpiricalR(rMultiples: number[], rng: Rng): number {
  if (rMultiples.length === 0) {
    throw new Error("sampleEmpiricalR: no empirical R multiples to sample from");
  }
  const idx = Math.floor(rng() * rMultiples.length);
  return rMultiples[Math.min(idx, rMultiples.length - 1)];
}

/**
 * Closed-form expected value per trade in R, independent of any simulation:
 * E[R] = winRate * avgWinR - (1 - winRate) * avgLossR.
 * Simulated means should converge to this as numSimulations/numTrades grow — that convergence
 * is itself a useful sanity check on the Monte Carlo engine (see lib/monteCarlo.test.ts).
 */
export function theoreticalExpectancyR(params: SyntheticDistributionParams): number {
  return params.winRate * params.avgWinR - (1 - params.winRate) * params.avgLossR;
}
