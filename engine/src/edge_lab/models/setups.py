from __future__ import annotations

from datetime import datetime

from pydantic import Field, model_validator

from edge_lab.config import InstrumentSymbol
from edge_lab.models.base import CamelModel
from edge_lab.models.enums import Direction, SignalType, Timeframe


class WeightedRule(CamelModel):
    """One condition contributing to a setup's Edge Score.

    The score is a configurable measure of how many predefined conditions
    are present — never a prediction of price. `weight` is points added to
    the Edge Score when `signal_type` is present within `sequence_within_bars`
    of the trigger bar (or on the trigger bar itself, if the field is None).
    """

    signal_type: SignalType
    weight: float = Field(gt=0, description="Points contributed to the Edge Score when this condition is met")
    required: bool = Field(
        default=False, description="If true, the setup cannot trigger at all when this condition is absent"
    )
    sequence_within_bars: int | None = Field(
        default=None,
        ge=0,
        description="Max bars before the trigger bar this may occur within; None = trigger bar only",
    )
    params: dict[str, float | int | str] = Field(default_factory=dict)


class SetupDefinition(CamelModel):
    """A named, versioned research hypothesis: a combination of weighted
    conditions plus the entry/exit methodology used to backtest it.

    `version` matters: it makes re-scoring historical detections reproducible
    when weights change later, rather than silently rewriting history.
    """

    id: str
    name: str
    description: str
    version: int = Field(ge=1, default=1)
    rules: list[WeightedRule] = Field(min_length=1)
    min_edge_score_default: float = Field(ge=0)
    entry_methodology: str = Field(description="e.g. 'close_of_trigger_bar', 'next_bar_open'")
    stop_methodology: str = Field(description="e.g. 'swept_level_plus_buffer', 'atr_multiple'")
    target_methodology: str = Field(description="e.g. 'fixed_r_multiple', 'opposing_value_area'")
    max_hold_bars: int = Field(gt=0)

    @property
    def max_score(self) -> float:
        return sum(rule.weight for rule in self.rules)

    @model_validator(mode="after")
    def _validate_default_within_range(self) -> SetupDefinition:
        if self.min_edge_score_default > self.max_score:
            raise ValueError(
                f"min_edge_score_default ({self.min_edge_score_default}) exceeds max_score ({self.max_score})"
            )
        return self


class ComponentScore(CamelModel):
    signal_type: SignalType
    weight: float
    present: bool
    contribution: float = Field(description="weight if present else 0")


class EdgeScoreResult(CamelModel):
    """The outcome of scoring one setup against one trigger bar's detected
    conditions. Deliberately carries no field implying prediction — the "not
    a price forecast" disclaimer is enforced in the UI layer, not here.
    """

    setup_id: str
    setup_version: int
    symbol: InstrumentSymbol
    timeframe: Timeframe
    trigger_bar_index: int = Field(ge=0)
    trigger_timestamp: datetime
    direction: Direction
    score: float = Field(ge=0)
    max_score: float = Field(gt=0)
    met_required_rules: bool
    component_scores: list[ComponentScore]
