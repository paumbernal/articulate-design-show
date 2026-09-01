import type { InstrumentSymbol, Session, Timeframe } from "./common";

/** Mirrors engine/src/edge_lab/models/market_data.py::OHLCVBar */
export interface OHLCVBar {
  symbol: InstrumentSymbol;
  timeframe: Timeframe;
  /** ISO 8601, UTC */
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  session: Session;
  barIndex: number;
}

/** Mirrors engine/src/edge_lab/models/market_data.py::PriceLevelVolume */
export interface PriceLevelVolume {
  price: number;
  bidVolume: number;
  askVolume: number;
}

/** Mirrors engine/src/edge_lab/models/market_data.py::SyntheticOrderFlowBar */
export interface SyntheticOrderFlowBar {
  symbol: InstrumentSymbol;
  timeframe: Timeframe;
  barIndex: number;
  bidVolume: number;
  askVolume: number;
  delta: number;
  cumulativeDelta: number;
  aggressiveBuyVolume: number;
  aggressiveSellVolume: number;
  imbalanceRatio: number;
  /** Reserved for a future footprint-grid view; not rendered by the MVP UI. */
  priceLevels?: PriceLevelVolume[] | null;
}
