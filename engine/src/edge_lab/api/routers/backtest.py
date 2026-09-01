from __future__ import annotations

from datetime import UTC, date, datetime, time

from fastapi import APIRouter, HTTPException
from pydantic import Field

from edge_lab.api.deps import ANCHOR_SIGNAL_TYPES, get_provider, get_setup
from edge_lab.backtest.engine import (
    DEFAULT_COSTS_POINTS,
    DEFAULT_R_MULTIPLE,
    DEFAULT_STOP_BUFFER_TICKS,
    run_backtest,
)
from edge_lab.backtest.statistics import compute_statistics
from edge_lab.backtest.validation import build_validation_summary, split_out_of_sample_index
from edge_lab.config import InstrumentSymbol, get_instrument
from edge_lab.models import BacktestConfigSnapshot, BacktestStatistics, BacktestTrade
from edge_lab.models.base import CamelModel
from edge_lab.models.enums import Timeframe
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

router = APIRouter(prefix="/api/backtest", tags=["backtest"])


class BacktestRequest(CamelModel):
    symbol: InstrumentSymbol
    timeframe: Timeframe = "5m"
    start: date
    end: date
    setup_id: str
    min_edge_score: float | None = None
    out_of_sample_fraction: float = Field(default=0.3, gt=0, lt=1)
    costs_points: float = DEFAULT_COSTS_POINTS
    r_multiple: float = DEFAULT_R_MULTIPLE
    stop_buffer_ticks: float = DEFAULT_STOP_BUFFER_TICKS


class BacktestRunResult(CamelModel):
    trades: list[BacktestTrade]
    statistics: BacktestStatistics


@router.post("")
def run(request: BacktestRequest) -> BacktestRunResult:
    try:
        setup = get_setup(request.setup_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    spec = get_instrument(request.symbol)
    provider = get_provider()
    dataset = provider.get_dataset(request.symbol, request.timeframe, request.start, request.end)
    context = build_detection_context(dataset.bars, dataset.orderflow, spec)
    conditions = detect_all(dataset.bars, dataset.orderflow, context)
    anchor = ANCHOR_SIGNAL_TYPES.get(request.setup_id, setup.rules[0].signal_type)

    oos_split = split_out_of_sample_index(len(dataset.bars), request.out_of_sample_fraction)
    trades = run_backtest(
        setup,
        anchor,
        dataset.bars,
        conditions,
        spec,
        min_edge_score=request.min_edge_score,
        r_multiple=request.r_multiple,
        stop_buffer_ticks=request.stop_buffer_ticks,
        costs_points=request.costs_points,
        out_of_sample_split_bar_index=oos_split,
    )

    validation = build_validation_summary(trades)
    fallback_start = datetime.combine(request.start, time.min, tzinfo=UTC)
    fallback_end = datetime.combine(request.end, time.min, tzinfo=UTC)
    config_snapshot = BacktestConfigSnapshot(
        symbol=request.symbol,
        date_range_start=dataset.bars[0].timestamp if dataset.bars else fallback_start,
        date_range_end=dataset.bars[-1].timestamp if dataset.bars else fallback_end,
        session="RTH",
        setup_id=setup.id,
        setup_version=setup.version,
        min_edge_score=(
            request.min_edge_score if request.min_edge_score is not None else setup.min_edge_score_default
        ),
        entry_methodology=setup.entry_methodology,
        stop_methodology=setup.stop_methodology,
        target_methodology=setup.target_methodology,
        max_hold_bars=setup.max_hold_bars,
        costs_assumed_points=request.costs_points,
        out_of_sample_split=dataset.bars[oos_split].timestamp if oos_split < len(dataset.bars) else None,
    )
    statistics = compute_statistics(trades, config_snapshot, validation)

    return BacktestRunResult(trades=trades, statistics=statistics)
