import { useMemo, useState } from "react";
import { useBacktest, useSetups } from "../../hooks/useOrderFlowData";
import { BACKTEST_WINDOW } from "../../lib/dataWindow";
import type { InstrumentSymbol, Session } from "../../types";
import BacktestConfigForm from "./BacktestConfigForm";
import StatsSummaryGrid from "./StatsSummaryGrid";
import OutcomeDistributionChart from "./OutcomeDistributionChart";
import BreakdownTable from "./BreakdownTable";
import SignificancePanel from "./SignificancePanel";

interface ResearchResultsPaneProps {
  symbol: InstrumentSymbol;
}

const ResearchResultsPane = ({ symbol }: ResearchResultsPaneProps) => {
  const { data: setups } = useSetups();
  const setup = setups?.[0];

  const [minEdgeScore, setMinEdgeScore] = useState<number | null>(null);
  const [session, setSession] = useState<Session | "ANY">("ANY");

  const request = useMemo(() => {
    if (!setup) return null;
    return {
      symbol,
      timeframe: "5m" as const,
      start: BACKTEST_WINDOW.start,
      end: BACKTEST_WINDOW.end,
      setupId: setup.id,
      minEdgeScore: minEdgeScore ?? setup.minEdgeScoreDefault,
      session,
    };
  }, [setup, symbol, minEdgeScore, session]);

  const { data, isLoading, isFetching } = useBacktest(request);

  if (!setup || isLoading || !data) {
    return <div className="p-8 text-text-muted text-sm ">Running backtest…</div>;
  }

  const maxScore = setup.rules.reduce((sum, r) => sum + r.weight, 0);
  const { statistics } = data;

  return (
    <div className={`flex flex-col gap-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
      <p className="text-sm text-text-muted max-w-2xl">
        How {setup.name} actually performed between {BACKTEST_WINDOW.start} and {BACKTEST_WINDOW.end}.
      </p>

      <BacktestConfigForm
        minEdgeScore={minEdgeScore ?? setup.minEdgeScoreDefault}
        maxScore={maxScore}
        onMinEdgeScoreChange={setMinEdgeScore}
        session={session}
        onSessionChange={setSession}
      />

      <StatsSummaryGrid stats={statistics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02]">
          <h4 className="text-[10px] uppercase tracking-wide text-text-muted mb-2">
            Outcome Distribution (R multiples)
          </h4>
          <OutcomeDistributionChart rows={statistics.outcomeDistribution} />
        </div>
        <div className="border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02] flex flex-col gap-4">
          <BreakdownTable title="By Session" rows={statistics.breakdowns.bySession} />
          <BreakdownTable title="By Day of Week" rows={statistics.breakdowns.byDayOfWeek} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02]">
          <BreakdownTable title="By Time of Day" rows={statistics.breakdowns.byTimeOfDay} />
        </div>
        <div className="border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02]">
          <BreakdownTable title="By Edge Score Bucket" rows={statistics.breakdowns.byEdgeScoreBucket} />
        </div>
      </div>

      <SignificancePanel validation={statistics.validation} />

      {statistics.sampleSize === 0 && (
        <p className="text-text-muted text-sm text-center py-8">
          No trades match the current filters. Try lowering the minimum Edge Score.
        </p>
      )}
    </div>
  );
};

export default ResearchResultsPane;
