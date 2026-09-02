from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter

from edge_lab.models.base import CamelModel

router = APIRouter(prefix="/api", tags=["meta"])

ASSUMPTIONS_PATH = Path(__file__).resolve().parents[4] / "SYNTHETIC_DATA_ASSUMPTIONS.md"

DISCLAIMER = (
    "All market data in this application is synthetically generated for methodology "
    "demonstration on this website. The real repository is private."
)


class MetaResponse(CamelModel):
    is_synthetic_data: bool
    disclaimer: str
    assumptions_markdown: str
    supported_symbols: list[str]


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/meta")
def get_meta() -> MetaResponse:
    assumptions = ASSUMPTIONS_PATH.read_text(encoding="utf-8") if ASSUMPTIONS_PATH.exists() else ""
    return MetaResponse(
        is_synthetic_data=True,
        disclaimer=DISCLAIMER,
        assumptions_markdown=assumptions,
        supported_symbols=["MES", "MNQ"],
    )
