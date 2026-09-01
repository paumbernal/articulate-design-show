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

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  const response = await fetch(`/api${path}${query}`);
  if (!response.ok) {
    throw new Error(`GET /api${path} failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function marketDataParams(query: MarketDataQuery): Record<string, string> {
  return { symbol: query.symbol, timeframe: query.timeframe, start: query.start, end: query.end };
}

export const liveApiClient: OrderFlowDataClient = {
  getMeta: () => getJson<MetaResponse>("/meta"),
  getBars: (query) => getJson<OHLCVBar[]>("/market-data/bars", marketDataParams(query)),
  getOrderflow: (query) => getJson<SyntheticOrderFlowBar[]>("/market-data/orderflow", marketDataParams(query)),
  getConditions: (query) => getJson<DetectedCondition[]>("/conditions", marketDataParams(query)),
  getSetups: () => getJson<SetupDefinition[]>("/setups"),
  getEdgeScores: (setupId, query) =>
    getJson<EdgeScoreResult[]>(`/setups/${setupId}/edge-scores`, marketDataParams(query)),
  async runBacktest(request: BacktestRequest): Promise<BacktestRunResult> {
    const response = await fetch("/api/backtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`POST /api/backtest failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<BacktestRunResult>;
  },
};
