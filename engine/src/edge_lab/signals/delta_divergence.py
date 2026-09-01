"""Delta divergence: price makes a new local extreme that cumulative delta
does not confirm. Thin wrapper around the precomputed context — see
edge_lab.features.orderflow_features.delta_price_divergence for the logic.
"""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from edge_lab.models import DetectedCondition, OHLCVBar, SyntheticOrderFlowBar
from edge_lab.signals.base import DetectionContext

signal_type = "delta_divergence"


def detect(
    bars: Sequence[OHLCVBar],
    orderflow: Sequence[SyntheticOrderFlowBar],
    context: DetectionContext,
) -> list[DetectedCondition]:
    conditions: list[DetectedCondition] = []
    for i, direction in enumerate(context.divergence):
        if direction is None:
            continue
        bar = bars[i]
        conditions.append(
            DetectedCondition(
                id=str(uuid.uuid4()),
                symbol=bar.symbol,
                timeframe=bar.timeframe,
                bar_index=i,
                timestamp=bar.timestamp,
                signal_type=signal_type,
                direction=direction,
                strength=0.6,
                evidence={"cumulative_delta": orderflow[i].cumulative_delta},
            )
        )
    return conditions
