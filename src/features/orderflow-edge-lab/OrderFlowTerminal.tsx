import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MethodologyDisclaimer from "./components/MethodologyDisclaimer";
import MarketDataPane from "./components/market-data/MarketDataPane";
import DetectedConditionsPane from "./components/detected-conditions/DetectedConditionsPane";
import EdgeEnginePane from "./components/edge-engine/EdgeEnginePane";
import ResearchResultsPane from "./components/research-results/ResearchResultsPane";
import type { InstrumentSymbol } from "./types";

const INSTRUMENT_OPTIONS: InstrumentSymbol[] = ["MES", "MNQ"];

const OrderFlowTerminal = () => {
  const [symbol, setSymbol] = useState<InstrumentSymbol>("MES");

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wide mb-1">Research Terminal</p>
          <h1 className="font-bold text-2xl">OrderFlow Edge Lab</h1>
        </div>
        <div className="flex gap-1 border border-foreground/10 rounded-lg p-1">
          {INSTRUMENT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSymbol(opt)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                symbol === opt ? "bg-foreground text-background" : "text-text-muted hover:text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <MethodologyDisclaimer />
      </div>

      <Tabs defaultValue="market-data">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="market-data" className="text-xs">
            Market Data
          </TabsTrigger>
          <TabsTrigger value="detected-conditions" className="text-xs">
            Detected Conditions
          </TabsTrigger>
          <TabsTrigger value="edge-engine" className="text-xs">
            Edge Engine
          </TabsTrigger>
          <TabsTrigger value="research-results" className="text-xs">
            Research Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market-data">
          <MarketDataPane symbol={symbol} />
        </TabsContent>
        <TabsContent value="detected-conditions">
          <DetectedConditionsPane symbol={symbol} />
        </TabsContent>
        <TabsContent value="edge-engine">
          <EdgeEnginePane symbol={symbol} />
        </TabsContent>
        <TabsContent value="research-results">
          <ResearchResultsPane symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderFlowTerminal;
