"""M4 checkpoint: generator -> detection -> Edge Engine -> backtest ->
statistics, run end to end over a real synthetic dataset. This is "the one
complete research pipeline" the MVP exists to prove out.
"""

from datetime import date

from edge_lab.backtest.engine import run_backtest
from edge_lab.backtest.statistics import compute_statistics
from edge_lab.backtest.validation import build_validation_summary, split_out_of_sample_index
from edge_lab.config import get_instrument
from edge_lab.data.synthetic_generator import GeneratorConfig, generate_dataset
from edge_lab.hypotheses.setups.liquidity_sweep_absorption_reversal import (
    ANCHOR_SIGNAL_TYPE,
    build_setup,
)
from edge_lab.models import BacktestConfigSnapshot
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

SPEC = get_instrument("MES")


def test_full_research_pipeline_produces_internally_consistent_statistics() -> None:
    config = GeneratorConfig(
        symbol="MES",
        start_date=date(2026, 1, 5),
        end_date=date(2026, 6, 26),  # ~6 months
        timeframe="5m",
        seed=42,
    )
    dataset = generate_dataset(config)
    context = build_detection_context(dataset.bars, dataset.orderflow, SPEC)
    conditions = detect_all(dataset.bars, dataset.orderflow, context)

    setup = build_setup()
    oos_split = split_out_of_sample_index(len(dataset.bars), out_of_sample_fraction=0.3)
    trades = run_backtest(
        setup,
        ANCHOR_SIGNAL_TYPE,
        dataset.bars,
        conditions,
        SPEC,
        min_edge_score=setup.min_edge_score_default,
        out_of_sample_split_bar_index=oos_split,
    )

    assert len(trades) > 0, "the full pipeline must actually produce tradable setup instances"

    # No overlapping trades: each trade must start after the previous one exits.
    ordered = sorted(trades, key=lambda t: t.entry_bar_index)
    for prev, nxt in zip(ordered, ordered[1:], strict=False):
        assert nxt.entry_bar_index > prev.exit_bar_index

    # Every trade respects the setup's own risk/reward construction.
    for t in trades:
        assert t.hold_bars <= setup.max_hold_bars
        assert t.exit_reason in {"target", "stop", "max_hold_time", "session_close"}
        assert t.edge_score_at_entry >= setup.min_edge_score_default

    validation = build_validation_summary(trades)
    config_snapshot = BacktestConfigSnapshot(
        symbol="MES",
        date_range_start=dataset.bars[0].timestamp,
        date_range_end=dataset.bars[-1].timestamp,
        session="RTH",
        setup_id=setup.id,
        setup_version=setup.version,
        min_edge_score=setup.min_edge_score_default,
        entry_methodology=setup.entry_methodology,
        stop_methodology=setup.stop_methodology,
        target_methodology=setup.target_methodology,
        max_hold_bars=setup.max_hold_bars,
        costs_assumed_points=0.5,
        out_of_sample_split=dataset.bars[oos_split].timestamp,
    )
    stats = compute_statistics(trades, config_snapshot, validation)

    assert stats.sample_size == len(trades)
    assert stats.win_rate is not None
    assert 0 <= stats.win_rate <= 1
    assert sum(row.n for row in stats.outcome_distribution) == len(trades)
    assert sum(row.n for row in stats.breakdowns.by_session) == len(trades)
    assert stats.validation.in_sample_n + stats.validation.out_of_sample_n == len(trades)
    # A ~6 month, single-setup sample is realistically small — the honesty
    # warnings must show up, not be silently dropped.
    assert len(stats.validation.warnings) > 0

    # The win rate must not be a suspicious 100% or 0% — the generator's
    # negative controls and randomized reversion magnitude (see M2) exist
    # specifically so this pipeline doesn't produce a strawman result.
    assert 0.0 < stats.win_rate < 1.0
