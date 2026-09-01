import type { DayOfWeek, Direction, ExitReason, InstrumentSymbol, Session } from "./common";

/** Mirrors engine/src/edge_lab/models/backtest.py::BacktestTrade */
export interface BacktestTrade {
  id: string;
  setupId: string;
  setupVersion: number;
  symbol: InstrumentSymbol;
  direction: Direction;
  edgeScoreAtEntry: number;

  entryBarIndex: number;
  entryTimestamp: string;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;

  exitBarIndex: number;
  exitTimestamp: string;
  exitPrice: number;
  exitReason: ExitReason;

  holdBars: number;
  pnlPoints: number;
  /** pnlPoints / initial risk in points */
  pnlR: number;
  mfePoints: number;
  maePoints: number;
  timeToExitBars: number;

  session: Session;
  dayOfWeek: DayOfWeek;
  /** Entry hour in the instrument's local exchange timezone */
  hourOfDay: number;

  /** Slippage + fees assumed per trade, in points — always explicit, never hidden */
  costsAssumedPoints: number;
  isOutOfSample: boolean;
}

/** Mirrors engine/src/edge_lab/models/backtest.py::BacktestConfigSnapshot */
export interface BacktestConfigSnapshot {
  symbol: InstrumentSymbol;
  dateRangeStart: string;
  dateRangeEnd: string;
  session: Session | "ANY";
  setupId: string;
  setupVersion: number;
  minEdgeScore: number;
  entryMethodology: string;
  stopMethodology: string;
  targetMethodology: string;
  maxHoldBars: number;
  costsAssumedPoints: number;
  /** Trades at/after this timestamp are treated as out-of-sample */
  outOfSampleSplit?: string | null;
}

/** Mirrors engine/src/edge_lab/models/backtest.py::BreakdownRow */
export interface BreakdownRow {
  label: string;
  n: number;
  winRate?: number | null;
  avgR?: number | null;
  expectancy?: number | null;
}

/** Mirrors engine/src/edge_lab/models/backtest.py::Breakdowns */
export interface Breakdowns {
  byTimeOfDay: BreakdownRow[];
  byDayOfWeek: BreakdownRow[];
  bySession: BreakdownRow[];
  byEdgeScoreBucket: BreakdownRow[];
}

/** Mirrors engine/src/edge_lab/models/backtest.py::SignificanceResult */
export interface SignificanceResult {
  method: string;
  pValue?: number | null;
  ciLow?: number | null;
  ciHigh?: number | null;
  winRateCiLow?: number | null;
  winRateCiHigh?: number | null;
}

/** Mirrors engine/src/edge_lab/models/backtest.py::ValidationSummary */
export interface ValidationSummary {
  inSampleN: number;
  outOfSampleN: number;
  significance: SignificanceResult;
  /** Auto-populated caveats: small sample, look-ahead bias, unrealistic fills, etc. */
  warnings: string[];
}

/** Mirrors engine/src/edge_lab/models/backtest.py::BacktestStatistics */
export interface BacktestStatistics {
  config: BacktestConfigSnapshot;
  sampleSize: number;
  winRate?: number | null;
  avgReturnPoints?: number | null;
  avgR?: number | null;
  expectancy?: number | null;
  profitFactor?: number | null;
  maxDrawdownPoints?: number | null;
  maxDrawdownR?: number | null;
  /** Histogram buckets over pnlR, reusing BreakdownRow as {label, n} */
  outcomeDistribution: BreakdownRow[];
  avgMfePoints?: number | null;
  avgMaePoints?: number | null;
  avgTimeToTargetBars?: number | null;
  avgTimeToStopBars?: number | null;
  breakdowns: Breakdowns;
  validation: ValidationSummary;
}
