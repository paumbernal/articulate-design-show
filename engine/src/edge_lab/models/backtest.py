from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from edge_lab.config import InstrumentSymbol
from edge_lab.models.base import CamelModel
from edge_lab.models.enums import DayOfWeek, Direction, ExitReason, Session


class BacktestTrade(CamelModel):
    """One simulated occurrence of a setup, from trigger to exit."""

    id: str
    setup_id: str
    setup_version: int
    symbol: InstrumentSymbol
    direction: Direction
    edge_score_at_entry: float

    entry_bar_index: int = Field(ge=0)
    entry_timestamp: datetime
    entry_price: float
    stop_price: float
    target_price: float

    exit_bar_index: int = Field(ge=0)
    exit_timestamp: datetime
    exit_price: float
    exit_reason: ExitReason

    hold_bars: int = Field(ge=0)
    pnl_points: float
    pnl_r: float = Field(description="pnl_points / initial risk in points")
    mfe_points: float = Field(ge=0, description="Max favorable excursion")
    mae_points: float = Field(ge=0, description="Max adverse excursion")
    time_to_exit_bars: int = Field(ge=0)

    session: Session
    day_of_week: DayOfWeek
    hour_of_day: int = Field(
        ge=0, le=23, description="Entry hour, in the instrument's local exchange timezone"
    )

    costs_assumed_points: float = Field(
        ge=0, description="Slippage + fees assumed per trade, in points — always explicit, never hidden"
    )
    is_out_of_sample: bool


class BacktestConfigSnapshot(CamelModel):
    symbol: InstrumentSymbol
    date_range_start: datetime
    date_range_end: datetime
    session: Session | Literal["ANY"] = "ANY"
    setup_id: str
    setup_version: int
    min_edge_score: float
    entry_methodology: str
    stop_methodology: str
    target_methodology: str
    max_hold_bars: int
    costs_assumed_points: float
    out_of_sample_split: datetime | None = Field(
        default=None, description="Trades at/after this timestamp are treated as out-of-sample"
    )


class BreakdownRow(CamelModel):
    label: str
    n: int = Field(ge=0)
    win_rate: float | None = Field(default=None, ge=0, le=1)
    avg_r: float | None = None
    expectancy: float | None = None


class Breakdowns(CamelModel):
    by_time_of_day: list[BreakdownRow] = Field(default_factory=list)
    by_day_of_week: list[BreakdownRow] = Field(default_factory=list)
    by_session: list[BreakdownRow] = Field(default_factory=list)
    by_edge_score_bucket: list[BreakdownRow] = Field(default_factory=list)


class SignificanceResult(CamelModel):
    method: str = Field(description="e.g. 'one-sample two-sided t-test against zero mean R'")
    p_value: float | None = Field(default=None, ge=0, le=1)
    ci_low: float | None = None
    ci_high: float | None = None
    win_rate_ci_low: float | None = Field(default=None, ge=0, le=1)
    win_rate_ci_high: float | None = Field(default=None, ge=0, le=1)


class ValidationSummary(CamelModel):
    in_sample_n: int = Field(ge=0)
    out_of_sample_n: int = Field(ge=0)
    significance: SignificanceResult
    warnings: list[str] = Field(
        default_factory=list,
        description="Auto-populated caveats (small sample, look-ahead bias, unrealistic fills, etc.)",
    )


class BacktestStatistics(CamelModel):
    config: BacktestConfigSnapshot
    sample_size: int = Field(ge=0)
    win_rate: float | None = Field(default=None, ge=0, le=1)
    avg_return_points: float | None = None
    avg_r: float | None = None
    expectancy: float | None = None
    profit_factor: float | None = Field(default=None, ge=0)
    max_drawdown_points: float | None = Field(default=None, le=0)
    max_drawdown_r: float | None = Field(default=None, le=0)
    outcome_distribution: list[BreakdownRow] = Field(
        default_factory=list, description="Histogram buckets over pnl_r, reusing BreakdownRow as {label, n}"
    )
    avg_mfe_points: float | None = None
    avg_mae_points: float | None = None
    avg_time_to_target_bars: float | None = None
    avg_time_to_stop_bars: float | None = None
    breakdowns: Breakdowns
    validation: ValidationSummary
