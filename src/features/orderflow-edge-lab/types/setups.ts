import type { Direction, InstrumentSymbol, SignalType, Timeframe } from "./common";

/** Mirrors engine/src/edge_lab/models/setups.py::WeightedRule */
export interface WeightedRule {
  signalType: SignalType;
  /** Points contributed to the Edge Score when this condition is met */
  weight: number;
  /** If true, the setup cannot trigger at all when this condition is absent */
  required: boolean;
  /** Max bars before the trigger bar this may occur within; null = trigger bar only */
  sequenceWithinBars?: number | null;
  params: Record<string, number | string>;
}

/**
 * Mirrors engine/src/edge_lab/models/setups.py::SetupDefinition.
 * `maxScore` is NOT sent over the wire (it's a derived Python `@property`) —
 * use {@link computeMaxScore} to derive it here too, so both sides compute
 * it the same way rather than trusting a duplicated stored value.
 */
export interface SetupDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  rules: WeightedRule[];
  minEdgeScoreDefault: number;
  entryMethodology: string;
  stopMethodology: string;
  targetMethodology: string;
  maxHoldBars: number;
}

export function computeMaxScore(setup: Pick<SetupDefinition, "rules">): number {
  return setup.rules.reduce((sum, rule) => sum + rule.weight, 0);
}

/** Mirrors engine/src/edge_lab/models/setups.py::ComponentScore */
export interface ComponentScore {
  signalType: SignalType;
  weight: number;
  present: boolean;
  contribution: number;
}

/**
 * Mirrors engine/src/edge_lab/models/setups.py::EdgeScoreResult.
 * Deliberately carries no field implying prediction — render this only
 * alongside the persistent "not a price forecast" disclaimer.
 */
export interface EdgeScoreResult {
  setupId: string;
  setupVersion: number;
  symbol: InstrumentSymbol;
  timeframe: Timeframe;
  triggerBarIndex: number;
  /** ISO 8601, UTC */
  triggerTimestamp: string;
  direction: Direction;
  score: number;
  maxScore: number;
  metRequiredRules: boolean;
  componentScores: ComponentScore[];
}
