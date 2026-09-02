from datetime import UTC, datetime, timedelta

import pytest

from edge_lab.backtest.engine import run_backtest, simulate_exit
from edge_lab.backtest.fills import FillResult, compute_entry_stop_target
from edge_lab.config import get_instrument
from edge_lab.hypotheses.edge_score import score_trigger
from edge_lab.hypotheses.setups.poc_sweep_absorption_reversal import (
    ANCHOR_SIGNAL_TYPE,
    build_setup,
)
from edge_lab.models import DetectedCondition, OHLCVBar

SPEC = get_instrument("MES")
TICK = SPEC.tick_size


def _bar(i: int, day: int, open_: float, high: float, low: float, close: float) -> OHLCVBar:
    return OHLCVBar(
        symbol="MES",
        timeframe="5m",
        timestamp=datetime(2026, 3, day, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i),
        open=open_,
        high=high,
        low=low,
        close=close,
        volume=200,
        session="RTH",
        bar_index=i,
    )


def _flat_session(day: int, n: int, base: float, start_index: int = 0) -> list[OHLCVBar]:
    return [_bar(start_index + i, day, base, base + 0.5, base - 0.5, base) for i in range(n)]


def _cond(
    signal_type: str, bar_index: int, direction: str, evidence: dict | None = None
) -> DetectedCondition:
    return DetectedCondition(
        id=f"{signal_type}-{bar_index}",
        symbol="MES",
        timeframe="5m",
        bar_index=bar_index,
        timestamp=datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * bar_index),
        signal_type=signal_type,
        direction=direction,
        strength=0.8,
        evidence=evidence or {},
    )


def test_simulate_exit_hits_target() -> None:
    bars = _flat_session(day=2, n=10, base=5100.0)
    bars[3] = _bar(3, 2, 5100, 5106, 5099, 5105)  # touches target, not stop
    fill = FillResult(entry_price=5100.0, stop_price=5097.5, target_price=5105.0, initial_risk_points=2.5)
    exit_ = simulate_exit("bullish", bars, entry_bar_index=2, fill=fill, max_hold_bars=6, session_end_index=9)
    assert exit_.bar_index == 3
    assert exit_.price == 5105.0
    assert exit_.reason == "target"
    assert exit_.mfe_points == pytest.approx(6.0)
    assert exit_.mae_points == pytest.approx(1.0)


def test_simulate_exit_stop_wins_when_both_touched_same_bar() -> None:
    bars = _flat_session(day=2, n=10, base=5100.0)
    bars[3] = _bar(3, 2, 5100, 5110, 5090, 5100)  # both stop (5097.5) and target (5105) touched
    fill = FillResult(entry_price=5100.0, stop_price=5097.5, target_price=5105.0, initial_risk_points=2.5)
    exit_ = simulate_exit("bullish", bars, entry_bar_index=2, fill=fill, max_hold_bars=6, session_end_index=9)
    assert exit_.reason == "stop"
    assert exit_.price == 5097.5


def test_simulate_exit_max_hold_time() -> None:
    bars = _flat_session(day=2, n=10, base=5100.0)  # never touches stop or target
    fill = FillResult(entry_price=5100.0, stop_price=5097.5, target_price=5110.0, initial_risk_points=2.5)
    exit_ = simulate_exit("bullish", bars, entry_bar_index=2, fill=fill, max_hold_bars=4, session_end_index=9)
    assert exit_.bar_index == 6  # entry(2) + max_hold_bars(4)
    assert exit_.reason == "max_hold_time"
    assert exit_.price == bars[6].close


def test_simulate_exit_session_close_before_max_hold() -> None:
    bars = _flat_session(day=2, n=10, base=5100.0)
    fill = FillResult(entry_price=5100.0, stop_price=5097.5, target_price=5110.0, initial_risk_points=2.5)
    # session ends at index 9, well before entry(2) + max_hold_bars(20) = 22
    exit_ = simulate_exit(
        "bullish", bars, entry_bar_index=2, fill=fill, max_hold_bars=20, session_end_index=9
    )
    assert exit_.bar_index == 9
    assert exit_.reason == "session_close"


def test_compute_entry_stop_target_uses_swept_level_and_buffer() -> None:
    setup = build_setup()
    bars = _flat_session(day=2, n=5, base=5100.0)
    conditions = [
        _cond("poc_sweep", 0, "bullish", {"swept_level": 5098.0}),
        _cond("absorption", 2, "bullish"),
    ]
    trigger = score_trigger(setup, trigger_bar_index=2, direction="bullish", conditions=conditions)
    fill = compute_entry_stop_target(
        setup, trigger, bars, conditions, TICK, r_multiple=2.0, stop_buffer_ticks=2.0
    )

    assert fill.entry_price == 5100.0  # close of bar 2
    assert fill.stop_price == pytest.approx(5098.0 - 2 * TICK)
    assert fill.initial_risk_points == pytest.approx(5100.0 - (5098.0 - 2 * TICK))
    assert fill.target_price == pytest.approx(5100.0 + 2.0 * fill.initial_risk_points)


def test_run_backtest_end_to_end_produces_expected_trade_fields() -> None:
    setup = build_setup()
    bars = _flat_session(day=2, n=20, base=5100.0)
    bars[6] = _bar(6, 2, 5100, 5200, 5099, 5200)  # far above target -> hits target next bar check window
    conditions = [
        _cond("poc_sweep", 2, "bullish", {"swept_level": 5098.0}),
        _cond("absorption", 4, "bullish"),  # trigger bar
    ]
    trades = run_backtest(setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0)

    assert len(trades) == 1
    trade = trades[0]
    assert trade.entry_bar_index == 4
    assert trade.direction == "bullish"
    assert trade.exit_reason == "target"
    assert trade.exit_bar_index == 6
    assert trade.hold_bars == 2
    assert trade.pnl_r > 0
    assert trade.costs_assumed_points == pytest.approx(0.5)
    assert trade.session == "RTH"
    assert trade.day_of_week == "Mon"  # 2026-03-02 is a Monday


def test_run_backtest_skips_trades_with_near_zero_risk() -> None:
    setup = build_setup()
    bars = _flat_session(day=2, n=10, base=5100.0)
    conditions = [
        # Swept level sits right at bar 2's close (5100.0), so with the
        # default stop_buffer_ticks=2 the risk is only 2 ticks = 0.5 points
        # -- below the default min_risk_ticks=2.0 * TICK=0.25 -> 0.5 floor
        # boundary; nudge it just under with a tighter buffer via a level
        # equal to entry price (worst case: risk == buffer exactly).
        _cond("poc_sweep", 0, "bullish", {"swept_level": 5100.0}),
        _cond("absorption", 2, "bullish"),
    ]
    trades = run_backtest(
        setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0, min_risk_ticks=4.0
    )
    assert trades == []  # risk (2 ticks from the buffer) is below the 4-tick floor

    trades = run_backtest(
        setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0, min_risk_ticks=1.0
    )
    assert len(trades) == 1  # same setup, lower floor -> now accepted


def test_run_backtest_respects_min_edge_score_filter() -> None:
    setup = build_setup()
    bars = _flat_session(day=2, n=10, base=5100.0)
    # Only absorption present -> required poc_sweep missing -> met_required_rules False.
    conditions = [_cond("absorption", 4, "bullish")]
    trades = run_backtest(setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0)
    assert trades == []


def test_run_backtest_skips_overlapping_triggers() -> None:
    setup = build_setup()
    bars = _flat_session(day=2, n=30, base=5100.0)  # nothing hits stop/target -> long max_hold_time exits
    conditions = [
        _cond("poc_sweep", 0, "bullish", {"swept_level": 5098.0}),
        _cond("absorption", 2, "bullish"),
        _cond("poc_sweep", 3, "bullish", {"swept_level": 5098.0}),
        _cond("absorption", 5, "bullish"),  # would overlap with the first trade's holding window
    ]
    trades = run_backtest(setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0)
    assert len(trades) == 1
    assert trades[0].entry_bar_index == 2


def test_run_backtest_marks_out_of_sample_by_split_index() -> None:
    setup = build_setup()
    bars = _flat_session(day=2, n=15, base=5100.0)
    conditions = [
        _cond("poc_sweep", 0, "bullish", {"swept_level": 5098.0}),
        _cond("absorption", 2, "bullish"),
    ]
    trades = run_backtest(
        setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0, out_of_sample_split_bar_index=1
    )
    assert trades[0].is_out_of_sample is True

    trades = run_backtest(
        setup, ANCHOR_SIGNAL_TYPE, bars, conditions, SPEC, min_edge_score=0, out_of_sample_split_bar_index=10
    )
    assert trades[0].is_out_of_sample is False
