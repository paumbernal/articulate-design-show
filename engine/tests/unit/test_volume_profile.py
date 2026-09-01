from datetime import UTC, datetime, timedelta

from edge_lab.features.volume_profile import compute_volume_profile
from edge_lab.models import OHLCVBar

TICK = 0.25


def _bar(i: int, low: float, high: float, volume: float) -> OHLCVBar:
    return OHLCVBar(
        symbol="MES",
        timeframe="5m",
        timestamp=datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i),
        open=(low + high) / 2,
        high=high,
        low=low,
        close=(low + high) / 2,
        volume=volume,
        session="RTH",
        bar_index=i,
    )


def test_poc_lands_on_the_known_highest_volume_bucket() -> None:
    # Three narrow-range bars stacked at the same price band carry far more
    # volume than a couple of one-off bars elsewhere — POC must land there.
    bars = [
        _bar(0, 5100.0, 5100.25, volume=1000),
        _bar(1, 5100.0, 5100.25, volume=1000),
        _bar(2, 5100.0, 5100.25, volume=1000),
        _bar(3, 5105.0, 5105.25, volume=50),
        _bar(4, 5095.0, 5095.25, volume=50),
    ]
    result = compute_volume_profile(bars, tick_size=TICK, bucket_ticks=1)
    assert result.poc == 5100.0
    assert result.total_volume == 3100


def test_value_area_contains_target_percentage_of_volume() -> None:
    bars = [
        _bar(0, 5100.0, 5100.25, volume=1000),
        _bar(1, 5105.0, 5105.25, volume=200),
        _bar(2, 5095.0, 5095.25, volume=200),
        _bar(3, 5110.0, 5110.25, volume=50),
    ]
    result = compute_volume_profile(bars, tick_size=TICK, bucket_ticks=1, value_area_pct=0.70)
    assert result.val <= result.poc <= result.vah
    assert result.value_area_volume_pct >= 0.70


def test_empty_bars_returns_zeroed_result() -> None:
    result = compute_volume_profile([], tick_size=TICK)
    assert result.levels == []
    assert result.poc == 0.0
    assert result.total_volume == 0.0


def test_high_volume_node_detected_at_known_spike() -> None:
    bars = [_bar(i, 5100.0 + i * 0.25, 5100.25 + i * 0.25, volume=50) for i in range(10)]
    bars.append(_bar(10, 5102.0, 5102.25, volume=900))
    result = compute_volume_profile(bars, tick_size=TICK, bucket_ticks=1)
    assert 5102.0 in result.high_volume_nodes
