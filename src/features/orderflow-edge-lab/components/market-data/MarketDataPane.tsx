import { useEffect, useMemo, useState } from "react";
import { useBars, useConditions } from "../../hooks/useOrderFlowData";
import { CHART_WINDOW } from "../../lib/dataWindow";
import { INSTRUMENTS } from "../../lib/instrumentSpecs";
import type { InstrumentSymbol } from "../../types";
import CandlestickChart from "./CandlestickChart";
import SessionSelector from "./SessionSelector";
import VolumeProfilePanel from "./VolumeProfilePanel";

interface MarketDataPaneProps {
  symbol: InstrumentSymbol;
}

type ProfileRange = "session" | "last5" | "full";

const MarketDataPane = ({ symbol }: MarketDataPaneProps) => {
  const spec = INSTRUMENTS[symbol];
  const query = useMemo(
    () => ({ symbol, timeframe: "5m" as const, start: CHART_WINDOW.start, end: CHART_WINDOW.end }),
    [symbol],
  );
  const { data: bars, isLoading: barsLoading } = useBars(query);
  const { data: conditions } = useConditions(query);

  const sessionDates = useMemo(() => {
    if (!bars) return [];
    return Array.from(new Set(bars.map((b) => b.timestamp.slice(0, 10)))).sort();
  }, [bars]);

  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [profileRange, setProfileRange] = useState<ProfileRange>("session");
  const [highlightPrice, setHighlightPrice] = useState<number | null>(null);

  useEffect(() => {
    if (sessionDates.length > 0 && selectedSession === null) {
      setSelectedSession(sessionDates[sessionDates.length - 1]);
    }
  }, [sessionDates, selectedSession]);

  const sessionBars = useMemo(() => {
    if (!bars || !selectedSession) return [];
    return bars.filter((b) => b.timestamp.startsWith(selectedSession));
  }, [bars, selectedSession]);

  const sessionConditions = useMemo(() => {
    if (!conditions || sessionBars.length === 0) return [];
    const indices = new Set(sessionBars.map((b) => b.barIndex));
    return conditions.filter((c) => indices.has(c.barIndex));
  }, [conditions, sessionBars]);

  const profileBars = useMemo(() => {
    if (!bars || !selectedSession) return [];
    if (profileRange === "full") return bars;
    if (profileRange === "session") return sessionBars;
    const idx = sessionDates.indexOf(selectedSession);
    const window = sessionDates.slice(Math.max(0, idx - 4), idx + 1);
    return bars.filter((b) => window.includes(b.timestamp.slice(0, 10)));
  }, [bars, sessionBars, sessionDates, selectedSession, profileRange]);

  if (barsLoading) {
    return <div className="p-8 text-text-muted text-sm font-mono">Loading market data…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wide text-text-muted">
            {spec.name} · {selectedSession ?? "N/A"}
          </h3>
        </div>
        {selectedSession && (
          <SessionSelector sessionDates={sessionDates} selected={selectedSession} onChange={setSelectedSession} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div className="border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02]">
          <CandlestickChart
            bars={sessionBars}
            conditions={sessionConditions}
            tickSize={spec.tickSize}
            timezone={spec.timezone}
            highlightPrice={highlightPrice}
          />
        </div>
        <div className="border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02] flex flex-col gap-3">
          <div className="flex gap-1">
            {(["session", "last5", "full"] as ProfileRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setProfileRange(r)}
                className={`font-mono text-[10px] uppercase px-2 py-1 rounded border transition-colors ${
                  profileRange === r
                    ? "border-foreground/40 text-foreground"
                    : "border-foreground/10 text-text-muted hover:text-foreground"
                }`}
              >
                {r === "session" ? "Session" : r === "last5" ? "5 Sessions" : "Full Range"}
              </button>
            ))}
          </div>
          <VolumeProfilePanel
            bars={profileBars}
            tickSize={spec.tickSize}
            height={360}
            onHoverPrice={setHighlightPrice}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketDataPane;
