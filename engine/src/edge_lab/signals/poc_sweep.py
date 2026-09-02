"""POC sweep: price pierces through the prior session's point of control
(the price level where the most volume traded) and reclaims it within the
same bar, on elevated volume. POC is a resting-liquidity magnet, not a
range extreme, so unlike a session-high/low sweep this fires on a
pierce-and-reclaim rather than "makes a new extreme" — fires once per
approach, only the first bar that qualifies, not every bar that follows.
"""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from edge_lab.models import DetectedCondition, OHLCVBar, SyntheticOrderFlowBar
from edge_lab.signals.base import DetectionContext

signal_type = "poc_sweep"

VOLUME_MULTIPLE_THRESHOLD = 1.8


def detect(
    bars: Sequence[OHLCVBar],
    orderflow: Sequence[SyntheticOrderFlowBar],
    context: DetectionContext,
) -> list[DetectedCondition]:
    conditions: list[DetectedCondition] = []
    swept_from_below = False
    swept_from_above = False

    for i, bar in enumerate(bars):
        poc = context.prior_session_poc[i]

        # Reset "already swept" state at the start of each new session
        # (prior_session_poc changes when we cross into a new session).
        if i > 0 and context.prior_session_poc[i] != context.prior_session_poc[i - 1]:
            swept_from_below = False
            swept_from_above = False

        if poc is None or context.volume_mult[i] < VOLUME_MULTIPLE_THRESHOLD:
            continue

        if not swept_from_below and bar.low < poc <= bar.close:
            swept_from_below = True
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
                        "swept_level": poc,
                        "volume_multiple": context.volume_mult[i],
                        "pierce_ticks": (poc - bar.low) / context.spec.tick_size,
                    },
                )
            )

        if not swept_from_above and bar.high > poc >= bar.close:
            swept_from_above = True
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
                        "swept_level": poc,
                        "volume_multiple": context.volume_mult[i],
                        "pierce_ticks": (bar.high - poc) / context.spec.tick_size,
                    },
                )
            )

    return conditions
