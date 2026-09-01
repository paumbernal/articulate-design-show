"""The signal registry: the single place new detectors get wired in.

`SetupDefinition.rules[].signal_type` is validated against this registry's
keys, not a closed enum — adding a new detector means adding one entry here
and nowhere else.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence

from edge_lab.models import DetectedCondition, OHLCVBar, SyntheticOrderFlowBar
from edge_lab.signals import absorption, delta_divergence, liquidity_sweep
from edge_lab.signals.base import DetectionContext

DetectFn = Callable[
    [Sequence[OHLCVBar], Sequence[SyntheticOrderFlowBar], DetectionContext], list[DetectedCondition]
]

REGISTRY: dict[str, DetectFn] = {
    liquidity_sweep.signal_type: liquidity_sweep.detect,
    absorption.signal_type: absorption.detect,
    delta_divergence.signal_type: delta_divergence.detect,
}


def detect_all(
    bars: Sequence[OHLCVBar],
    orderflow: Sequence[SyntheticOrderFlowBar],
    context: DetectionContext,
) -> list[DetectedCondition]:
    conditions: list[DetectedCondition] = []
    for detect_fn in REGISTRY.values():
        conditions.extend(detect_fn(bars, orderflow, context))
    return sorted(conditions, key=lambda c: c.bar_index)
