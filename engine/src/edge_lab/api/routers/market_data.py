from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query

from edge_lab.api.deps import get_provider
from edge_lab.config import InstrumentSymbol
from edge_lab.models import OHLCVBar, SyntheticOrderFlowBar
from edge_lab.models.enums import Timeframe

router = APIRouter(prefix="/api/market-data", tags=["market-data"])


@router.get("/bars")
def get_bars(
    symbol: Annotated[InstrumentSymbol, Query()],
    start: Annotated[date, Query()],
    end: Annotated[date, Query()],
    timeframe: Annotated[Timeframe, Query()] = "5m",
) -> list[OHLCVBar]:
    return get_provider().get_bars(symbol, timeframe, start, end)


@router.get("/orderflow")
def get_orderflow(
    symbol: Annotated[InstrumentSymbol, Query()],
    start: Annotated[date, Query()],
    end: Annotated[date, Query()],
    timeframe: Annotated[Timeframe, Query()] = "5m",
) -> list[SyntheticOrderFlowBar]:
    return get_provider().get_orderflow(symbol, timeframe, start, end)
