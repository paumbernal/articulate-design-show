"""Export static JSON artifacts for the production (backend-free) build.

This CLI calls the exact same engine functions the FastAPI routers call
(edge_lab.signals, edge_lab.hypotheses, edge_lab.backtest) — never
duplicated logic — and writes their output to public/data/orderflow-edge-lab/
in the repo root, committed to git. `npm run build` ships these; the
deployed site never runs Python. See src/features/orderflow-edge-lab/api/
for the frontend client that reads them.

Run via: npm run engine:export
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from edge_lab.api.routers.meta import DISCLAIMER
from edge_lab.backtest.engine import run_backtest
from edge_lab.backtest.statistics import compute_statistics
from edge_lab.backtest.validation import build_validation_summary, split_out_of_sample_index
from edge_lab.config import InstrumentSymbol, get_instrument
from edge_lab.data.synthetic_provider import SyntheticMarketDataProvider
from edge_lab.hypotheses.edge_score import find_setup_triggers
from edge_lab.hypotheses.setups.poc_sweep_absorption_reversal import (
    ANCHOR_SIGNAL_TYPE,
    build_setup,
)
from edge_lab.models import BacktestConfigSnapshot
from edge_lab.models.enums import Timeframe
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

OUT_DIR = Path(__file__).resolve().parents[4] / "public" / "data" / "orderflow-edge-lab"
ASSUMPTIONS_PATH = Path(__file__).resolve().parents[4] / "engine" / "SYNTHETIC_DATA_ASSUMPTIONS.md"

SYMBOLS: list[InstrumentSymbol] = ["MES", "MNQ"]
TIMEFRAME: Timeframe = "5m"
SEED = 42

# Two windows, deliberately different sizes: the backtest needs enough
# sessions for a statistically meaningful (if still small) sample, but
# shipping 6 months of raw 5m bars/orderflow as static JSON would bloat the
# page load for no benefit — the Market Data pane only ever looks at a
# session or a few weeks at a time. Conditions/bars/orderflow shipped to the
# frontend cover the shorter CHART window; the backtest is computed (and
# only its resulting trades/statistics are shipped) over the full range.
BACKTEST_START = date(2026, 1, 5)
BACKTEST_END = date(2026, 6, 26)  # ~6 months
CHART_START = date(2026, 5, 11)
CHART_END = date(2026, 6, 26)  # ~6 weeks


def _dump(name: str, payload: Any) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"{name}.json"

    def default(obj: Any) -> Any:
        if isinstance(obj, BaseModel):
            return obj.model_dump(mode="json")
        raise TypeError(f"Not JSON serializable: {type(obj)}")

    if isinstance(payload, list):
        data = [item.model_dump(mode="json") if isinstance(item, BaseModel) else item for item in payload]
    elif isinstance(payload, BaseModel):
        data = payload.model_dump(mode="json")
    else:
        data = payload

    out_path.write_text(json.dumps(data, indent=2, default=default), encoding="utf-8")
    print(f"wrote {out_path.relative_to(OUT_DIR.parents[2])}")


def main() -> None:
    provider = SyntheticMarketDataProvider(seed=SEED)
    setup = build_setup()

    for symbol in SYMBOLS:
        spec = get_instrument(symbol)

        chart_dataset = provider.get_dataset(symbol, TIMEFRAME, CHART_START, CHART_END)
        chart_context = build_detection_context(chart_dataset.bars, chart_dataset.orderflow, spec)
        chart_conditions = detect_all(chart_dataset.bars, chart_dataset.orderflow, chart_context)
        _dump(f"bars-{symbol}-{TIMEFRAME}", chart_dataset.bars)
        _dump(f"orderflow-{symbol}-{TIMEFRAME}", chart_dataset.orderflow)
        _dump(f"conditions-{symbol}-{TIMEFRAME}", chart_conditions)

        chart_edge_scores = find_setup_triggers(setup, ANCHOR_SIGNAL_TYPE, chart_conditions)
        _dump(f"edge-scores-{setup.id}-{symbol}-{TIMEFRAME}", chart_edge_scores)

        backtest_dataset = provider.get_dataset(symbol, TIMEFRAME, BACKTEST_START, BACKTEST_END)
        backtest_context = build_detection_context(backtest_dataset.bars, backtest_dataset.orderflow, spec)
        backtest_conditions = detect_all(backtest_dataset.bars, backtest_dataset.orderflow, backtest_context)

        oos_split = split_out_of_sample_index(len(backtest_dataset.bars), 0.3)
        trades = run_backtest(
            setup,
            ANCHOR_SIGNAL_TYPE,
            backtest_dataset.bars,
            backtest_conditions,
            spec,
            min_edge_score=setup.min_edge_score_default,
            out_of_sample_split_bar_index=oos_split,
        )
        validation = build_validation_summary(trades)
        config_snapshot = BacktestConfigSnapshot(
            symbol=symbol,
            date_range_start=backtest_dataset.bars[0].timestamp,
            date_range_end=backtest_dataset.bars[-1].timestamp,
            session="RTH",
            setup_id=setup.id,
            setup_version=setup.version,
            min_edge_score=setup.min_edge_score_default,
            entry_methodology=setup.entry_methodology,
            stop_methodology=setup.stop_methodology,
            target_methodology=setup.target_methodology,
            max_hold_bars=setup.max_hold_bars,
            costs_assumed_points=0.5,
            out_of_sample_split=backtest_dataset.bars[oos_split].timestamp,
        )
        statistics = compute_statistics(trades, config_snapshot, validation)
        _dump(f"backtest-{setup.id}-{symbol}", {"trades": trades, "statistics": statistics})

    _dump("setups", [setup])

    assumptions = ASSUMPTIONS_PATH.read_text(encoding="utf-8") if ASSUMPTIONS_PATH.exists() else ""
    _dump(
        "meta",
        {
            "isSyntheticData": True,
            "disclaimer": DISCLAIMER,
            "assumptionsMarkdown": assumptions,
            "supportedSymbols": SYMBOLS,
        },
    )


if __name__ == "__main__":
    main()
