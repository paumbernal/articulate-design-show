import type { EmpiricalTradeRecord } from "../types";

const KNOWN_COLUMNS = [
  "date",
  "pnl",
  "r_multiple",
  "instrument",
  "entry_price",
  "exit_price",
  "position_size",
  "fees",
  "entry_time",
  "exit_time",
] as const;

const NUMERIC_COLUMNS = new Set(["pnl", "r_multiple", "entry_price", "exit_price", "position_size", "fees"]);

export interface CsvParseIssue {
  row: number;
  message: string;
}

export interface CsvParseResult {
  trades: EmpiricalTradeRecord[];
  issues: CsvParseIssue[];
}

/** Splits one CSV line into fields, honoring double-quoted fields that may contain commas. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

/**
 * Parses a historical-trade CSV into structured records. Expected schema:
 *
 *   date,pnl,r_multiple
 *
 * with optional extra columns: instrument, entry_price, exit_price, position_size, fees,
 * entry_time, exit_time. Column order doesn't matter and unknown columns are ignored (reported
 * as an issue, not a hard failure) — at least one of `pnl` or `r_multiple` is required per row.
 *
 * Malformed rows are skipped and reported in `issues` rather than aborting the whole parse, so a
 * mostly-good file with a couple of bad rows still produces a usable result.
 */
export function parseTradeCsv(csvText: string): CsvParseResult {
  const issues: CsvParseIssue[] = [];
  const lines = csvText.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { trades: [], issues: [{ row: 0, message: "File is empty." }] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const hasPnl = header.includes("pnl");
  const hasRMultiple = header.includes("r_multiple");
  if (!hasPnl && !hasRMultiple) {
    return {
      trades: [],
      issues: [{ row: 0, message: "CSV must include at least a 'pnl' or 'r_multiple' column." }],
    };
  }

  const unknownColumns = header.filter((h) => !KNOWN_COLUMNS.includes(h as (typeof KNOWN_COLUMNS)[number]));
  if (unknownColumns.length > 0) {
    issues.push({ row: 0, message: `Ignoring unrecognized column(s): ${unknownColumns.join(", ")}` });
  }

  const trades: EmpiricalTradeRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1; // 1-indexed, includes header row for human-facing messages
    const fields = splitCsvLine(lines[i]);
    if (fields.length !== header.length) {
      issues.push({ row: rowNumber, message: `Expected ${header.length} column(s), found ${fields.length}. Row skipped.` });
      continue;
    }

    const record: Record<string, string> = {};
    header.forEach((col, idx) => {
      record[col] = fields[idx];
    });

    const numeric: Record<string, number | undefined> = {};
    let rowHasNumericError = false;
    for (const col of NUMERIC_COLUMNS) {
      const raw = record[col];
      if (raw === undefined || raw === "") continue;
      const value = Number(raw);
      if (Number.isNaN(value)) {
        issues.push({ row: rowNumber, message: `Non-numeric value "${raw}" in column '${col}'. Row skipped.` });
        rowHasNumericError = true;
        break;
      }
      numeric[col] = value;
    }
    if (rowHasNumericError) continue;

    if (numeric.pnl === undefined && numeric.r_multiple === undefined) {
      issues.push({ row: rowNumber, message: "Row has neither 'pnl' nor 'r_multiple'. Row skipped." });
      continue;
    }

    trades.push({
      date: record.date || undefined,
      pnl: numeric.pnl,
      rMultiple: numeric.r_multiple,
      instrument: record.instrument || undefined,
      entryPrice: numeric.entry_price,
      exitPrice: numeric.exit_price,
      positionSize: numeric.position_size,
      fees: numeric.fees,
      entryTime: record.entry_time || undefined,
      exitTime: record.exit_time || undefined,
    });
  }

  return { trades, issues };
}

export interface EmpiricalStats {
  sampleSize: number;
  winRate: number | null;
  avgWinR: number | null;
  avgLossR: number | null;
  expectancyR: number | null;
  profitFactor: number | null;
  historicalMaxDrawdownR: number | null;
  rMultiples: number[];
}

/**
 * Resolves each trade's R multiple. Prefers the explicit `r_multiple` column; if a trade only
 * has `pnl`, it's normalized by `riskPerTrade` (an assumption that historical risk sizing was
 * roughly constant — documented in the dashboard's CSV upload help text).
 */
export function resolveRMultiples(trades: EmpiricalTradeRecord[], riskPerTrade: number): number[] {
  return trades
    .map((t) => {
      if (t.rMultiple !== undefined) return t.rMultiple;
      if (t.pnl !== undefined && riskPerTrade > 0) return t.pnl / riskPerTrade;
      return undefined;
    })
    .filter((r): r is number => r !== undefined);
}

/** Computes actual win rate, average win/loss, expectancy, profit factor, and drawdown from historical trades. */
export function computeEmpiricalStats(trades: EmpiricalTradeRecord[], riskPerTrade: number): EmpiricalStats {
  const rMultiples = resolveRMultiples(trades, riskPerTrade);
  const n = rMultiples.length;
  if (n === 0) {
    return {
      sampleSize: 0,
      winRate: null,
      avgWinR: null,
      avgLossR: null,
      expectancyR: null,
      profitFactor: null,
      historicalMaxDrawdownR: null,
      rMultiples: [],
    };
  }

  const wins = rMultiples.filter((r) => r > 0);
  const losses = rMultiples.filter((r) => r < 0);
  const grossProfitR = wins.reduce((s, r) => s + r, 0);
  const grossLossR = -losses.reduce((s, r) => s + r, 0);

  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const r of rMultiples) {
    cumulative += r;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    sampleSize: n,
    winRate: wins.length / n,
    avgWinR: wins.length ? grossProfitR / wins.length : null,
    avgLossR: losses.length ? losses.reduce((s, r) => s + r, 0) / losses.length : null,
    expectancyR: rMultiples.reduce((s, r) => s + r, 0) / n,
    profitFactor: grossLossR > 0 ? grossProfitR / grossLossR : null,
    historicalMaxDrawdownR: maxDrawdown,
    rMultiples,
  };
}
