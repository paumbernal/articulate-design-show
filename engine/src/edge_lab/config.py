"""Instrument specifications and session-calendar constants.

Values are the standard CME Globex contract specs for the two supported
micro futures. RTH (regular trading hours) is approximated as the window
aligned with the NYSE cash session (08:30-15:00 America/Chicago) — CME
equity index futures actually trade nearly 24 hours, but RTH is what
matters for session-relative concepts like "previous session high/low".
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

InstrumentSymbol = Literal["MES", "MNQ"]


@dataclass(frozen=True)
class InstrumentSpec:
    symbol: InstrumentSymbol
    name: str
    exchange: str
    tick_size: float
    tick_value_usd: float
    point_value_usd: float
    timezone: str
    rth_start: str  # "HH:MM" in `timezone`
    rth_end: str  # "HH:MM" in `timezone`


INSTRUMENTS: dict[InstrumentSymbol, InstrumentSpec] = {
    "MES": InstrumentSpec(
        symbol="MES",
        name="Micro E-mini S&P 500",
        exchange="CME",
        tick_size=0.25,
        tick_value_usd=1.25,
        point_value_usd=5.00,
        timezone="America/Chicago",
        rth_start="08:30",
        rth_end="15:00",
    ),
    "MNQ": InstrumentSpec(
        symbol="MNQ",
        name="Micro E-mini Nasdaq-100",
        exchange="CME",
        tick_size=0.25,
        tick_value_usd=0.50,
        point_value_usd=2.00,
        timezone="America/Chicago",
        rth_start="08:30",
        rth_end="15:00",
    ),
}


def get_instrument(symbol: str) -> InstrumentSpec:
    try:
        return INSTRUMENTS[symbol]  # type: ignore[index]
    except KeyError as exc:
        raise ValueError(f"Unknown instrument symbol: {symbol!r}") from exc
