"""Absorption: elevated volume with strong one-sided order flow, but the
bar makes little net price progress — the opposing side is absorbing the
aggressive flow rather than yielding to it.
"""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from edge_lab.features.orderflow_features import effort_vs_result
from edge_lab.models import DetectedCondition, OHLCVBar, SyntheticOrderFlowBar
from edge_lab.signals.base import DetectionContext

signal_type = "absorption"

VOLUME_MULTIPLE_THRESHOLD = 1.3
IMBALANCE_SKEW_THRESHOLD = 0.35  # |imbalance_ratio - 1| / (imbalance_ratio + 1), see _skew
EFFORT_RESULT_PERCENTILE_MULTIPLE = 1.5  # bar's effort/result vs the dataset's median


def _skew(imbalance_ratio: float) -> float:
    """Normalized 0..1 measure of how one-sided ask/bid volume is."""
    return abs(imbalance_ratio - 1) / (imbalance_ratio + 1)


def detect(
    bars: Sequence[OHLCVBar],
    orderflow: Sequence[SyntheticOrderFlowBar],
    context: DetectionContext,
) -> list[DetectedCondition]:
    if not bars:
        return []

    tick_size = context.spec.tick_size
    effort_scores = [effort_vs_result(b, tick_size) for b in bars]
    sorted_scores = sorted(effort_scores)
    median_effort = sorted_scores[len(sorted_scores) // 2]

    conditions: list[DetectedCondition] = []
    for i, bar in enumerate(bars):
        ob = orderflow[i]
        skew = _skew(ob.imbalance_ratio)
        if (
            context.volume_mult[i] >= VOLUME_MULTIPLE_THRESHOLD
            and skew >= IMBALANCE_SKEW_THRESHOLD
            and effort_scores[i] >= median_effort * EFFORT_RESULT_PERCENTILE_MULTIPLE
        ):
            # Aggressive selling (bid-heavy) absorbed without price falling -> bullish.
            # Aggressive buying (ask-heavy) absorbed without price rising -> bearish.
            direction = "bullish" if ob.imbalance_ratio < 1 else "bearish"
            conditions.append(
                DetectedCondition(
                    id=str(uuid.uuid4()),
                    symbol=bar.symbol,
                    timeframe=bar.timeframe,
                    bar_index=i,
                    timestamp=bar.timestamp,
                    signal_type=signal_type,
                    direction=direction,
                    strength=min(skew, 1.0),
                    evidence={
                        "imbalance_ratio": ob.imbalance_ratio,
                        "volume_multiple": context.volume_mult[i],
                        "effort_vs_result": effort_scores[i],
                    },
                )
            )
    return conditions
