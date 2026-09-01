from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query

from edge_lab.api.deps import get_provider
from edge_lab.config import InstrumentSymbol, get_instrument
from edge_lab.models import DetectedCondition
from edge_lab.models.enums import Timeframe
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

router = APIRouter(prefix="/api/conditions", tags=["conditions"])


@router.get("")
def get_conditions(
    symbol: Annotated[InstrumentSymbol, Query()],
    start: Annotated[date, Query()],
    end: Annotated[date, Query()],
    timeframe: Annotated[Timeframe, Query()] = "5m",
) -> list[DetectedCondition]:
    provider = get_provider()
    dataset = provider.get_dataset(symbol, timeframe, start, end)
    context = build_detection_context(dataset.bars, dataset.orderflow, get_instrument(symbol))
    return detect_all(dataset.bars, dataset.orderflow, context)
