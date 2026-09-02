from datetime import UTC, datetime, timedelta

import pytest

from edge_lab.backtest.validation import build_validation_summary, split_out_of_sample_index
from edge_lab.models import BacktestTrade


def _trade(i: int, pnl_r: float, is_out_of_sample: bool) -> BacktestTrade:
    ts = datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i)
    return BacktestTrade(
        id=f"trade-{i}",
        setup_id="poc-sweep-absorption-reversal",
        setup_version=1,
        symbol="MES",
        direction="bullish",
        edge_score_at_entry=80.0,
        entry_bar_index=i,
        entry_timestamp=ts,
        entry_price=5100.0,
        stop_price=5097.5,
        target_price=5105.0,
        exit_bar_index=i + 3,
        exit_timestamp=ts + timedelta(minutes=15),
        exit_price=5100.0 + pnl_r * 2.5,
        exit_reason="target" if pnl_r > 0 else "stop",
        hold_bars=3,
        pnl_points=pnl_r * 2.5,
        pnl_r=pnl_r,
        mfe_points=1.0,
        mae_points=1.0,
        time_to_exit_bars=3,
        session="RTH",
        day_of_week="Mon",
        hour_of_day=9,
        costs_assumed_points=0.5,
        is_out_of_sample=is_out_of_sample,
    )


def test_split_index_is_strictly_chronological_not_shuffled() -> None:
    # 100 bars, 30% out-of-sample -> split at bar 70; everything from 70
    # onward is OOS, nothing before it is - a pure function of position,
    # never a random assignment (this is the look-ahead-bias guard).
    split = split_out_of_sample_index(100, out_of_sample_fraction=0.3)
    assert split == 70


def test_split_index_rejects_invalid_fraction() -> None:
    with pytest.raises(ValueError):
        split_out_of_sample_index(100, out_of_sample_fraction=0.0)
    with pytest.raises(ValueError):
        split_out_of_sample_index(100, out_of_sample_fraction=1.0)


def test_validation_summary_counts_in_and_out_of_sample() -> None:
    trades = [_trade(i, pnl_r=1.0, is_out_of_sample=(i >= 5)) for i in range(10)]
    summary = build_validation_summary(trades)
    assert summary.in_sample_n == 5
    assert summary.out_of_sample_n == 5


def test_small_sample_and_oos_warnings_present() -> None:
    trades = [_trade(0, pnl_r=1.0, is_out_of_sample=False)]
    summary = build_validation_summary(trades)
    joined = " ".join(summary.warnings)
    assert "below 30" in joined
    assert "Out-of-sample count" in joined


def test_significance_strongly_positive_consistent_sample_has_low_p_value() -> None:
    # A large, consistently positive sample should be statistically significant.
    trades = [
        _trade(i, pnl_r=1.0 + (0.05 if i % 2 == 0 else -0.05), is_out_of_sample=False) for i in range(40)
    ]
    summary = build_validation_summary(trades)
    assert summary.significance.p_value is not None
    assert summary.significance.p_value < 0.01
    assert summary.significance.ci_low > 0  # confidence interval excludes zero


def test_significance_mixed_sample_is_not_significant() -> None:
    # Alternating +1R / -1R nets to ~zero mean -> should NOT be significant.
    trades = [_trade(i, pnl_r=1.0 if i % 2 == 0 else -1.0, is_out_of_sample=False) for i in range(40)]
    summary = build_validation_summary(trades)
    assert summary.significance.p_value is not None
    assert summary.significance.p_value > 0.5


def test_win_rate_confidence_interval_brackets_observed_rate() -> None:
    trades = [_trade(i, pnl_r=1.0 if i < 20 else -1.0, is_out_of_sample=False) for i in range(40)]
    summary = build_validation_summary(trades)
    assert summary.significance.win_rate_ci_low is not None
    assert summary.significance.win_rate_ci_low < 0.5 < summary.significance.win_rate_ci_high
