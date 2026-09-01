"""Trading-day and RTH session-window calculations.

Assumption (documented, not hidden): trading days are Mon-Fri only. CME
holiday closures and early-close sessions are NOT modeled for the MVP — this
is a synthetic-data project, not a live trading calendar, and the omission
is listed in SYNTHETIC_DATA_ASSUMPTIONS.md.
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, date, datetime, timedelta
from typing import TYPE_CHECKING
from zoneinfo import ZoneInfo

from edge_lab.config import InstrumentSpec

if TYPE_CHECKING:
    from edge_lab.models import OHLCVBar


def is_trading_day(day: date) -> bool:
    return day.weekday() < 5  # Mon=0 .. Fri=4


def trading_days_between(start: date, end: date) -> list[date]:
    """Inclusive of both endpoints."""
    if end < start:
        raise ValueError("end must not be before start")
    days = []
    current = start
    while current <= end:
        if is_trading_day(current):
            days.append(current)
        current += timedelta(days=1)
    return days


def session_bounds_utc(trading_day: date, spec: InstrumentSpec) -> tuple[datetime, datetime]:
    """Return (session_open_utc, session_close_utc) for one RTH session."""
    tz = ZoneInfo(spec.timezone)
    start_hour, start_minute = (int(part) for part in spec.rth_start.split(":"))
    end_hour, end_minute = (int(part) for part in spec.rth_end.split(":"))
    local_open = datetime(
        trading_day.year, trading_day.month, trading_day.day, start_hour, start_minute, tzinfo=tz
    )
    local_close = datetime(
        trading_day.year, trading_day.month, trading_day.day, end_hour, end_minute, tzinfo=tz
    )
    return local_open.astimezone(UTC), local_close.astimezone(UTC)


def day_of_week_label(day: date) -> str:
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day.weekday()]


def session_index_groups(bars: Sequence[OHLCVBar]) -> list[tuple[int, int]]:
    """Contiguous (start, end_exclusive) bar-index ranges, one per calendar
    day present in `bars`.

    Safe for RTH-only synthetic data, where a session never crosses UTC
    midnight (CME RTH in America/Chicago always falls within one UTC day).
    """
    if not bars:
        return []
    groups: list[tuple[int, int]] = []
    start = 0
    current_day: date = bars[0].timestamp.date()
    for i in range(1, len(bars) + 1):
        if i == len(bars) or bars[i].timestamp.date() != current_day:
            groups.append((start, i))
            if i < len(bars):
                start = i
                current_day = bars[i].timestamp.date()
    return groups
