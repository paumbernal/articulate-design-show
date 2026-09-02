from __future__ import annotations

from datetime import datetime

from pydantic import Field

from edge_lab.config import InstrumentSymbol
from edge_lab.models.base import CamelModel
from edge_lab.models.enums import Direction, SignalType, Timeframe


class DetectedCondition(CamelModel):
    """One instance of a signal detector firing on a specific bar.

    This is the "what we detected" layer — a raw, pre-hypothesis observation.
    Whether a condition matters is decided later by a SetupDefinition's
    weighted rules, not by the detector itself.
    """

    id: str
    symbol: InstrumentSymbol
    timeframe: Timeframe
    bar_index: int = Field(ge=0)
    timestamp: datetime
    signal_type: SignalType = Field(
        description="Key into the signal registry, e.g. 'poc_sweep', 'absorption'"
    )
    direction: Direction
    strength: float = Field(
        ge=0, le=1, description="Detector's own confidence, independent of Edge Score weight"
    )
    evidence: dict[str, float | int | str] = Field(
        default_factory=dict,
        description="Structured explanation, e.g. {'swept_level': 4512.25, 'volume_multiple': 3.1}",
    )
