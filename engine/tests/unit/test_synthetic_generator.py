from datetime import date

import pytest

from edge_lab.data.session_calendar import trading_days_between
from edge_lab.data.synthetic_generator import BARS_PER_SESSION, GeneratorConfig, generate_dataset
from edge_lab.data.synthetic_provider import SyntheticMarketDataProvider


def _config(**overrides) -> GeneratorConfig:
    defaults = dict(
        symbol="MES",
        start_date=date(2026, 1, 5),  # a Monday
        end_date=date(2026, 2, 27),  # ~8 weeks later
        timeframe="5m",
        seed=42,
    )
    defaults.update(overrides)
    return GeneratorConfig(**defaults)


def test_dataset_has_no_gaps_and_matches_expected_bar_count() -> None:
    config = _config()
    dataset = generate_dataset(config)
    n_days = len(trading_days_between(config.start_date, config.end_date))
    expected_bars = n_days * BARS_PER_SESSION[config.timeframe]

    assert len(dataset.bars) == expected_bars
    assert len(dataset.orderflow) == expected_bars

    for i, bar in enumerate(dataset.bars):
        assert bar.bar_index == i
        assert bar.low <= bar.open <= bar.high
        assert bar.low <= bar.close <= bar.high
        assert bar.low <= bar.high
        assert bar.volume > 0


def test_dataset_is_deterministic_under_fixed_seed() -> None:
    a = generate_dataset(_config(seed=7))
    b = generate_dataset(_config(seed=7))
    assert [bar.close for bar in a.bars] == [bar.close for bar in b.bars]
    assert len(a.injected_scenarios) == len(b.injected_scenarios)


def test_different_seeds_produce_different_paths() -> None:
    a = generate_dataset(_config(seed=1))
    b = generate_dataset(_config(seed=2))
    assert [bar.close for bar in a.bars] != [bar.close for bar in b.bars]


def test_injected_scenario_count_is_within_a_bounded_seeded_range() -> None:
    dataset = generate_dataset(_config(seed=42, injection_rate=0.6, negative_control_rate=0.5))
    n_sessions = len(trading_days_between(date(2026, 1, 5), date(2026, 2, 27)))
    kinds = {s.kind for s in dataset.injected_scenarios}

    # Loose bounds: not zero (the generator must actually produce examples),
    # and not absurdly high relative to session count (still a controlled rate).
    assert 0 < len(dataset.injected_scenarios) < n_sessions * 3
    assert "target_reversal" in kinds
    assert "negative_sweep_continuation" in kinds or "negative_volume_spike" in kinds


def test_target_reversal_outcomes_are_mixed_not_scripted_wins() -> None:
    dataset = generate_dataset(
        _config(seed=42, injection_rate=1.0, negative_control_rate=0.0, end_date=date(2026, 6, 26))
    )
    reversals = [s for s in dataset.injected_scenarios if s.kind == "target_reversal"]
    assert len(reversals) >= 10
    reverted_flags = {s.reverted for s in reversals}
    # Both outcomes must occur — a generator that always reverts would make
    # the backtest a strawman rather than a genuine test.
    assert reverted_flags == {True, False}


def test_cumulative_delta_resets_each_session() -> None:
    dataset = generate_dataset(_config(end_date=date(2026, 1, 9)))  # one week
    n = BARS_PER_SESSION["5m"]
    first_bar_of_second_session = dataset.orderflow[n]
    assert first_bar_of_second_session.cumulative_delta == pytest.approx(first_bar_of_second_session.delta)


def test_weekend_only_range_returns_empty_dataset() -> None:
    # 2026-01-03/04 is a Saturday/Sunday (2026-01-05 is the Monday used elsewhere in this file).
    dataset = generate_dataset(_config(start_date=date(2026, 1, 3), end_date=date(2026, 1, 4)))
    assert dataset.bars == []


def test_synthetic_provider_caches_and_matches_generator() -> None:
    provider = SyntheticMarketDataProvider(seed=42)
    start, end = date(2026, 1, 5), date(2026, 1, 9)
    bars_a = provider.get_bars("MES", "5m", start, end)
    bars_b = provider.get_bars("MES", "5m", start, end)
    assert bars_a is bars_b  # cached, not regenerated

    orderflow = provider.get_orderflow("MES", "5m", start, end)
    assert len(orderflow) == len(bars_a)
    assert provider.is_synthetic is True
