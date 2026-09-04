import { DEFAULT_LOSER_SHAPE, DEFAULT_WINNER_SHAPE } from "./tradeDistribution";
import type { SimulationConfig } from "../types";

/**
 * Default synthetic model, seeded from the stated MNQ strategy assumptions:
 * 59% win rate, +1.2R average winner, -1R average loser, $200 risk per trade
 * (≈ +$240 average win, -$200 average loss, ≈ +$60.40 expectancy per trade).
 */
export const DEFAULT_CONFIG: SimulationConfig = {
  mode: "synthetic",
  startingBalance: 50_000,
  riskPerTrade: 200,
  numTrades: 200,
  numSimulations: 10_000,
  seed: 42,
  synthetic: {
    winRate: 0.59,
    avgWinR: 1.2,
    avgLossR: 1.0,
    winnerShape: DEFAULT_WINNER_SHAPE,
    loserShape: DEFAULT_LOSER_SHAPE,
  },
  empiricalRMultiples: [],
};

export const DEFAULT_DRAWDOWN_THRESHOLDS_PCT = [10, 20, 30];
export const DEFAULT_RUIN_THRESHOLD_PCT = 50; // ruin := balance falls to <= 50% of starting balance
export const DEFAULT_TARGET_BALANCE = DEFAULT_CONFIG.startingBalance * 1.5;

export const MIN_SIMULATIONS = 100;
export const MAX_SIMULATIONS = 50_000;
export const MIN_TRADES = 10;
export const MAX_TRADES = 2_000;
