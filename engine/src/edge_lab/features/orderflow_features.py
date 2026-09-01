"""Rolling order-flow feature calculations consumed by the signal detectors
in edge_lab.signals — volume context, effort-vs-result (absorption proxy),
and price/delta divergence.
"""

from __future__ import annotations

from collections.abc import Sequence

from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar
from edge_lab.models.enums import Direction

EPSILON = 1e-9


def rolling_volume_average(bars: Sequence[OHLCVBar], window: int = 20) -> list[float]:
    """Trailing average volume, using only bars strictly before each index
    (no lookahead). The first `window` bars fall back to the expanding
    mean of whatever preceded them.
    """
    averages: list[float] = []
    for i in range(len(bars)):
        start = max(0, i - window)
        prior = bars[start:i]
        averages.append(sum(b.volume for b in prior) / len(prior) if prior else bars[i].volume)
    return averages


def volume_multiple(bars: Sequence[OHLCVBar], window: int = 20) -> list[float]:
    """bar.volume / trailing average volume — how many multiples of normal
    activity this bar represents. Used to flag "aggressive volume".
    """
    averages = rolling_volume_average(bars, window)
    return [bars[i].volume / max(averages[i], EPSILON) for i in range(len(bars))]


def effort_vs_result(bar: OHLCVBar, tick_size: float) -> float:
    """Volume per tick of net price movement. High values mean a lot of
    volume traded ("effort") without much net price progress ("result") —
    the raw signature absorption detection looks for.
    """
    ticks_moved = abs(bar.close - bar.open) / tick_size
    return bar.volume / max(ticks_moved, 0.5)


def cumulative_delta_series(orderflow: Sequence[SyntheticOrderFlowBar]) -> list[float]:
    return [ob.cumulative_delta for ob in orderflow]


def delta_price_divergence(
    bars: Sequence[OHLCVBar], orderflow: Sequence[SyntheticOrderFlowBar], lookback: int = 3
) -> list[Direction | None]:
    """The reversal direction implied when price makes a new local extreme
    (over `lookback` bars) but cumulative delta over the same window moves
    the other way — i.e. price and order flow disagree. None where no
    divergence is present.

    A "bearish" result means price pushed to a new high while delta fell
    (order flow doesn't confirm the rally, expect reversal down); "bullish"
    is the mirror image at a new low.
    """
    flags: list[Direction | None] = [None] * len(bars)
    for i in range(lookback, len(bars)):
        window_bars = bars[i - lookback : i + 1]
        window_delta = orderflow[i - lookback : i + 1]

        price_change = window_bars[-1].close - window_bars[0].close
        delta_change = window_delta[-1].cumulative_delta - window_delta[0].cumulative_delta

        is_new_high = window_bars[-1].high == max(b.high for b in window_bars)
        is_new_low = window_bars[-1].low == min(b.low for b in window_bars)

        if is_new_high and price_change > 0 and delta_change < 0:
            flags[i] = "bearish"
        elif is_new_low and price_change < 0 and delta_change > 0:
            flags[i] = "bullish"
    return flags
