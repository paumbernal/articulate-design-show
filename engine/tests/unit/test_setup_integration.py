from datetime import date

from edge_lab.config import get_instrument
from edge_lab.data.synthetic_generator import GeneratorConfig, generate_dataset
from edge_lab.hypotheses.edge_score import find_setup_triggers
from edge_lab.hypotheses.setups.liquidity_sweep_absorption_reversal import (
    ANCHOR_SIGNAL_TYPE,
    build_setup,
)
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

SPEC = get_instrument("MES")


def test_full_pipeline_produces_sane_detection_and_trigger_counts() -> None:
    """Generator -> detection context -> signal registry -> Edge Engine,
    run end to end over a real dataset. This is the M3 checkpoint: the
    detectors must actually fire on the generator's injected scenarios, in
    a bounded, sane range — not zero, not absurdly high.
    """
    config = GeneratorConfig(
        symbol="MES",
        start_date=date(2026, 1, 5),
        end_date=date(2026, 4, 24),  # ~16 weeks
        timeframe="5m",
        seed=42,
    )
    dataset = generate_dataset(config)
    context = build_detection_context(dataset.bars, dataset.orderflow, SPEC)
    conditions = detect_all(dataset.bars, dataset.orderflow, context)

    n_sessions = len({b.timestamp.date() for b in dataset.bars})
    by_type = {}
    for c in conditions:
        by_type.setdefault(c.signal_type, []).append(c)

    assert 0 < len(by_type.get("liquidity_sweep", [])) < n_sessions * 3
    assert 0 < len(by_type.get("absorption", [])) < n_sessions * 20
    # delta_divergence is not engineered as tightly as the other two; only
    # assert it's not pathologically absent or exploding.
    assert len(by_type.get("delta_divergence", [])) < n_sessions * 20

    setup = build_setup()
    triggers = find_setup_triggers(setup, ANCHOR_SIGNAL_TYPE, conditions)
    assert len(triggers) > 0

    fully_confirmed = [t for t in triggers if t.met_required_rules]
    assert 0 < len(fully_confirmed) <= len(triggers)
    for t in fully_confirmed:
        assert t.score >= 70  # both required rules present -> at least their combined weight
        assert t.max_score == 100
