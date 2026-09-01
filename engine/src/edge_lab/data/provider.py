"""The market-data provider seam.

`MarketDataProvider` is the interface the rest of the engine (features,
signals, backtest) depends on. `SyntheticMarketDataProvider` is the only
implementation for the MVP. A future real-data provider (e.g. Databento's
CME MDP3 feed — see README) implements the same interface and can be
swapped in via configuration, without changing any downstream code.
"""

from __future__ import annotations

from datetime import date
from typing import Protocol

from edge_lab.config import InstrumentSymbol
from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar
from edge_lab.models.enums import Timeframe


class MarketDataProvider(Protocol):
    def get_bars(
        self, symbol: InstrumentSymbol, timeframe: Timeframe, start: date, end: date
    ) -> list[OHLCVBar]: ...

    def get_orderflow(
        self, symbol: InstrumentSymbol, timeframe: Timeframe, start: date, end: date
    ) -> list[SyntheticOrderFlowBar]: ...

    @property
    def is_synthetic(self) -> bool: ...
