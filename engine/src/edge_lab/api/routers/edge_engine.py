from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from edge_lab.api.deps import ANCHOR_SIGNAL_TYPES, get_default_setup, get_provider, get_setup
from edge_lab.config import InstrumentSymbol, get_instrument
from edge_lab.hypotheses.edge_score import find_setup_triggers
from edge_lab.models import EdgeScoreResult, SetupDefinition
from edge_lab.models.enums import Timeframe
from edge_lab.signals.base import build_detection_context
from edge_lab.signals.registry import detect_all

router = APIRouter(prefix="/api", tags=["edge-engine"])


@router.get("/setups")
def list_setups() -> list[SetupDefinition]:
    return [get_default_setup()]


@router.get("/setups/{setup_id}/edge-scores")
def get_edge_scores(
    setup_id: str,
    symbol: Annotated[InstrumentSymbol, Query()],
    start: Annotated[date, Query()],
    end: Annotated[date, Query()],
    timeframe: Annotated[Timeframe, Query()] = "5m",
) -> list[EdgeScoreResult]:
    try:
        setup = get_setup(setup_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    provider = get_provider()
    dataset = provider.get_dataset(symbol, timeframe, start, end)
    context = build_detection_context(dataset.bars, dataset.orderflow, get_instrument(symbol))
    conditions = detect_all(dataset.bars, dataset.orderflow, context)
    anchor = ANCHOR_SIGNAL_TYPES.get(setup_id, setup.rules[0].signal_type)
    return find_setup_triggers(setup, anchor, conditions)
