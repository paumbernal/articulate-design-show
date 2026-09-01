from datetime import UTC, datetime, timedelta

from edge_lab.hypotheses.edge_score import find_setup_triggers, score_trigger
from edge_lab.hypotheses.setups.liquidity_sweep_absorption_reversal import (
    ANCHOR_SIGNAL_TYPE,
    build_setup,
)
from edge_lab.models import DetectedCondition


def _cond(signal_type: str, bar_index: int, direction: str, strength: float = 0.7) -> DetectedCondition:
    return DetectedCondition(
        id=f"{signal_type}-{bar_index}",
        symbol="MES",
        timeframe="5m",
        bar_index=bar_index,
        timestamp=datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * bar_index),
        signal_type=signal_type,
        direction=direction,
        strength=strength,
        evidence={},
    )


def test_score_trigger_full_match_hits_max_score() -> None:
    setup = build_setup()
    conditions = [
        _cond("liquidity_sweep", 10, "bullish"),
        _cond("absorption", 12, "bullish"),  # trigger bar
        _cond("delta_divergence", 11, "bullish"),
    ]
    result = score_trigger(setup, trigger_bar_index=12, direction="bullish", conditions=conditions)
    assert result.score == 100
    assert result.max_score == 100
    assert result.met_required_rules is True
    assert sum(c.contribution for c in result.component_scores) == result.score


def test_score_trigger_missing_required_rule() -> None:
    setup = build_setup()
    # No liquidity_sweep condition at all -> required rule unmet.
    conditions = [_cond("absorption", 12, "bullish")]
    result = score_trigger(setup, trigger_bar_index=12, direction="bullish", conditions=conditions)
    assert result.met_required_rules is False
    assert result.score == 35  # only absorption's weight


def test_score_trigger_ignores_conditions_outside_sequence_window() -> None:
    setup = build_setup()
    conditions = [
        _cond("liquidity_sweep", 3, "bullish"),  # 9 bars before trigger, window is 5 -> too far
        _cond("absorption", 12, "bullish"),
    ]
    result = score_trigger(setup, trigger_bar_index=12, direction="bullish", conditions=conditions)
    liquidity_sweep_component = next(c for c in result.component_scores if c.signal_type == "liquidity_sweep")
    assert liquidity_sweep_component.present is False
    assert result.met_required_rules is False


def test_score_trigger_ignores_mismatched_direction() -> None:
    setup = build_setup()
    conditions = [
        _cond("liquidity_sweep", 10, "bearish"),  # wrong direction for a bullish trigger
        _cond("absorption", 12, "bullish"),
    ]
    result = score_trigger(setup, trigger_bar_index=12, direction="bullish", conditions=conditions)
    liquidity_sweep_component = next(c for c in result.component_scores if c.signal_type == "liquidity_sweep")
    assert liquidity_sweep_component.present is False


def test_find_setup_triggers_anchors_on_absorption() -> None:
    setup = build_setup()
    assert ANCHOR_SIGNAL_TYPE == "absorption"
    conditions = [
        _cond("liquidity_sweep", 10, "bullish"),
        _cond("absorption", 12, "bullish"),
        _cond("delta_divergence", 11, "bullish"),
        _cond("absorption", 40, "bearish"),  # a second, unrelated absorption occurrence
    ]
    triggers = find_setup_triggers(setup, ANCHOR_SIGNAL_TYPE, conditions)
    assert len(triggers) == 2
    assert triggers[0].trigger_bar_index == 12
    assert triggers[0].score == 100
    assert triggers[1].trigger_bar_index == 40
    assert triggers[1].met_required_rules is False  # no supporting liquidity_sweep nearby
