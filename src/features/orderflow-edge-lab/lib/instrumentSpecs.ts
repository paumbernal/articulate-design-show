import type { InstrumentSymbol } from "../types";

/** Mirrors engine/src/edge_lab/config.py::INSTRUMENTS */
export interface InstrumentSpec {
  symbol: InstrumentSymbol;
  name: string;
  exchange: string;
  tickSize: number;
  tickValueUsd: number;
  pointValueUsd: number;
  timezone: string;
  rthStart: string;
  rthEnd: string;
}

export const INSTRUMENTS: Record<InstrumentSymbol, InstrumentSpec> = {
  MES: {
    symbol: "MES",
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    tickSize: 0.25,
    tickValueUsd: 1.25,
    pointValueUsd: 5.0,
    timezone: "America/Chicago",
    rthStart: "08:30",
    rthEnd: "15:00",
  },
  MNQ: {
    symbol: "MNQ",
    name: "Micro E-mini Nasdaq-100",
    exchange: "CME",
    tickSize: 0.25,
    tickValueUsd: 0.5,
    pointValueUsd: 2.0,
    timezone: "America/Chicago",
    rthStart: "08:30",
    rthEnd: "15:00",
  },
};
