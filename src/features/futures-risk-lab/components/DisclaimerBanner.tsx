import { AlertTriangle } from "lucide-react";

const SENTENCES = [
  "Model-based risk estimation, not investment advice or a live P&L track record.",
  "Output is conditional on the specified return distribution and excludes transaction costs and regime shifts.",
];

const DisclaimerBanner = () => {
  return (
    <div className="flex items-start gap-2 border border-amber-500/25 bg-amber-500/[0.06] rounded-lg px-3 py-2 text-[11px] text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <div className="flex flex-col">
        {SENTENCES.map((sentence) => (
          <span key={sentence}>{sentence}</span>
        ))}
      </div>
    </div>
  );
};

export default DisclaimerBanner;
