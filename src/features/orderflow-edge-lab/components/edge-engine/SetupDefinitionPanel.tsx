import { computeMaxScore, type SetupDefinition } from "../../types";

interface SetupDefinitionPanelProps {
  setup: SetupDefinition;
}

const SIGNAL_LABELS: Record<string, string> = {
  poc_sweep: "POC Sweep",
  absorption: "Absorption",
  delta_divergence: "Delta Divergence",
};

const SetupDefinitionPanel = ({ setup }: SetupDefinitionPanelProps) => {
  const maxScore = computeMaxScore(setup);

  return (
    <div className="border border-foreground/10 rounded-xl p-5 bg-foreground/[0.02]">
      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
        <div>
          <h3 className="font-mono font-bold text-base">{setup.name}</h3>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            v{setup.version} · min score {setup.minEdgeScoreDefault}/{maxScore}
          </p>
        </div>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed mb-4">{setup.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-4 font-mono text-[11px] text-text-muted">
        <div>
          entry <span className="text-foreground">{setup.entryMethodology}</span>
        </div>
        <div>
          stop <span className="text-foreground">{setup.stopMethodology}</span>
        </div>
        <div>
          target <span className="text-foreground">{setup.targetMethodology}</span>
        </div>
        <div>
          max hold <span className="text-foreground">{setup.maxHoldBars} bars</span>
        </div>
      </div>

      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-text-muted text-left">
            <th className="font-normal pb-2">Condition</th>
            <th className="font-normal pb-2">Weight</th>
            <th className="font-normal pb-2">Required</th>
            <th className="font-normal pb-2">Window</th>
          </tr>
        </thead>
        <tbody>
          {setup.rules.map((rule) => (
            <tr key={rule.signalType} className="border-t border-foreground/5">
              <td className="py-2">{SIGNAL_LABELS[rule.signalType] ?? rule.signalType}</td>
              <td className="py-2">+{rule.weight}</td>
              <td className="py-2">{rule.required ? "Yes" : "No"}</td>
              <td className="py-2 text-text-muted">
                {rule.sequenceWithinBars != null ? `≤${rule.sequenceWithinBars} bars prior` : "trigger bar"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SetupDefinitionPanel;
