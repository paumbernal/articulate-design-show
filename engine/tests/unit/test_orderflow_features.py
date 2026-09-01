from datetime import UTC, datetime, timedelta

from edge_lab.features.orderflow_features import (
    delta_price_divergence,
    effort_vs_result,
    rolling_volume_average,
    volume_multiple,
)
from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar

TICK = 0.25


def _bar(
    i: int,
    open_: float,
    close: float,
    volume: float,
    high: float | None = None,
    low: float | None = None,
) -> OHLCVBar:
    return OHLCVBar(
        symbol="MES",
        timeframe="5m",
        timestamp=datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i),
        open=open_,
        high=high if high is not None else max(open_, close),
        low=low if low is not None else min(open_, close),
        close=close,
        volume=volume,
        session="RTH",
        bar_index=i,
    )


def _of(i: int, bid: float, ask: float, cumulative_delta: float) -> SyntheticOrderFlowBar:
    return SyntheticOrderFlowBar(
        symbol="MES",
        timeframe="5m",
        bar_index=i,
        bid_volume=bid,
        ask_volume=ask,
        delta=ask - bid,
        cumulative_delta=cumulative_delta,
        aggressive_buy_volume=ask * 0.6,
        aggressive_sell_volume=bid * 0.6,
        imbalance_ratio=ask / max(bid, 1e-9),
    )


def test_volume_multiple_flags_spike_above_trailing_average() -> None:
    bars = [_bar(i, 5100, 5100.5, volume=100) for i in range(10)]
    bars.append(_bar(10, 5100, 5101, volume=500))
    multiples = volume_multiple(bars, window=10)
    assert multiples[10] == 5.0  # 500 / trailing avg of 100


def test_rolling_volume_average_has_no_lookahead() -> None:
    bars = [_bar(0, 5100, 5100.5, volume=100), _bar(1, 5100, 5100.5, volume=900)]
    averages = rolling_volume_average(bars, window=10)
    # bar 0's average can't see bar 1's huge volume.
    assert averages[0] == 100


def test_effort_vs_result_high_for_absorption_shape() -> None:
    # Huge volume, almost no net price movement -> high effort-vs-result.
    absorption_bar = _bar(0, 5100.0, 5100.25, volume=1000, high=5100.5, low=5099.75)
    trending_bar = _bar(1, 5100.0, 5102.0, volume=200, high=5102.0, low=5100.0)
    assert effort_vs_result(absorption_bar, TICK) > effort_vs_result(trending_bar, TICK)


def test_delta_price_divergence_detects_new_high_with_falling_delta() -> None:
    bars = [
        _bar(0, 5100, 5100.5, volume=100),
        _bar(1, 5100.5, 5101, volume=100),
        _bar(2, 5101, 5101.5, volume=100),
        _bar(3, 5101.5, 5102, volume=100, high=5102.25),  # new local high
    ]
    orderflow = [
        _of(0, 40, 60, cumulative_delta=20),
        _of(1, 45, 55, cumulative_delta=30),
        _of(2, 55, 45, cumulative_delta=20),
        _of(3, 70, 30, cumulative_delta=-20),  # cumulative delta falls while price makes a new high
    ]
    flags = delta_price_divergence(bars, orderflow, lookback=3)
    assert flags[3] == "bearish"
    assert flags[0] is None


def test_delta_price_divergence_false_when_delta_confirms() -> None:
    bars = [
        _bar(0, 5100, 5100.5, volume=100),
        _bar(1, 5100.5, 5101, volume=100),
        _bar(2, 5101, 5101.5, volume=100),
        _bar(3, 5101.5, 5102, volume=100, high=5102.25),
    ]
    orderflow = [
        _of(0, 40, 60, cumulative_delta=20),
        _of(1, 35, 65, cumulative_delta=50),
        _of(2, 30, 70, cumulative_delta=90),
        _of(3, 20, 80, cumulative_delta=150),  # delta rises alongside the new high -> confirms, no divergence
    ]
    flags = delta_price_divergence(bars, orderflow, lookback=3)
    assert flags[3] is None
