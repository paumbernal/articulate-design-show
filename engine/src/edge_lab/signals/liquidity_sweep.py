"""Liquidity sweep: price pierces the prior session's high or low on
elevated volume. Fires once per approach — only the first bar where price
newly exceeds the level, not every subsequent bar that stays beyond it.
"""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from edge_lab.models import DetectedCondition, OHLCVBar, SyntheticOrderFlowBar
from edge_lab.signals.base import DetectionContext

signal_type = "liquidity_sweep"

VOLUME_MULTIPLE_THRESHOLD = 1.8


def detect(
    bars: Sequence[OHLCVBar],
    orderflow: Sequence[SyntheticOrderFlowBar],
    context: DetectionContext,
) -> list[DetectedCondition]:
    conditions: list[DetectedCondition] = []
    swept_low = False
    swept_high = False

    for i, bar in enumerate(bars):
        prior_low = context.prior_session_low[i]
        prior_high = context.prior_session_high[i]

        # Reset "already swept" state at the start of each new session
        # (prior_session_low/high changes when we cross into a new session).
        if i > 0 and context.prior_session_low[i] != context.prior_session_low[i - 1]:
            swept_low = False
            swept_high = False

        if (
            prior_low is not None
            and not swept_low
            and bar.low < prior_low
            and context.volume_mult[i] >= VOLUME_MULTIPLE_THRESHOLD
        ):
            swept_low = True
            conditions.append(
                DetectedCondition(
                    id=str(uuid.uuid4()),
                    symbol=bar.symbol,
                    timeframe=bar.timeframe,
                    bar_index=i,
                    timestamp=bar.timestamp,
                    signal_type=signal_type,
                    direction="bullish",
                    strength=min(context.volume_mult[i] / (VOLUME_MULTIPLE_THRESHOLD * 2), 1.0),
                    evidence={
                        "swept_level": prior_low,
                        "volume_multiple": context.volume_mult[i],
                        "pierce_ticks": (prior_low - bar.low) / context.spec.tick_size,
                    },
                )
            )

        if (
            prior_high is not None
            and not swept_high
            and bar.high > prior_high
            and context.volume_mult[i] >= VOLUME_MULTIPLE_THRESHOLD
        ):
            swept_high = True
            conditions.append(
                DetectedCondition(
                    id=str(uuid.uuid4()),
                    symbol=bar.symbol,
                    timeframe=bar.timeframe,
                    bar_index=i,
                    timestamp=bar.timestamp,
                    signal_type=signal_type,
                    direction="bearish",
                    strength=min(context.volume_mult[i] / (VOLUME_MULTIPLE_THRESHOLD * 2), 1.0),
                    evidence={
                        "swept_level": prior_high,
                        "volume_multiple": context.volume_mult[i],
                        "pierce_ticks": (bar.high - prior_high) / context.spec.tick_size,
                    },
                )
            )

    return conditions
