import type { Direction, InstrumentSymbol, SignalType, Timeframe } from "./common";

/** Mirrors engine/src/edge_lab/models/conditions.py::DetectedCondition */
export interface DetectedCondition {
  id: string;
  symbol: InstrumentSymbol;
  timeframe: Timeframe;
  barIndex: number;
  /** ISO 8601, UTC */
  timestamp: string;
  /** Key into the signal registry, e.g. 'poc_sweep', 'absorption' */
  signalType: SignalType;
  direction: Direction;
  /** Detector's own confidence (0-1), independent of Edge Score weight */
  strength: number;
  evidence: Record<string, number | string>;
}
