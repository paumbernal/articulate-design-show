import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useEdgeScores, useSetups } from "../../hooks/useOrderFlowData";
import { CHART_WINDOW } from "../../lib/dataWindow";
import { INSTRUMENTS } from "../../lib/instrumentSpecs";
import { formatDate, formatTime } from "../../lib/formatters";
import type { InstrumentSymbol } from "../../types";
import EdgeScoreBadge from "./EdgeScoreBadge";
import SetupDefinitionPanel from "./SetupDefinitionPanel";

interface EdgeEnginePaneProps {
  symbol: InstrumentSymbol;
}

const EdgeEnginePane = ({ symbol }: EdgeEnginePaneProps) => {
  const spec = INSTRUMENTS[symbol];
  const { data: setups, isLoading: setupsLoading } = useSetups();
  const setup = setups?.[0];

  const query = useMemo(
    () => ({ symbol, timeframe: "5m" as const, start: CHART_WINDOW.start, end: CHART_WINDOW.end }),
    [symbol],
  );
  const { data: scores, isLoading: scoresLoading } = useEdgeScores(setup?.id ?? "", query);

  const sortedScores = useMemo(
    () => [...(scores ?? [])].sort((a, b) => b.triggerTimestamp.localeCompare(a.triggerTimestamp)),
    [scores],
  );

  if (setupsLoading || !setup) {
    return <div className="p-8 text-text-muted text-sm font-mono">Loading setup definition…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted max-w-2xl">
        Which predefined setup conditions are currently satisfied — the Edge Score is a configurable count of
        those conditions, not a prediction. Whether a high score has actually meant anything historically is
        answered in Research Results, not here.
      </p>

      <SetupDefinitionPanel setup={setup} />

      <h3 className="font-mono text-xs uppercase tracking-wide text-text-muted mt-2">
        Scored triggers — {spec.name}, last six weeks
      </h3>

      {scoresLoading ? (
        <div className="text-text-muted text-sm font-mono">Loading edge scores…</div>
      ) : (
        <div className="flex flex-col divide-y divide-foreground/5 border border-foreground/10 rounded-xl overflow-hidden">
          {sortedScores.slice(0, 100).map((s) => (
            <div key={`${s.setupId}-${s.triggerBarIndex}`} className="flex items-center justify-between gap-4 p-4 flex-wrap">
              <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <Badge variant={s.direction === "bullish" ? "default" : "destructive"} className="font-mono text-[10px]">
                    {s.direction}
                  </Badge>
                  {s.metRequiredRules ? (
                    <span className="font-mono text-[10px] text-emerald-500">confirmed</span>
                  ) : (
                    <span className="font-mono text-[10px] text-text-faded">incomplete</span>
                  )}
                </div>
                <span className="font-mono text-xs text-text-muted">
                  {formatDate(s.triggerTimestamp, spec.timezone)} {formatTime(s.triggerTimestamp, spec.timezone)}
                </span>
              </div>
              <EdgeScoreBadge score={s.score} maxScore={s.maxScore} componentScores={s.componentScores} />
            </div>
          ))}
          {sortedScores.length === 0 && (
            <p className="text-text-muted text-sm font-mono text-center py-8">
              No anchor signal occurrences in the selected range.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EdgeEnginePane;
