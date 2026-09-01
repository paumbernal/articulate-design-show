from __future__ import annotations

from datetime import date

from edge_lab.config import InstrumentSymbol
from edge_lab.data.synthetic_generator import GeneratorConfig, SyntheticDataset, generate_dataset
from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar
from edge_lab.models.enums import Timeframe


class SyntheticMarketDataProvider:
    """Implements MarketDataProvider using the synthetic generator.

    Datasets are cached per (symbol, timeframe, start, end) so repeated
    calls (e.g. bars then orderflow for the same range) don't regenerate.
    """

    is_synthetic = True

    def __init__(
        self,
        seed: int = 42,
        base_volume: float = 800.0,
        injection_rate: float = 0.6,
        negative_control_rate: float = 0.5,
    ) -> None:
        self._seed = seed
        self._base_volume = base_volume
        self._injection_rate = injection_rate
        self._negative_control_rate = negative_control_rate
        self._cache: dict[tuple, SyntheticDataset] = {}

    def get_dataset(
        self, symbol: InstrumentSymbol, timeframe: Timeframe, start: date, end: date
    ) -> SyntheticDataset:
        key = (symbol, timeframe, start, end)
        if key not in self._cache:
            config = GeneratorConfig(
                symbol=symbol,
                start_date=start,
                end_date=end,
                timeframe=timeframe,
                seed=self._seed,
                base_volume=self._base_volume,
                injection_rate=self._injection_rate,
                negative_control_rate=self._negative_control_rate,
            )
            self._cache[key] = generate_dataset(config)
        return self._cache[key]

    def get_bars(
        self, symbol: InstrumentSymbol, timeframe: Timeframe, start: date, end: date
    ) -> list[OHLCVBar]:
        return self.get_dataset(symbol, timeframe, start, end).bars

    def get_orderflow(
        self, symbol: InstrumentSymbol, timeframe: Timeframe, start: date, end: date
    ) -> list[SyntheticOrderFlowBar]:
        return self.get_dataset(symbol, timeframe, start, end).orderflow
