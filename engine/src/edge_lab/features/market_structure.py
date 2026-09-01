"""Swing highs/lows, session extremes, and break-of-structure detection.

These are the "levels" other signals (liquidity sweep, in particular)
reference — a swept level must be a real, previously-established price
point, never a lookahead-derived one.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Literal

from edge_lab.models import OHLCVBar

SwingKind = Literal["high", "low"]


@dataclass(frozen=True)
class SwingPoint:
    bar_index: int
    price: float
    kind: SwingKind


@dataclass(frozen=True)
class StructureBreak:
    bar_index: int
    broken_swing: SwingPoint
    direction: Literal["bullish", "bearish"]


def find_swing_points(bars: Sequence[OHLCVBar], lookback: int = 3) -> list[SwingPoint]:
    """A bar is a swing high/low if its high/low is the strict extreme among
    `lookback` bars on both sides. Only bars with a full window on both
    sides can be swing points (no lookahead at the dataset's edges).
    """
    points: list[SwingPoint] = []
    n = len(bars)
    for i in range(lookback, n - lookback):
        window = bars[i - lookback : i + lookback + 1]
        this_bar = bars[i]
        if this_bar.high == max(b.high for b in window) and all(
            this_bar.high > b.high for j, b in enumerate(window) if j != lookback
        ):
            points.append(SwingPoint(bar_index=i, price=this_bar.high, kind="high"))
        if this_bar.low == min(b.low for b in window) and all(
            this_bar.low < b.low for j, b in enumerate(window) if j != lookback
        ):
            points.append(SwingPoint(bar_index=i, price=this_bar.low, kind="low"))
    return points


def session_high_low(bars: Sequence[OHLCVBar]) -> tuple[float, float]:
    if not bars:
        raise ValueError("bars must not be empty")
    return max(b.high for b in bars), min(b.low for b in bars)


def detect_breaks_of_structure(
    bars: Sequence[OHLCVBar], swings: Sequence[SwingPoint]
) -> list[StructureBreak]:
    """A break of structure: a bar's close moves beyond the most recent
    prior swing high (bullish BOS) or swing low (bearish BOS). Each swing
    can only be broken once (the first close beyond it).
    """
    breaks: list[StructureBreak] = []
    broken_indices: set[int] = set()
    swings_by_index = sorted(swings, key=lambda s: s.bar_index)

    for i, bar in enumerate(bars):
        eligible = [s for s in swings_by_index if s.bar_index < i and s.bar_index not in broken_indices]
        for swing in eligible:
            if swing.kind == "high" and bar.close > swing.price:
                breaks.append(StructureBreak(bar_index=i, broken_swing=swing, direction="bullish"))
                broken_indices.add(swing.bar_index)
            elif swing.kind == "low" and bar.close < swing.price:
                breaks.append(StructureBreak(bar_index=i, broken_swing=swing, direction="bearish"))
                broken_indices.add(swing.bar_index)
    return breaks
