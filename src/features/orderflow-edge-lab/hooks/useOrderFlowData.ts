import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDataClient } from "../api";
import type { BacktestRequest, MarketDataQuery } from "../types";

export function useMeta() {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "meta"],
    queryFn: async () => (await getDataClient()).getMeta(),
    staleTime: Infinity,
  });
}

export function useBars(query: MarketDataQuery) {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "bars", query],
    queryFn: async () => (await getDataClient()).getBars(query),
  });
}

export function useOrderflow(query: MarketDataQuery) {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "orderflow", query],
    queryFn: async () => (await getDataClient()).getOrderflow(query),
  });
}

export function useConditions(query: MarketDataQuery) {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "conditions", query],
    queryFn: async () => (await getDataClient()).getConditions(query),
  });
}

export function useSetups() {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "setups"],
    queryFn: async () => (await getDataClient()).getSetups(),
    staleTime: Infinity,
  });
}

export function useEdgeScores(setupId: string, query: MarketDataQuery) {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "edge-scores", setupId, query],
    queryFn: async () => (await getDataClient()).getEdgeScores(setupId, query),
  });
}

export function useBacktest(request: BacktestRequest | null) {
  return useQuery({
    queryKey: ["orderflow-edge-lab", "backtest", request],
    queryFn: async () => (await getDataClient()).runBacktest(request as BacktestRequest),
    enabled: request !== null,
    // Keep the previous result on screen while a new filter value is
    // fetched, rather than unmounting the whole pane (and the slider mid-
    // drag) back to a loading state on every value change.
    placeholderData: keepPreviousData,
  });
}
