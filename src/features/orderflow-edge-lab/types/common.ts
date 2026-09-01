/**
 * Shared literal types mirroring engine/src/edge_lab/config.py and
 * engine/src/edge_lab/models/enums.py. Keep in sync by hand — a Vitest
 * contract test (contract.test.ts) checks these against the checked-in
 * JSON Schema exports in engine/schemas/.
 */

export type InstrumentSymbol = "MES" | "MNQ";

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h";
export type Session = "RTH" | "ETH";
export type Direction = "bullish" | "bearish";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

/** Open string, keyed against the Python signal registry — not a closed union. */
export type SignalType = string;

export type ExitReason = "target" | "stop" | "max_hold_time" | "session_close";
