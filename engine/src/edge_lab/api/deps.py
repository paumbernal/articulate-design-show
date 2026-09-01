"""Shared, cached engine objects for the API layer — one synthetic
provider and one built setup per process, not per request.
"""

from __future__ import annotations

from functools import lru_cache

from edge_lab.data.synthetic_provider import SyntheticMarketDataProvider
from edge_lab.hypotheses.setups.liquidity_sweep_absorption_reversal import build_setup
from edge_lab.models import SetupDefinition


@lru_cache(maxsize=1)
def get_provider() -> SyntheticMarketDataProvider:
    return SyntheticMarketDataProvider(seed=42)


@lru_cache(maxsize=1)
def get_default_setup() -> SetupDefinition:
    return build_setup()


SETUPS: dict[str, SetupDefinition] = {}


def get_setup(setup_id: str) -> SetupDefinition:
    if not SETUPS:
        default = get_default_setup()
        SETUPS[default.id] = default
    if setup_id not in SETUPS:
        raise KeyError(f"Unknown setup_id: {setup_id!r}")
    return SETUPS[setup_id]


ANCHOR_SIGNAL_TYPES: dict[str, str] = {"liquidity-sweep-absorption-reversal": "absorption"}
