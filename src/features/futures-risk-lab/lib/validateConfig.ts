import { MAX_SIMULATIONS, MAX_TRADES, MIN_SIMULATIONS, MIN_TRADES } from "./defaults";
import type { SimulationConfig, ValidationIssue } from "../types";

/** Validates a simulation config and returns a list of human-readable issues (empty === valid). */
export function validateConfig(config: SimulationConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!(config.startingBalance > 0)) {
    issues.push({ field: "startingBalance", message: "Starting balance must be greater than $0." });
  }
  if (!(config.riskPerTrade > 0)) {
    issues.push({ field: "riskPerTrade", message: "Risk per trade must be greater than $0." });
  }
  if (config.riskPerTrade >= config.startingBalance) {
    issues.push({ field: "riskPerTrade", message: "Risk per trade should be smaller than the starting balance." });
  }
  if (!Number.isInteger(config.numTrades) || config.numTrades < MIN_TRADES || config.numTrades > MAX_TRADES) {
    issues.push({ field: "numTrades", message: `Number of trades must be an integer between ${MIN_TRADES} and ${MAX_TRADES}.` });
  }
  if (
    !Number.isInteger(config.numSimulations) ||
    config.numSimulations < MIN_SIMULATIONS ||
    config.numSimulations > MAX_SIMULATIONS
  ) {
    issues.push({
      field: "numSimulations",
      message: `Number of simulations must be an integer between ${MIN_SIMULATIONS} and ${MAX_SIMULATIONS}.`,
    });
  }

  if (config.mode === "synthetic") {
    const s = config.synthetic;
    if (!(s.winRate > 0 && s.winRate < 1)) {
      issues.push({ field: "winRate", message: "Win rate must be between 0% and 100% (exclusive)." });
    }
    if (!(s.avgWinR > 0)) {
      issues.push({ field: "avgWinR", message: "Average winning trade must be a positive R multiple." });
    }
    if (!(s.avgLossR > 0)) {
      issues.push({ field: "avgLossR", message: "Average losing trade must be a positive R multiple (magnitude)." });
    }
    if (!(s.winnerShape >= 1)) {
      issues.push({ field: "winnerShape", message: "Winner shape parameter must be >= 1." });
    }
    if (!(s.loserShape >= 1)) {
      issues.push({ field: "loserShape", message: "Loser shape parameter must be >= 1." });
    }
  } else {
    if (config.empiricalRMultiples.length < 10) {
      issues.push({
        field: "empiricalRMultiples",
        message: "Historical mode needs at least 10 parsed trades with a usable R multiple.",
      });
    }
  }

  return issues;
}
