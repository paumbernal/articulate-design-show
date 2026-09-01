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

/**
 * The data-access seam for the whole feature. `liveApiClient` and
 * `staticArtifactClient` both implement this — nothing else in the app
 * should know which one is active. Mirrors the same "swap the
 * implementation behind an interface" pattern as the Python side's
 * MarketDataProvider (engine/src/edge_lab/data/provider.py).
 */
export interface OrderFlowDataClient {
  getMeta(): Promise<MetaResponse>;
  getBars(query: MarketDataQuery): Promise<OHLCVBar[]>;
  getOrderflow(query: MarketDataQuery): Promise<SyntheticOrderFlowBar[]>;
  getConditions(query: MarketDataQuery): Promise<DetectedCondition[]>;
  getSetups(): Promise<SetupDefinition[]>;
  getEdgeScores(setupId: string, query: MarketDataQuery): Promise<EdgeScoreResult[]>;
  runBacktest(request: BacktestRequest): Promise<BacktestRunResult>;
}
