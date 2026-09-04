import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "monte-carlo",
    title: "Monte Carlo Simulation",
    body: (
      <>
        <p>
          Monte Carlo simulation approximates the range of outcomes a process could produce by running it many times
          with randomized inputs, then looking at the distribution of results. Here, "the process" is a sequence of
          trades. Each simulated path draws a random outcome for every trade from the trade-return distribution below,
          accumulates them into an equity curve, and records where that curve ended up and how far it dropped along
          the way. Running thousands of independent paths turns "what might happen" into a distribution that can
          actually be measured: percentiles, tail losses, probabilities of hitting a target or a floor.
        </p>
        <p className="mt-2">
          No single path is "the forecast." The value is in the shape of the distribution across all of them.
        </p>
      </>
    ),
  },
  {
    id: "trade-distribution",
    title: "Trade-Return Distributions & R-Multiples",
    body: (
      <>
        <p>
          An "R" is one unit of risk: the dollar amount risked on a single trade (the distance from entry to stop,
          sized in dollars). Expressing outcomes in R multiples (+1.2R, -1R) instead of raw dollars makes a strategy's
          edge comparable across different account sizes and position sizes.
        </p>
        <p className="mt-2">
          Rather than modeling every win as exactly the stated average and every loss as exactly its average, the
          synthetic model draws each side from a Gamma distribution whose mean is pinned to the requested average.
          Winners default to a lower shape parameter, meaning more spread and a right-skewed tail, since the
          occasional trade runs well past "average." Losers default to a higher shape parameter, so they stay tighter
          and closer to the same size each time, since a hard stop caps most losses with only modest variation from
          slippage. Both shape parameters are adjustable. That means two runs with the same win rate and averages
          still produce different-looking equity curves, which is the point: real trading results are noisy even
          when the underlying edge is constant.
        </p>
      </>
    ),
  },
  {
    id: "expectancy",
    title: "Win Rate & Expected Value",
    body: (
      <p>
        Expected value per trade = (win rate × average win) − (loss rate × average loss). For the default MNQ
        assumptions: 0.59 × 1.2R − 0.41 × 1.0R = 0.298R, or about +$59.60 per trade at $200 risk per trade. This is a
        closed-form number that doesn't depend on simulation noise at all. The simulated mean should converge to it
        as the number of simulations grows, which is one of the sanity checks this project's test suite runs.
      </p>
    ),
  },
  {
    id: "var",
    title: "Value-at-Risk (VaR)",
    body: (
      <>
        <p>
          VaR answers: "at a given confidence level, what's the most I'd expect to lose?" A 95% VaR of $2,000 means 95%
          of simulated outcomes lost no more than $2,000 (equivalently, the worst 5% of outcomes lost more than that).
        </p>
        <p className="mt-2">
          It's computed here as a percentile of the simulated terminal profit/loss distribution: run the Monte Carlo
          simulation, compute ending P&L for every path, sort it, and take the value at the (1 − confidence)
          percentile. This is the standard "historical/simulation method" for VaR, applied to simulated outcomes
          instead of a historical return series.
        </p>
        <p className="mt-2 text-amber-600 dark:text-amber-400">
          Important: VaR describes a threshold, not the shape of the losses beyond it. Two distributions can share the
          same VaR while one has a much worse tail. That's what Expected Shortfall is for.
        </p>
      </>
    ),
  },
  {
    id: "cvar",
    title: "Expected Shortfall (CVaR)",
    body: (
      <p>
        Conditional VaR (also called Expected Shortfall) is the average loss among only the outcomes at least as bad as
        VaR. Where VaR marks the edge of the bad tail, CVaR describes what's typical inside it. It's always at least as
        severe as VaR at the same confidence level, and is generally considered the more complete tail-risk measure
        because it accounts for the magnitude of extreme losses, not just their frequency.
      </p>
    ),
  },
  {
    id: "drawdown",
    title: "Maximum Drawdown",
    body: (
      <p>
        For a single equity path, maximum drawdown is the largest peak-to-trough decline expressed as a percentage of
        the peak: track the running high-water mark as the balance moves, and record the worst (balance − peak) / peak
        seen at any point. Every simulated path has its own max drawdown; the dashboard reports the distribution of
        those (median, percentiles, worst case) rather than a single number, since drawdown severity varies a lot
        between otherwise-identical paths just from the order trades happen to land in.
      </p>
    ),
  },
  {
    id: "risk-of-ruin",
    title: "Risk of Ruin",
    body: (
      <p>
        Risk of ruin is the fraction of simulated paths whose balance falls to or below a defined floor{" "}
        <em>at any point</em> during the simulated horizon, not just at the end. The floor is defined as a percentage
        of the starting balance (adjustable in the dashboard). This is deliberately a path-dependent statistic: a
        strategy can have a solidly positive expectancy and still carry meaningful risk of a deep intra-sequence
        drawdown, especially over a losing streak early in the sequence before the edge has had time to play out.
      </p>
    ),
  },
  {
    id: "percentiles",
    title: "Monte Carlo Percentiles",
    body: (
      <p>
        A percentile answers "what value falls below this fraction of outcomes?" The 5th percentile of terminal
        balances is the value only 5% of simulated paths ended below; the 95th percentile is the value only 5% ended
        above. Percentiles are computed with linear interpolation between the two nearest ranked observations (the
        same convention numpy uses), which is standard and avoids picking an arbitrary single observation when the
        exact rank falls between two data points.
      </p>
    ),
  },
  {
    id: "synthetic-vs-empirical",
    title: "Synthetic vs. Empirical Distributions",
    body: (
      <>
        <p>
          <strong>Synthetic mode</strong> generates trade outcomes from the win rate / average win / average loss
          assumptions entered in the parameter panel, using the Gamma-distribution model described above. It's useful
          for exploring "what would this kind of edge look like over many trades," whether or not you have a
          verified track record yet.
        </p>
        <p className="mt-2">
          <strong>Historical/Empirical mode</strong> uses an uploaded CSV of actual trades instead. Each simulated
          trade bootstrap-samples (draws with replacement) an R multiple from the uploaded dataset, so the simulation
          reflects the actual shape of a real trade distribution, including any skew, fat tails, or clustering the
          synthetic Gamma model wouldn't capture. The tradeoff: with a small sample of historical trades, bootstrap
          resampling can't manufacture outcomes the strategy has never actually produced, and reusing a short history
          many times will understate how different a true continuation could look.
        </p>
      </>
    ),
  },
];

const MethodologyPanel = () => {
  return (
    <div className="border border-foreground/10 rounded-xl p-4 md:p-5 bg-foreground/[0.02]">
      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Methodology</p>
      <p className="text-sm text-foreground/60 mb-4">
        What every number on this dashboard means and how it's computed. See the project README for the full
        write-up.
      </p>
      <Accordion type="multiple" className="w-full">
        {SECTIONS.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="border-foreground/10">
            <AccordionTrigger className="text-sm text-left hover:no-underline">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/70 leading-relaxed">{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default MethodologyPanel;
