"""Trade simulation: walks forward from each qualifying trigger to its exit,
and assembles the resulting BacktestTrade records.

Explicit, documented assumptions (part of the project's honesty requirement,
not hidden in code):
  - No overlapping positions per setup — a new trigger is skipped while a
    prior trade from the same setup is still open. No pyramiding.
  - When both the stop and target are touched within the same bar, the stop
    is assumed to fill first (the conservative, common backtesting
    convention — real intrabar sequencing is unknowable from OHLC bars).
  - A position still open at its entry session's last bar is force-closed
    there ("session_close") — the synthetic dataset has no continuity
    across the gap into the next session.
  - Costs (`costs_points`) are a fixed, visible per-trade deduction from
    pnl_points — not a market-impact or fill-quality model.
  - Trades whose initial risk (entry to stop) is below `min_risk_ticks` are
    skipped, not just trades with exactly-zero risk. Without this floor, a
    trigger bar that closes very close to the swept level (entirely
    possible — absorption bars are constructed to keep price contained
    near that zone) produces a tiny denominator in pnl_r, which explodes
    into meaningless R-multiples (an early version of this engine produced
    an average of -11R per trade from exactly this bug). A real trader
    wouldn't take a trade with an effectively-zero stop distance either.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from zoneinfo import ZoneInfo

from edge_lab.backtest.fills import FillResult, compute_entry_stop_target
from edge_lab.config import InstrumentSpec
from edge_lab.data.session_calendar import day_of_week_label, session_index_groups
from edge_lab.hypotheses.edge_score import find_setup_triggers
from edge_lab.models import BacktestTrade, DetectedCondition, OHLCVBar, SetupDefinition
from edge_lab.models.enums import Direction, ExitReason

DEFAULT_COSTS_POINTS = 0.5
DEFAULT_R_MULTIPLE = 2.0
DEFAULT_STOP_BUFFER_TICKS = 2.0
DEFAULT_MIN_RISK_TICKS = 2.0


@dataclass(frozen=True)
class SimulatedExit:
    bar_index: int
    price: float
    reason: ExitReason
    mfe_points: float
    mae_points: float


def _session_end_index_for(bar_index: int, groups: list[tuple[int, int]]) -> int:
    for start, end in groups:
        if start <= bar_index < end:
            return end - 1
    raise ValueError(f"bar_index {bar_index} not found in any session group")


def simulate_exit(
    direction: Direction,
    bars: Sequence[OHLCVBar],
    entry_bar_index: int,
    fill: FillResult,
    max_hold_bars: int,
    session_end_index: int,
) -> SimulatedExit:
    max_exit_idx = min(entry_bar_index + max_hold_bars, session_end_index)
    session_ends_first = max_exit_idx == session_end_index < entry_bar_index + max_hold_bars
    default_reason: ExitReason = "session_close" if session_ends_first else "max_hold_time"

    exit_idx = max_exit_idx
    exit_price = bars[max_exit_idx].close
    exit_reason = default_reason
    mfe = 0.0
    mae = 0.0

    for i in range(entry_bar_index + 1, max_exit_idx + 1):
        bar = bars[i]
        if direction == "bullish":
            mfe = max(mfe, bar.high - fill.entry_price)
            mae = max(mae, fill.entry_price - bar.low)
            if bar.low <= fill.stop_price:
                exit_idx, exit_price, exit_reason = i, fill.stop_price, "stop"
                break
            if bar.high >= fill.target_price:
                exit_idx, exit_price, exit_reason = i, fill.target_price, "target"
                break
        else:
            mfe = max(mfe, fill.entry_price - bar.low)
            mae = max(mae, bar.high - fill.entry_price)
            if bar.high >= fill.stop_price:
                exit_idx, exit_price, exit_reason = i, fill.stop_price, "stop"
                break
            if bar.low <= fill.target_price:
                exit_idx, exit_price, exit_reason = i, fill.target_price, "target"
                break

    return SimulatedExit(
        bar_index=exit_idx, price=exit_price, reason=exit_reason, mfe_points=mfe, mae_points=mae
    )


def run_backtest(
    setup: SetupDefinition,
    anchor_signal_type: str,
    bars: Sequence[OHLCVBar],
    conditions: Sequence[DetectedCondition],
    spec: InstrumentSpec,
    min_edge_score: float | None = None,
    r_multiple: float = DEFAULT_R_MULTIPLE,
    stop_buffer_ticks: float = DEFAULT_STOP_BUFFER_TICKS,
    costs_points: float = DEFAULT_COSTS_POINTS,
    min_risk_ticks: float = DEFAULT_MIN_RISK_TICKS,
    out_of_sample_split_bar_index: int | None = None,
) -> list[BacktestTrade]:
    threshold = setup.min_edge_score_default if min_edge_score is None else min_edge_score
    triggers = find_setup_triggers(setup, anchor_signal_type, conditions)
    eligible = sorted(
        (t for t in triggers if t.met_required_rules and t.score >= threshold),
        key=lambda t: t.trigger_bar_index,
    )

    groups = session_index_groups(bars)
    trades: list[BacktestTrade] = []
    last_exit_idx = -1

    for trigger in eligible:
        if trigger.trigger_bar_index <= last_exit_idx:
            continue  # a prior trade from this setup is still open

        fill = compute_entry_stop_target(
            setup, trigger, bars, conditions, spec.tick_size, r_multiple, stop_buffer_ticks
        )
        if fill.initial_risk_points < min_risk_ticks * spec.tick_size:
            continue  # degenerate/near-zero stop distance; would explode into a meaningless R-multiple

        session_end = _session_end_index_for(trigger.trigger_bar_index, groups)
        exit_ = simulate_exit(
            trigger.direction, bars, trigger.trigger_bar_index, fill, setup.max_hold_bars, session_end
        )

        entry_bar = bars[trigger.trigger_bar_index]
        local_entry_dt = entry_bar.timestamp.astimezone(ZoneInfo(spec.timezone))
        sign = 1 if trigger.direction == "bullish" else -1
        pnl_points = (exit_.price - fill.entry_price) * sign - costs_points
        pnl_r = pnl_points / fill.initial_risk_points

        trades.append(
            BacktestTrade(
                id=f"{setup.id}-v{setup.version}-{trigger.trigger_bar_index}",
                setup_id=setup.id,
                setup_version=setup.version,
                symbol=entry_bar.symbol,
                direction=trigger.direction,
                edge_score_at_entry=trigger.score,
                entry_bar_index=trigger.trigger_bar_index,
                entry_timestamp=entry_bar.timestamp,
                entry_price=fill.entry_price,
                stop_price=fill.stop_price,
                target_price=fill.target_price,
                exit_bar_index=exit_.bar_index,
                exit_timestamp=bars[exit_.bar_index].timestamp,
                exit_price=exit_.price,
                exit_reason=exit_.reason,
                hold_bars=exit_.bar_index - trigger.trigger_bar_index,
                pnl_points=pnl_points,
                pnl_r=pnl_r,
                mfe_points=exit_.mfe_points,
                mae_points=exit_.mae_points,
                time_to_exit_bars=exit_.bar_index - trigger.trigger_bar_index,
                session=entry_bar.session,
                day_of_week=day_of_week_label(local_entry_dt.date()),
                hour_of_day=local_entry_dt.hour,
                costs_assumed_points=costs_points,
                is_out_of_sample=(
                    out_of_sample_split_bar_index is not None
                    and trigger.trigger_bar_index >= out_of_sample_split_bar_index
                ),
            )
        )
        last_exit_idx = exit_.bar_index

    return trades
