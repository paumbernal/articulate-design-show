# OrderFlow Edge Lab — Engine

The Python research engine: synthetic data generation, feature/signal detection, the Edge Engine, and the backtesting/statistics engine. See the [root README](../README.md) for the project-level writeup (research question, methodology, results); this file is the engine-specific "how do I run this" reference.

## Setup

Requires [`uv`](https://docs.astral.sh/uv/) (falls back to plain `venv`/`pip` if unavailable — see `pyproject.toml` for the dependency list).

```bash
uv sync                 # from this directory, or `npm run engine:setup` from the repo root
```

`uv` will fetch a pinned Python 3.11/3.12 if none is available; if that fails in your environment (e.g. a restrictive network), `uv sync --python-preference only-system` uses whatever system Python 3.11+ is already installed instead.

## Running

```bash
uv run pytest                                          # 80 tests
uv run ruff check . && uv run ruff format --check .     # lint + format check
uv run uvicorn edge_lab.api.app:app --reload --port 8000   # dev API server
uv run python -m edge_lab.cli.export_artifacts          # regenerate public/data/orderflow-edge-lab/*.json
uv run python -m edge_lab.cli.export_schemas             # regenerate schemas/*.schema.json
```

All of the above also have `npm run engine:*` wrappers at the repo root (`engine:test`, `engine:lint`, `engine:dev`, `engine:export`).

## Layout

```
src/edge_lab/
  config.py         Instrument specs (MES/MNQ): tick size, point value, session hours
  models/            pydantic models. CamelModel (base.py) serializes snake_case Python
                      fields to camelCase JSON — this is the wire contract the TS
                      frontend consumes. Regenerate schemas/ after any model change.
  data/
    provider.py       MarketDataProvider Protocol — the interface a real data provider
                      would implement later.
    synthetic_provider.py   The only implementation for now.
    synthetic_generator.py  Regime-switching random walk + explicit scenario injection.
                      See SYNTHETIC_DATA_ASSUMPTIONS.md for what this does and doesn't model.
    session_calendar.py     Trading days, RTH bounds, session grouping (Mon-Fri only —
                      no holiday calendar, a documented limitation).
  features/           Pure calculation functions: volume_profile.py (POC/VAH/VAL/HVN/LVN),
                      market_structure.py (swing points, breaks of structure),
                      orderflow_features.py (rolling volume, effort-vs-result, divergence).
  signals/            Detectors (poc_sweep, absorption, delta_divergence) over a
                      shared DetectionContext (base.py) built once per dataset.
                      registry.py is where a new detector gets wired in.
  hypotheses/
    edge_score.py      Scores a SetupDefinition's weighted rules against nearby
                      DetectedConditions. Never computes a probability of profit —
                      that's a deliberate omission, not an oversight.
    setups/poc_sweep_absorption_reversal.py   The one hypothesis this MVP tests.
  backtest/
    fills.py           Entry/stop/target construction from a setup's methodology strings.
    engine.py           Trade simulation — the documented assumptions (no pyramiding,
                      stop-wins-ties, minimum risk floor) are in this file's docstring.
    statistics.py       Win rate, expectancy, profit factor, drawdown, breakdowns.
    validation.py        Chronological IS/OOS split, significance testing (scipy),
                      auto-populated honesty warnings.
  api/                FastAPI app + routers. Runs in dev only (npm run engine:dev) — the
                      production site is a static build and doesn't need this running.
  cli/
    export_artifacts.py   Generates public/data/orderflow-edge-lab/*.json for the static
                      build. Calls the exact same functions the API routers call.
    export_schemas.py     Dumps JSON Schema for the frontend contract test.
```

## Extending

- **New signal**: add a `detect(bars, orderflow, context) -> list[DetectedCondition]` function to `signals/`, register it in `signals/registry.py`. It's now usable in any `SetupDefinition.rules`.
- **New setup/hypothesis**: add a `build_setup() -> SetupDefinition` function under `hypotheses/setups/`, pick an `ANCHOR_SIGNAL_TYPE` (whichever rule confirms the pattern *last* chronologically — see the module docstring on why this matters for `WeightedRule.sequence_within_bars`'s backward-looking window), wire it into `api/deps.py`'s `SETUPS` and `export_artifacts.py`.
- **Real data provider**: implement `data.provider.MarketDataProvider` (two methods: `get_bars`, `get_orderflow`, plus an `is_synthetic` property) and swap it in wherever `SyntheticMarketDataProvider` is currently instantiated (`api/deps.py`, `cli/export_artifacts.py`).
