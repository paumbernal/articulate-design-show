"""FastAPI app. Run via `npm run engine:dev` (wraps `uvicorn edge_lab.api.app:app`).

In dev, Vite proxies `/api/*` to this server (see vite.config.ts), so the
browser only ever calls same-origin `/api/...` — no CORS configuration is
needed. In production the site is a static build (see cli/export_artifacts.py)
and this app does not need to run at all.
"""

from __future__ import annotations

from fastapi import FastAPI

from edge_lab.api.routers import backtest, conditions, edge_engine, market_data, meta

app = FastAPI(
    title="OrderFlow Edge Lab Engine API",
    description="Synthetic order-flow data, signal detection, Edge Scoring, and backtesting.",
    version="0.1.0",
)

app.include_router(meta.router)
app.include_router(market_data.router)
app.include_router(conditions.router)
app.include_router(edge_engine.router)
app.include_router(backtest.router)
