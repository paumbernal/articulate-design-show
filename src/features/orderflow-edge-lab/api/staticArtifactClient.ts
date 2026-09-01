import { buildValidationWarnings, computeStatistics, filterTrades } from "../lib/computeStatistics";
import type {
  BacktestRequest,
  BacktestRunResult,
  DetectedCondition,
  EdgeScoreResult,
  MarketDataQuery,
  MetaResponse,
  OHLCVBar,
  SetupDefinition,
  SyntheticOrderFlowBar,
} from "../types";
import type { OrderFlowDataClient } from "./client";

const BASE = "/data/orderflow-edge-lab";

async function getJsonFile<T>(name: string): Promise<T> {
  const response = await fetch(`${BASE}/${name}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load static artifact ${name}.json: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function withinRange<T extends { timestamp?: string; entryTimestamp?: string }>(
  items: T[],
  start: string,
  end: string,
): T[] {
  return items.filter((item) => {
    const ts = item.timestamp ?? item.entryTimestamp ?? "";
    return ts >= start && ts <= `${end}T23:59:59Z`;
  });
}

export const staticArtifactClient: OrderFlowDataClient = {
  getMeta: () => getJsonFile<MetaResponse>("meta"),

  async getBars(query: MarketDataQuery): Promise<OHLCVBar[]> {
    const bars = await getJsonFile<OHLCVBar[]>(`bars-${query.symbol}-${query.timeframe}`);
    return withinRange(bars, query.start, query.end);
  },

  async getOrderflow(query: MarketDataQuery): Promise<SyntheticOrderFlowBar[]> {
    // Orderflow bars don't carry their own timestamp — they're index-aligned
    // with the bars artifact, so filter by matching bar index instead.
    const [bars, orderflow] = await Promise.all([
      getJsonFile<OHLCVBar[]>(`bars-${query.symbol}-${query.timeframe}`),
      getJsonFile<SyntheticOrderFlowBar[]>(`orderflow-${query.symbol}-${query.timeframe}`),
    ]);
    const keep = new Set(withinRange(bars, query.start, query.end).map((b) => b.barIndex));
    return orderflow.filter((ob) => keep.has(ob.barIndex));
  },

  async getConditions(query: MarketDataQuery): Promise<DetectedCondition[]> {
    const conditions = await getJsonFile<DetectedCondition[]>(`conditions-${query.symbol}-${query.timeframe}`);
    return withinRange(conditions, query.start, query.end);
  },

  getSetups: () => getJsonFile<SetupDefinition[]>("setups"),

  async getEdgeScores(setupId: string, query: MarketDataQuery): Promise<EdgeScoreResult[]> {
    const scores = await getJsonFile<EdgeScoreResult[]>(
      `edge-scores-${setupId}-${query.symbol}-${query.timeframe}`,
    );
    return scores.filter((s) => s.triggerTimestamp >= query.start && s.triggerTimestamp <= `${query.end}T23:59:59Z`);
  },

  async runBacktest(request: BacktestRequest): Promise<BacktestRunResult> {
    const precomputed = await getJsonFile<BacktestRunResult>(`backtest-${request.setupId}-${request.symbol}`);

    const defaultMinScore = precomputed.statistics.config.minEdgeScore;
    const noFiltersApplied =
      (request.minEdgeScore == null || request.minEdgeScore === defaultMinScore) &&
      (request.session == null || request.session === "ANY") &&
      request.start <= precomputed.statistics.config.dateRangeStart &&
      request.end >= precomputed.statistics.config.dateRangeEnd;
    if (noFiltersApplied) {
      return precomputed;
    }

    const filtered = filterTrades(precomputed.trades, {
      minEdgeScore: request.minEdgeScore ?? undefined,
      session: request.session,
      dateStart: request.start,
      dateEnd: request.end,
    });
    const validation = {
      inSampleN: filtered.filter((t) => !t.isOutOfSample).length,
      outOfSampleN: filtered.filter((t) => t.isOutOfSample).length,
      significance: precomputed.statistics.validation.significance,
      warnings: buildValidationWarnings(filtered),
    };
    const config = {
      ...precomputed.statistics.config,
      minEdgeScore: request.minEdgeScore ?? precomputed.statistics.config.minEdgeScore,
    };
    return { trades: filtered, statistics: computeStatistics(filtered, config, validation) };
  },
};
