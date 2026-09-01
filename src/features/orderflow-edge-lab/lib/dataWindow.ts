/**
 * The date ranges the static export CLI generates (engine/src/edge_lab/cli/
 * export_artifacts.py: CHART_START/CHART_END, BACKTEST_START/BACKTEST_END).
 * In live mode these are just sensible defaults — the live API can serve
 * any range. In static mode they MUST match the exported artifacts, since
 * the static client filters within them rather than regenerating data.
 */
export const CHART_WINDOW = { start: "2026-05-11", end: "2026-06-26" };
export const BACKTEST_WINDOW = { start: "2026-01-05", end: "2026-06-26" };
