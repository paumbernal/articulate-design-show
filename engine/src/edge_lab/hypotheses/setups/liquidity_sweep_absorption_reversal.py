"""The MVP's one complete research hypothesis: Liquidity Sweep + Absorption
Reversal.

The user-facing spec for this project describes six conceptual conditions
(sweep, aggressive volume, failure to continue, opposing absorption, delta
divergence, return inside range). This MVP implements three detectors that
together cover them: `liquidity_sweep` already requires elevated volume to
fire (covers conditions 1-2), `absorption` covers "opposing-side absorption
without price follow-through" (conditions 3-4), and `delta_divergence`
covers condition 5. Condition 6 ("price returns inside range") is not a
detected condition at all — it's evaluated by the backtest engine as the
trade's actual outcome, which is the honest place for it: whether price
reverts is exactly the thing being tested, not something to assume upfront.

Signals from the full spec (failed auction, value-area interaction,
higher-timeframe structure) are deliberately out of scope for this MVP setup
— see the project README's Future Work section.
"""

from __future__ import annotations

from edge_lab.models import SetupDefinition, WeightedRule

SETUP_ID = "liquidity-sweep-absorption-reversal"

# Because a WeightedRule's `sequence_within_bars` only looks BACKWARD from the
# trigger bar (see WeightedRule's docstring), the trigger must be anchored on
# whichever signal confirms the pattern LAST chronologically — here that's
# `absorption`, which the generator/detector design places on the bars
# following the sweep. Anchoring on the sweep bar itself would mean scoring
# before absorption/divergence could possibly have occurred (and, worse,
# would make entry_methodology="close_of_trigger_bar" enter the backtest
# before the pattern was actually confirmed — a look-ahead bug).
ANCHOR_SIGNAL_TYPE = "absorption"


def build_setup() -> SetupDefinition:
    return SetupDefinition(
        id=SETUP_ID,
        name="Liquidity Sweep + Absorption Reversal",
        description=(
            "Price sweeps a prior session's high or low on elevated volume, the "
            "opposing side absorbs the aggressive flow without price following "
            "through, and cumulative delta diverges from the new price extreme. "
            "Tests whether this combination has historically preceded a reversion "
            "back inside the prior range — not assumed to be profitable."
        ),
        version=1,
        rules=[
            WeightedRule(signal_type="liquidity_sweep", weight=35, required=True, sequence_within_bars=5),
            WeightedRule(signal_type="absorption", weight=35, required=True),
            WeightedRule(signal_type="delta_divergence", weight=30, sequence_within_bars=5),
        ],
        min_edge_score_default=70,
        entry_methodology="close_of_trigger_bar",
        stop_methodology="swept_level_plus_buffer",
        target_methodology="fixed_r_multiple",
        max_hold_bars=24,
    )
