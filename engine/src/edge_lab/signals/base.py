"""The signal-detector interface and shared detection context.

Every detector consumes the same precomputed `DetectionContext` (built once
per dataset by `build_detection_context`) rather than each recomputing
rolling features independently — this keeps the "signal" layer purely about
turning already-computed features into `DetectedCondition`s.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol

from edge_lab.config import InstrumentSpec
from edge_lab.data.session_calendar import session_index_groups
from edge_lab.features.market_structure import SwingPoint, find_swing_points
from edge_lab.features.orderflow_features import (
    delta_price_divergence,
    rolling_volume_average,
    volume_multiple,
)
from edge_lab.features.volume_profile import compute_volume_profile
from edge_lab.models import DetectedCondition, OHLCVBar, SyntheticOrderFlowBar
from edge_lab.models.enums import Direction


@dataclass(frozen=True)
class DetectionContext:
    spec: InstrumentSpec
    swing_points: list[SwingPoint]
    volume_avg: list[float]
    volume_mult: list[float]
    divergence: list[Direction | None]
    prior_session_poc: list[float | None]


def build_detection_context(
    bars: Sequence[OHLCVBar],
    orderflow: Sequence[SyntheticOrderFlowBar],
    spec: InstrumentSpec,
    swing_lookback: int = 3,
    volume_window: int = 20,
    divergence_lookback: int = 3,
) -> DetectionContext:
    prior_poc: list[float | None] = [None] * len(bars)
    groups = session_index_groups(bars)
    for group_idx, (start, end) in enumerate(groups):
        if group_idx == 0:
            continue
        prev_start, prev_end = groups[group_idx - 1]
        poc = compute_volume_profile(bars[prev_start:prev_end], spec.tick_size, bucket_ticks=4).poc
        for i in range(start, end):
            prior_poc[i] = poc

    return DetectionContext(
        spec=spec,
        swing_points=find_swing_points(bars, lookback=swing_lookback),
        volume_avg=rolling_volume_average(bars, window=volume_window),
        volume_mult=volume_multiple(bars, window=volume_window),
        divergence=delta_price_divergence(bars, orderflow, lookback=divergence_lookback),
        prior_session_poc=prior_poc,
    )


class SignalDetector(Protocol):
    signal_type: str

    def detect(
        self,
        bars: Sequence[OHLCVBar],
        orderflow: Sequence[SyntheticOrderFlowBar],
        context: DetectionContext,
    ) -> list[DetectedCondition]: ...
