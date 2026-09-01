from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from edge_lab.models import (
    ComponentScore,
    DetectedCondition,
    EdgeScoreResult,
    OHLCVBar,
    SetupDefinition,
    SyntheticOrderFlowBar,
    WeightedRule,
)


def make_bar(**overrides) -> OHLCVBar:
    defaults = dict(
        symbol="MES",
        timeframe="5m",
        timestamp=datetime(2026, 3, 2, 14, 30, tzinfo=UTC),
        open=5100.0,
        high=5102.0,
        low=5099.0,
        close=5101.0,
        volume=1200,
        session="RTH",
        bar_index=0,
    )
    defaults.update(overrides)
    return OHLCVBar(**defaults)


def test_ohlcv_bar_round_trip() -> None:
    bar = make_bar()
    dumped = bar.model_dump_json()
    restored = OHLCVBar.model_validate_json(dumped)
    assert restored == bar


def test_ohlcv_bar_rejects_negative_volume() -> None:
    with pytest.raises(ValidationError):
        make_bar(volume=-1)


def test_ohlcv_bar_rejects_unknown_symbol() -> None:
    with pytest.raises(ValidationError):
        make_bar(symbol="ES")


def test_synthetic_orderflow_bar_schema() -> None:
    bar = SyntheticOrderFlowBar(
        symbol="MNQ",
        timeframe="5m",
        bar_index=3,
        bid_volume=400,
        ask_volume=650,
        delta=250,
        cumulative_delta=1100,
        aggressive_buy_volume=300,
        aggressive_sell_volume=120,
        imbalance_ratio=1.625,
    )
    assert bar.price_levels is None


def test_detected_condition_evidence_is_flexible() -> None:
    condition = DetectedCondition(
        id="cond-1",
        symbol="MES",
        timeframe="5m",
        bar_index=42,
        timestamp=datetime(2026, 3, 2, 14, 35, tzinfo=UTC),
        signal_type="liquidity_sweep",
        direction="bullish",
        strength=0.8,
        evidence={"swept_level": 5098.5, "volume_multiple": 3.2, "note": "prior session low"},
    )
    assert condition.evidence["swept_level"] == 5098.5


def test_setup_definition_max_score_and_default_validation() -> None:
    setup = SetupDefinition(
        id="liquidity-sweep-absorption-reversal",
        name="Liquidity Sweep + Absorption Reversal",
        description="Sweep of a prior high/low followed by absorption and failure to continue.",
        rules=[
            WeightedRule(signal_type="liquidity_sweep", weight=20, required=True),
            WeightedRule(signal_type="absorption", weight=20, required=True, sequence_within_bars=3),
            WeightedRule(signal_type="delta_divergence", weight=15, sequence_within_bars=3),
            WeightedRule(signal_type="failed_auction", weight=20, sequence_within_bars=3),
            WeightedRule(signal_type="value_area_interaction", weight=10),
            WeightedRule(signal_type="htf_structure_alignment", weight=15),
        ],
        min_edge_score_default=60,
        entry_methodology="close_of_trigger_bar",
        stop_methodology="swept_level_plus_buffer",
        target_methodology="fixed_r_multiple",
        max_hold_bars=24,
    )
    assert setup.max_score == 100


def test_setup_definition_rejects_default_above_max_score() -> None:
    with pytest.raises(ValidationError):
        SetupDefinition(
            id="broken-setup",
            name="Broken",
            description="min_edge_score_default too high",
            rules=[WeightedRule(signal_type="liquidity_sweep", weight=20)],
            min_edge_score_default=999,
            entry_methodology="close_of_trigger_bar",
            stop_methodology="atr_multiple",
            target_methodology="fixed_r_multiple",
            max_hold_bars=10,
        )


def test_edge_score_result_component_scores() -> None:
    result = EdgeScoreResult(
        setup_id="liquidity-sweep-absorption-reversal",
        setup_version=1,
        symbol="MES",
        timeframe="5m",
        trigger_bar_index=42,
        trigger_timestamp=datetime(2026, 3, 2, 14, 35, tzinfo=UTC),
        direction="bullish",
        score=82,
        max_score=100,
        met_required_rules=True,
        component_scores=[
            ComponentScore(signal_type="liquidity_sweep", weight=20, present=True, contribution=20),
            ComponentScore(signal_type="absorption", weight=20, present=True, contribution=20),
        ],
    )
    assert result.score / result.max_score == pytest.approx(0.82)
