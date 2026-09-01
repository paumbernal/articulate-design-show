from datetime import UTC, datetime, timedelta

from edge_lab.features.market_structure import detect_breaks_of_structure, find_swing_points, session_high_low
from edge_lab.models import OHLCVBar


def _bar(i: int, high: float, low: float, close: float | None = None) -> OHLCVBar:
    return OHLCVBar(
        symbol="MES",
        timeframe="5m",
        timestamp=datetime(2026, 3, 2, 14, 30, tzinfo=UTC) + timedelta(minutes=5 * i),
        open=(high + low) / 2,
        high=high,
        low=low,
        close=close if close is not None else (high + low) / 2,
        volume=100,
        session="RTH",
        bar_index=i,
    )


def test_swing_high_detected_at_hand_built_peak() -> None:
    # A clean peak at index 3: highs rise then fall around it.
    bars = [
        _bar(0, 5100, 5098),
        _bar(1, 5102, 5099),
        _bar(2, 5104, 5101),
        _bar(3, 5110, 5103),  # the peak
        _bar(4, 5105, 5100),
        _bar(5, 5103, 5098),
        _bar(6, 5101, 5097),
    ]
    swings = find_swing_points(bars, lookback=3)
    highs = [s for s in swings if s.kind == "high"]
    assert len(highs) == 1
    assert highs[0].bar_index == 3
    assert highs[0].price == 5110


def test_swing_low_detected_at_hand_built_trough() -> None:
    bars = [
        _bar(0, 5110, 5108),
        _bar(1, 5109, 5106),
        _bar(2, 5107, 5104),
        _bar(3, 5106, 5095),  # the trough
        _bar(4, 5108, 5100),
        _bar(5, 5109, 5103),
        _bar(6, 5111, 5105),
    ]
    swings = find_swing_points(bars, lookback=3)
    lows = [s for s in swings if s.kind == "low"]
    assert len(lows) == 1
    assert lows[0].bar_index == 3
    assert lows[0].price == 5095


def test_no_swings_detected_in_monotonic_series() -> None:
    bars = [_bar(i, 5100 + i, 5098 + i) for i in range(10)]
    swings = find_swing_points(bars, lookback=3)
    assert swings == []


def test_session_high_low() -> None:
    bars = [_bar(0, 5100, 5098), _bar(1, 5110, 5095), _bar(2, 5105, 5099)]
    high, low = session_high_low(bars)
    assert high == 5110
    assert low == 5095


def test_break_of_structure_detected_when_close_exceeds_prior_swing_high() -> None:
    bars = [
        _bar(0, 5100, 5098),
        _bar(1, 5102, 5099),
        _bar(2, 5104, 5101),
        _bar(3, 5110, 5103),  # swing high at 5110
        _bar(4, 5105, 5100),
        _bar(5, 5103, 5098),
        _bar(6, 5101, 5097),
        _bar(7, 5108, 5104),
        _bar(8, 5115, 5108, close=5112),  # closes beyond the prior swing high -> bullish BOS
    ]
    swings = find_swing_points(bars, lookback=3)
    breaks = detect_breaks_of_structure(bars, swings)
    bullish_breaks = [b for b in breaks if b.direction == "bullish"]
    assert len(bullish_breaks) == 1
    assert bullish_breaks[0].bar_index == 8
    assert bullish_breaks[0].broken_swing.price == 5110
