from datetime import UTC, datetime, timedelta

import pytest

from edge_lab.backtest.statistics import compute_statistics
from edge_lab.backtest.validation import build_validation_summary
from edge_lab.models import BacktestConfigSnapshot, BacktestTrade


def _trade(
    i: int,
    pnl_points: float,
    pnl_r: float,
    exit_reason: str = "target",
    hour: int = 9,
    day_of_week: str = "Mon",
    edge_score: float = 80.0,
    is_out_of_sample: bool = False,
) -> BacktestTrade:
    ts = datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i)
    return BacktestTrade(
        id=f"trade-{i}",
        setup_id="liquidity-sweep-absorption-reversal",
        setup_version=1,
        symbol="MES",
        direction="bullish",
        edge_score_at_entry=edge_score,
        entry_bar_index=i,
        entry_timestamp=ts,
        entry_price=5100.0,
        stop_price=5097.5,
        target_price=5105.0,
        exit_bar_index=i + 3,
        exit_timestamp=ts + timedelta(minutes=15),
        exit_price=5100.0 + pnl_points,
        exit_reason=exit_reason,
        hold_bars=3,
        pnl_points=pnl_points,
        pnl_r=pnl_r,
        mfe_points=max(pnl_points, 0.5),
        mae_points=1.0,
        time_to_exit_bars=3,
        session="RTH",
        day_of_week=day_of_week,
        hour_of_day=hour,
        costs_assumed_points=0.5,
        is_out_of_sample=is_out_of_sample,
    )


def _config() -> BacktestConfigSnapshot:
    return BacktestConfigSnapshot(
        symbol="MES",
        date_range_start=datetime(2026, 1, 1, tzinfo=UTC),
        date_range_end=datetime(2026, 3, 1, tzinfo=UTC),
        session="RTH",
        setup_id="liquidity-sweep-absorption-reversal",
        setup_version=1,
        min_edge_score=70,
        entry_methodology="close_of_trigger_bar",
        stop_methodology="swept_level_plus_buffer",
        target_methodology="fixed_r_multiple",
        max_hold_bars=24,
        costs_assumed_points=0.5,
    )


def test_win_rate_and_expectancy_hand_computed() -> None:
    trades = [
        _trade(0, pnl_points=5.0, pnl_r=2.0, exit_reason="target"),
        _trade(1, pnl_points=5.0, pnl_r=2.0, exit_reason="target"),
        _trade(2, pnl_points=-2.5, pnl_r=-1.0, exit_reason="stop"),
        _trade(3, pnl_points=-2.5, pnl_r=-1.0, exit_reason="stop"),
    ]
    validation = build_validation_summary(trades)
    stats_ = compute_statistics(trades, _config(), validation)

    assert stats_.sample_size == 4
    assert stats_.win_rate == pytest.approx(0.5)
    assert stats_.avg_r == pytest.approx((2.0 + 2.0 - 1.0 - 1.0) / 4)
    assert stats_.expectancy == pytest.approx(stats_.avg_r)
    # profit factor = gross profit / gross loss = (5+5) / (2.5+2.5) = 2.0
    assert stats_.profit_factor == pytest.approx(2.0)
    assert stats_.avg_time_to_target_bars == pytest.approx(3.0)
    assert stats_.avg_time_to_stop_bars == pytest.approx(3.0)


def test_profit_factor_is_none_with_no_losses() -> None:
    trades = [_trade(0, pnl_points=5.0, pnl_r=2.0)]
    stats_ = compute_statistics(trades, _config(), build_validation_summary(trades))
    assert stats_.profit_factor is None


def test_max_drawdown_hand_computed_sequence() -> None:
    # Equity path: +2, +2 (peak 4), -5 (down to -1, drawdown = -1-4 = -5), +1 (up to 0)
    trades = [
        _trade(0, pnl_points=2.0, pnl_r=0.8),
        _trade(1, pnl_points=2.0, pnl_r=0.8),
        _trade(2, pnl_points=-5.0, pnl_r=-2.0),
        _trade(3, pnl_points=1.0, pnl_r=0.4),
    ]
    stats_ = compute_statistics(trades, _config(), build_validation_summary(trades))
    assert stats_.max_drawdown_points == pytest.approx(-5.0)


def test_outcome_distribution_buckets_hand_computed() -> None:
    trades = [
        _trade(0, pnl_points=0, pnl_r=-3.0),  # <= -2R
        _trade(1, pnl_points=0, pnl_r=0.5),  # 0R to 1R
        _trade(2, pnl_points=0, pnl_r=1.5),  # 1R to 2R
        _trade(3, pnl_points=0, pnl_r=3.0),  # > 2R
    ]
    stats_ = compute_statistics(trades, _config(), build_validation_summary(trades))
    by_label = {row.label: row.n for row in stats_.outcome_distribution}
    assert by_label["<= -2R"] == 1
    assert by_label["0R to 1R"] == 1
    assert by_label["1R to 2R"] == 1
    assert by_label["> 2R"] == 1
    assert by_label["-2R to -1R"] == 0


def test_breakdown_by_session_and_day_of_week() -> None:
    trades = [
        _trade(0, pnl_points=5.0, pnl_r=2.0, day_of_week="Mon"),
        _trade(1, pnl_points=-2.5, pnl_r=-1.0, day_of_week="Tue"),
    ]
    stats_ = compute_statistics(trades, _config(), build_validation_summary(trades))
    by_dow = {row.label: row.n for row in stats_.breakdowns.by_day_of_week}
    assert by_dow == {"Mon": 1, "Tue": 1}
    assert all(row.n == 2 for row in stats_.breakdowns.by_session)


def test_edge_score_bucket_labels() -> None:
    trades = [
        _trade(0, pnl_points=5.0, pnl_r=2.0, edge_score=72),
        _trade(1, pnl_points=5.0, pnl_r=2.0, edge_score=95),
    ]
    stats_ = compute_statistics(trades, _config(), build_validation_summary(trades))
    labels = {row.label for row in stats_.breakdowns.by_edge_score_bucket}
    assert labels == {"70-80", "90-100"}


def test_empty_trades_produce_none_stats_not_errors() -> None:
    stats_ = compute_statistics([], _config(), build_validation_summary([]))
    assert stats_.sample_size == 0
    assert stats_.win_rate is None
    assert stats_.avg_r is None
    assert stats_.profit_factor is None
