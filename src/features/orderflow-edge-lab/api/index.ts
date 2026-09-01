import { liveApiClient } from "./liveApiClient";
import { staticArtifactClient } from "./staticArtifactClient";
import type { OrderFlowDataClient } from "./client";

export type { OrderFlowDataClient } from "./client";

type DataMode = "live" | "static";

function resolveConfiguredMode(): DataMode {
  const configured = import.meta.env.VITE_ORDERFLOW_DATA_MODE as string | undefined;
  if (configured === "live" || configured === "static") return configured;
  return import.meta.env.DEV ? "live" : "static";
}

let cachedClient: OrderFlowDataClient | null = null;
let healthCheckPromise: Promise<OrderFlowDataClient> | null = null;

/**
 * Resolves the active data client. In `live` mode, a `/api/health` check
 * confirms the FastAPI backend is actually reachable before committing to
 * it — if it's configured but not running (e.g. someone ran `npm run dev`
 * without also running `npm run engine:dev`), this falls back to the
 * static artifacts rather than the whole terminal breaking.
 */
export async function getDataClient(): Promise<OrderFlowDataClient> {
  if (cachedClient) return cachedClient;
  if (healthCheckPromise) return healthCheckPromise;

  const mode = resolveConfiguredMode();
  if (mode === "static") {
    cachedClient = staticArtifactClient;
    return cachedClient;
  }

  healthCheckPromise = fetch("/api/health", { signal: AbortSignal.timeout(1500) })
    .then((res) => {
      cachedClient = res.ok ? liveApiClient : staticArtifactClient;
      return cachedClient;
    })
    .catch(() => {
      cachedClient = staticArtifactClient;
      return cachedClient;
    })
    .finally(() => {
      healthCheckPromise = null;
    });

  return healthCheckPromise;
}
