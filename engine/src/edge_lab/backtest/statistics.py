"""Aggregate statistics over a list of BacktestTrade — win rate, expectancy,
profit factor, drawdown, outcome distribution, and breakdowns by time of
day, day of week, session, and Edge Score bucket.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence

from edge_lab.models import (
    BacktestConfigSnapshot,
    BacktestStatistics,
    BacktestTrade,
    BreakdownRow,
    Breakdowns,
    ValidationSummary,
)

EDGE_SCORE_BUCKET_WIDTH = 10


def _win_rate(trades: Sequence[BacktestTrade]) -> float | None:
    if not trades:
        return None
    wins = sum(1 for t in trades if t.pnl_points > 0)
    return wins / len(trades)


def _profit_factor(trades: Sequence[BacktestTrade]) -> float | None:
    gross_profit = sum(t.pnl_points for t in trades if t.pnl_points > 0)
    gross_loss = sum(-t.pnl_points for t in trades if t.pnl_points < 0)
    if gross_loss == 0:
        return None  # undefined (no losses yet) rather than a misleading infinity
    return gross_profit / gross_loss


def _max_drawdown(trades: Sequence[BacktestTrade], field: str) -> float:
    """Max peak-to-trough drawdown over the trade sequence in entry order,
    treating each closed trade's pnl as a step in a cumulative equity curve.
    Returned as a non-positive number (0 = no drawdown).
    """
    ordered = sorted(trades, key=lambda t: t.entry_bar_index)
    cumulative = 0.0
    peak = 0.0
    max_dd = 0.0
    for t in ordered:
        cumulative += getattr(t, field)
        peak = max(peak, cumulative)
        max_dd = min(max_dd, cumulative - peak)
    return max_dd


def _outcome_distribution(trades: Sequence[BacktestTrade]) -> list[BreakdownRow]:
    buckets = [
        ("<= -2R", lambda r: r <= -2),
        ("-2R to -1R", lambda r: -2 < r <= -1),
        ("-1R to 0R", lambda r: -1 < r <= 0),
        ("0R to 1R", lambda r: 0 < r <= 1),
        ("1R to 2R", lambda r: 1 < r <= 2),
        ("> 2R", lambda r: r > 2),
    ]
    rows = []
    for label, predicate in buckets:
        n = sum(1 for t in trades if predicate(t.pnl_r))
        rows.append(BreakdownRow(label=label, n=n))
    return rows


def _breakdown_by(
    trades: Sequence[BacktestTrade], key_fn: Callable[[BacktestTrade], str]
) -> list[BreakdownRow]:
    groups: dict[str, list[BacktestTrade]] = {}
    for t in trades:
        groups.setdefault(key_fn(t), []).append(t)
    rows = []
    for label, group in groups.items():
        win_rate = _win_rate(group)
        avg_r = sum(t.pnl_r for t in group) / len(group)
        rows.append(
            BreakdownRow(
                label=label, n=len(group), win_rate=win_rate, avg_r=avg_r, expectancy=_expectancy(group)
            )
        )
    return rows


def _expectancy(trades: Sequence[BacktestTrade]) -> float | None:
    if not trades:
        return None
    return sum(t.pnl_r for t in trades) / len(trades)


def _edge_score_bucket_label(score: float) -> str:
    low = int(score // EDGE_SCORE_BUCKET_WIDTH) * EDGE_SCORE_BUCKET_WIDTH
    return f"{low}-{low + EDGE_SCORE_BUCKET_WIDTH}"


def compute_statistics(
    trades: Sequence[BacktestTrade],
    config: BacktestConfigSnapshot,
    validation: ValidationSummary,
) -> BacktestStatistics:
    n = len(trades)
    avg_return = sum(t.pnl_points for t in trades) / n if n else None
    avg_r = sum(t.pnl_r for t in trades) / n if n else None

    breakdowns = Breakdowns(
        by_time_of_day=_breakdown_by(trades, lambda t: f"{t.hour_of_day:02d}:00"),
        by_day_of_week=_breakdown_by(trades, lambda t: t.day_of_week),
        by_session=_breakdown_by(trades, lambda t: t.session),
        by_edge_score_bucket=_breakdown_by(trades, lambda t: _edge_score_bucket_label(t.edge_score_at_entry)),
    )

    target_trades = [t for t in trades if t.exit_reason == "target"]
    stop_trades = [t for t in trades if t.exit_reason == "stop"]

    return BacktestStatistics(
        config=config,
        sample_size=n,
        win_rate=_win_rate(trades),
        avg_return_points=avg_return,
        avg_r=avg_r,
        expectancy=_expectancy(trades),
        profit_factor=_profit_factor(trades),
        max_drawdown_points=_max_drawdown(trades, "pnl_points") if n else None,
        max_drawdown_r=_max_drawdown(trades, "pnl_r") if n else None,
        outcome_distribution=_outcome_distribution(trades),
        avg_mfe_points=sum(t.mfe_points for t in trades) / n if n else None,
        avg_mae_points=sum(t.mae_points for t in trades) / n if n else None,
        avg_time_to_target_bars=(
            sum(t.time_to_exit_bars for t in target_trades) / len(target_trades) if target_trades else None
        ),
        avg_time_to_stop_bars=(
            sum(t.time_to_exit_bars for t in stop_trades) / len(stop_trades) if stop_trades else None
        ),
        breakdowns=breakdowns,
        validation=validation,
    )
