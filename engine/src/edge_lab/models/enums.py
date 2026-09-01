"""Shared literal type aliases, kept as Literals (not Enum classes) so they
serialize to plain JSON strings and translate 1:1 into TypeScript union types.
"""

from __future__ import annotations

from typing import Literal

Timeframe = Literal["1m", "5m", "15m", "30m", "1h"]
Session = Literal["RTH", "ETH"]
Direction = Literal["bullish", "bearish"]
DayOfWeek = Literal["Mon", "Tue", "Wed", "Thu", "Fri"]

# Open string, not a closed Literal: the signal registry (signals/registry.py)
# is the source of truth for which values exist, so new detectors can be
# added without widening a type here.
SignalType = str

ExitReason = Literal["target", "stop", "max_hold_time", "session_close"]
