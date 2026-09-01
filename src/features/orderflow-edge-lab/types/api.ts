import type { InstrumentSymbol, Session, Timeframe } from "./common";
import type { BacktestStatistics, BacktestTrade } from "./backtest";

/** Mirrors engine/src/edge_lab/api/routers/meta.py::MetaResponse */
export interface MetaResponse {
  isSyntheticData: boolean;
  disclaimer: string;
  assumptionsMarkdown: string;
  supportedSymbols: InstrumentSymbol[];
}

export interface MarketDataQuery {
  symbol: InstrumentSymbol;
  timeframe: Timeframe;
  start: string; // "YYYY-MM-DD"
  end: string;
}

/**
 * Mirrors engine/src/edge_lab/api/routers/backtest.py::BacktestRequest,
 * plus `session` — a static-mode-only client-side filter (the live API
 * doesn't support session filtering yet; the live client ignores it).
 */
export interface BacktestRequest {
  symbol: InstrumentSymbol;
  timeframe: Timeframe;
  start: string;
  end: string;
  setupId: string;
  minEdgeScore?: number | null;
  session?: Session | "ANY";
  outOfSampleFraction?: number;
  costsPoints?: number;
  rMultiple?: number;
  stopBufferTicks?: number;
}

/** Mirrors engine/src/edge_lab/api/routers/backtest.py::BacktestRunResult */
export interface BacktestRunResult {
  trades: BacktestTrade[];
  statistics: BacktestStatistics;
}
