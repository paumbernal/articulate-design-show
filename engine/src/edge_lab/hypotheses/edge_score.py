"""The Edge Score engine: turns a set of DetectedConditions into a score for
a SetupDefinition at a specific trigger bar.

This score is a configurable measure of how many predefined conditions are
present near the trigger bar — it is NEVER a prediction of price. That
framing is enforced by what this module does NOT do: there is no field or
computation here that estimates a probability of profit.
"""

from __future__ import annotations

from collections.abc import Sequence

from edge_lab.models import ComponentScore, DetectedCondition, EdgeScoreResult, SetupDefinition
from edge_lab.models.enums import Direction


def find_supporting_condition(
    conditions_by_type: dict[str, list[DetectedCondition]],
    rule_signal_type: str,
    sequence_within_bars: int | None,
    trigger_bar_index: int,
    direction: Direction,
) -> DetectedCondition | None:
    """The condition (if any) satisfying one setup rule for one trigger —
    the most recent matching condition within the backward-looking window
    (see WeightedRule.sequence_within_bars), so stop/target construction can
    reference concrete evidence (e.g. the swept level) rather than just a
    present/absent flag.
    """
    candidates = conditions_by_type.get(rule_signal_type, [])
    window_start = trigger_bar_index - (sequence_within_bars or 0)
    matches = [
        c for c in candidates if c.direction == direction and window_start <= c.bar_index <= trigger_bar_index
    ]
    return max(matches, key=lambda c: c.bar_index) if matches else None


def group_conditions_by_type(conditions: Sequence[DetectedCondition]) -> dict[str, list[DetectedCondition]]:
    conditions_by_type: dict[str, list[DetectedCondition]] = {}
    for c in conditions:
        conditions_by_type.setdefault(c.signal_type, []).append(c)
    return conditions_by_type


def score_trigger(
    setup: SetupDefinition,
    trigger_bar_index: int,
    direction: Direction,
    conditions: Sequence[DetectedCondition],
) -> EdgeScoreResult:
    """Score one candidate trigger bar. Callers decide what counts as a
    trigger (typically: the bar where the setup's anchor signal, e.g.
    poc_sweep, first fires) — this function only scores it.
    """
    conditions_by_type = group_conditions_by_type(conditions)

    component_scores: list[ComponentScore] = []
    met_required = True
    total = 0.0

    for rule in setup.rules:
        present = (
            find_supporting_condition(
                conditions_by_type, rule.signal_type, rule.sequence_within_bars, trigger_bar_index, direction
            )
            is not None
        )
        contribution = rule.weight if present else 0.0
        total += contribution
        component_scores.append(
            ComponentScore(
                signal_type=rule.signal_type, weight=rule.weight, present=present, contribution=contribution
            )
        )
        if rule.required and not present:
            met_required = False

    trigger_timestamp = next((c.timestamp for c in conditions if c.bar_index == trigger_bar_index), None)
    if trigger_timestamp is None:
        raise ValueError(
            f"No condition found at trigger_bar_index={trigger_bar_index} to source a timestamp from"
        )

    return EdgeScoreResult(
        setup_id=setup.id,
        setup_version=setup.version,
        symbol=conditions[0].symbol,
        timeframe=conditions[0].timeframe,
        trigger_bar_index=trigger_bar_index,
        trigger_timestamp=trigger_timestamp,
        direction=direction,
        score=total,
        max_score=setup.max_score,
        met_required_rules=met_required,
        component_scores=component_scores,
    )


def find_setup_triggers(
    setup: SetupDefinition,
    anchor_signal_type: str,
    conditions: Sequence[DetectedCondition],
) -> list[EdgeScoreResult]:
    """Score every occurrence of the setup's anchor signal (e.g. every
    poc_sweep) as a candidate trigger, in bar order.
    """
    anchors = [c for c in conditions if c.signal_type == anchor_signal_type]
    return [score_trigger(setup, a.bar_index, a.direction, conditions) for a in anchors]
