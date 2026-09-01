"""Entry/stop/target construction for one trigger, per the setup's
methodology strings. Only the two methodologies this MVP setup actually
uses are implemented — `compute_entry_stop_target` raises on anything else,
rather than silently guessing, so a misconfigured setup fails loudly.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from edge_lab.hypotheses.edge_score import find_supporting_condition, group_conditions_by_type
from edge_lab.models import DetectedCondition, EdgeScoreResult, OHLCVBar, SetupDefinition


@dataclass(frozen=True)
class FillResult:
    entry_price: float
    stop_price: float
    target_price: float
    initial_risk_points: float


def compute_entry_stop_target(
    setup: SetupDefinition,
    trigger: EdgeScoreResult,
    bars: Sequence[OHLCVBar],
    conditions: Sequence[DetectedCondition],
    tick_size: float,
    r_multiple: float,
    stop_buffer_ticks: float,
) -> FillResult:
    if setup.entry_methodology != "close_of_trigger_bar":
        raise ValueError(f"Unsupported entry_methodology: {setup.entry_methodology!r}")
    if setup.stop_methodology != "swept_level_plus_buffer":
        raise ValueError(f"Unsupported stop_methodology: {setup.stop_methodology!r}")
    if setup.target_methodology != "fixed_r_multiple":
        raise ValueError(f"Unsupported target_methodology: {setup.target_methodology!r}")

    entry_bar = bars[trigger.trigger_bar_index]
    entry_price = entry_bar.close

    conditions_by_type = group_conditions_by_type(conditions)
    sweep_rule = next(r for r in setup.rules if r.signal_type == "liquidity_sweep")
    sweep_condition = find_supporting_condition(
        conditions_by_type,
        "liquidity_sweep",
        sweep_rule.sequence_within_bars,
        trigger.trigger_bar_index,
        trigger.direction,
    )

    if sweep_condition is not None and "swept_level" in sweep_condition.evidence:
        swept_level = float(sweep_condition.evidence["swept_level"])
    else:
        # No supporting sweep found (e.g. the setup's required rule wasn't
        # met) — fall back to the trigger bar's own extreme so a stop can
        # still be computed. Trades from an unmet-required-rule trigger are
        # filtered out upstream in run_backtest, so this path is a safety
        # net, not the normal case.
        swept_level = entry_bar.low if trigger.direction == "bullish" else entry_bar.high

    buffer = stop_buffer_ticks * tick_size
    if trigger.direction == "bullish":
        stop_price = swept_level - buffer
        initial_risk = entry_price - stop_price
        target_price = entry_price + r_multiple * initial_risk
    else:
        stop_price = swept_level + buffer
        initial_risk = stop_price - entry_price
        target_price = entry_price - r_multiple * initial_risk

    return FillResult(
        entry_price=entry_price,
        stop_price=stop_price,
        target_price=target_price,
        initial_risk_points=abs(initial_risk),
    )
