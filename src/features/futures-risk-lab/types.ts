/**
 * Futures Risk Lab — shared types.
 *
 * The engine (lib/) is pure TypeScript with no React/UI imports, so it can be
 * unit tested and reasoned about independently of the dashboard that consumes it.
 */

export type SimulationMode = "synthetic" | "empirical";

/** Parameters for the synthetic trade-return distribution (see lib/tradeDistribution.ts). */
export interface SyntheticDistributionParams {
  /** Probability a trade is a winner, in [0, 1]. */
  winRate: number;
  /** Average winning trade size, in R multiples (e.g. 1.2 means +1.2R on average). */
  avgWinR: number;
  /** Average losing trade size, in R multiples, expressed as a positive magnitude (e.g. 1.0 means -1.0R on average). */
  avgLossR: number;
  /**
   * Gamma-distribution shape parameter for winning trades. Lower values (closer to 1) mean
   * winners are more spread out / right-skewed (occasional big runners); higher values mean
   * winners cluster tightly around avgWinR. Must be >= 1.
   */
  winnerShape: number;
  /** Same idea as winnerShape, applied to the magnitude of losing trades. Must be >= 1. */
  loserShape: number;
}

/** One row of an uploaded historical-trade CSV, after parsing. */
export interface EmpiricalTradeRecord {
  date?: string;
  pnl?: number;
  rMultiple?: number;
  instrument?: string;
  entryPrice?: number;
  exitPrice?: number;
  positionSize?: number;
  fees?: number;
  entryTime?: string;
  exitTime?: string;
}

export interface SimulationConfig {
  mode: SimulationMode;
  /** Starting account balance in dollars. */
  startingBalance: number;
  /** Dollar amount risked per trade — this is what "1R" means in dollar terms. */
  riskPerTrade: number;
  /** Number of trades simulated per equity path. */
  numTrades: number;
  /** Number of independent Monte Carlo paths. */
  numSimulations: number;
  /** PRNG seed. Same config + same seed always reproduces the same result. */
  seed: number;
  synthetic: SyntheticDistributionParams;
  /**
   * R-multiples to bootstrap-sample from when mode === "empirical". Derived from an uploaded
   * CSV (lib/csvParser.ts). Ignored in synthetic mode.
   */
  empiricalRMultiples: number[];
}

export interface PercentileSet {
  p5: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

/** One checkpoint of the equity-curve fan chart: the distribution of balances across paths after N trades. */
export interface EquityCurveBandPoint {
  tradeIndex: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

/**
 * Raw output of a Monte Carlo run. Deliberately holds only per-path summary arrays (not full
 * equity curves for every path — see lib/monteCarlo.ts for why) plus a bounded sample of full
 * curves for charting. All derived risk metrics (VaR, CVaR, risk of ruin, target probabilities,
 * drawdown-threshold probabilities) are computed on demand from these arrays by lib/riskMetrics.ts,
 * so the UI can recompute them instantly when the user changes a threshold without re-running
 * the simulation.
 */
export interface SimulationResult {
  config: SimulationConfig;
  /** Final account balance for every simulated path. Length === numSimulations. */
  terminalBalances: Float64Array;
  /** Maximum peak-to-trough drawdown for every path, as a fraction (0.23 === 23%). Length === numSimulations. */
  maxDrawdownPcts: Float64Array;
  /** Lowest balance reached at any point during each path. Length === numSimulations. */
  minBalances: Float64Array;
  /** Highest balance reached at any point during each path. Length === numSimulations. */
  maxBalances: Float64Array;
  /** Full equity curves for a bounded subsample of paths, for the fan-chart spaghetti lines. */
  sampledCurves: number[][];
  /** Percentile bands of balance at every trade index, computed from the same subsample as sampledCurves. */
  equityCurveBands: EquityCurveBandPoint[];
  /** Theoretical (closed-form) per-trade expectancy in dollars, independent of simulation noise. */
  theoreticalExpectancyPerTrade: number;
}

export interface DrawdownThresholdResult {
  thresholdPct: number;
  probabilityExceeded: number;
}

export interface TargetProbabilities {
  /** P(balance touches or exceeds the target at any point during the simulated horizon). */
  probReachTargetAnyPoint: number;
  /** P(the path ends at or above the target). */
  probFinishAtOrAboveTarget: number;
  /** P(the path ends below the starting balance). */
  probFinishBelowStart: number;
}

export interface ValidationIssue {
  field: string;
  message: string;
}
