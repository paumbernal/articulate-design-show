from __future__ import annotations

from datetime import datetime

from pydantic import Field

from edge_lab.config import InstrumentSymbol
from edge_lab.models.base import CamelModel
from edge_lab.models.enums import Session, Timeframe


class OHLCVBar(CamelModel):
    """A single OHLCV price bar."""

    symbol: InstrumentSymbol
    timeframe: Timeframe
    timestamp: datetime = Field(description="Bar open time, UTC")
    open: float
    high: float
    low: float
    close: float
    volume: float = Field(ge=0)
    session: Session
    bar_index: int = Field(ge=0, description="Position within the dataset, 0-based")


class PriceLevelVolume(CamelModel):
    """Bid/ask volume synthesized at a single price level within a bar.

    Reserved for a future footprint-grid view — not rendered by the MVP UI,
    but included in the schema now so the model doesn't need reshaping later.
    """

    price: float
    bid_volume: float = Field(ge=0)
    ask_volume: float = Field(ge=0)


class SyntheticOrderFlowBar(CamelModel):
    """Per-bar aggregate order-flow features.

    This is deliberately bar-aggregated, not raw tick-by-tick — the MVP's
    synthetic generator produces bar-level bid/ask/delta directly rather than
    simulating individual trades, which keeps exported artifacts small while
    still supporting delta/imbalance/absorption-style feature detection.
    """

    symbol: InstrumentSymbol
    timeframe: Timeframe
    bar_index: int = Field(ge=0)
    bid_volume: float = Field(ge=0)
    ask_volume: float = Field(ge=0)
    delta: float = Field(description="ask_volume - bid_volume")
    cumulative_delta: float = Field(description="Running sum of delta up to and including this bar")
    aggressive_buy_volume: float = Field(ge=0)
    aggressive_sell_volume: float = Field(ge=0)
    imbalance_ratio: float = Field(
        description="ask_volume / bid_volume, clamped and signed; >1 = ask-heavy, <1 = bid-heavy"
    )
    price_levels: list[PriceLevelVolume] | None = Field(
        default=None, description="Reserved for future footprint-grid rendering"
    )
