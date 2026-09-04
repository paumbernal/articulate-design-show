import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Github, ArrowUpRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import NeonBorder from "@/components/ui/neon-border";

type Project = {
  slug: string;
  status: string;
  title: ReactNode;
  oneLiner?: string;
  blurb?: string;
  tech: string[];
  github?: string;
  live?: string;
  visual: "story" | "concept";
  compact?: boolean;
  buildStoryUrl?: string;
  storyButtonLabel?: string;
  codeSnippet?: string;
};

const projects: Project[] = [
  {
    slug: "/monte-carlo-var-simulation",
    status: "Built",
    title: (
      <>
        Monte Carlo <span className="normal-case">VaR</span> Simulation
      </>
    ),
    tech: ["TypeScript", "React", "Monte Carlo", "VaR", "CVaR", "Recharts"],
    github: "https://github.com/paumbernal/monte-carlo-var-simulation",
    visual: "story",
    compact: true,
    buildStoryUrl: "/monte-carlo-var-simulation",
    storyButtonLabel: "Open Dashboard",
    codeSnippet: `export function computeVaR(
  terminalBalances: ArrayLike<number>,
  startingBalance: number,
  confidence: number,
): number {
  const pnl = Array.from(terminalBalances, (b) => b - startingBalance);
  const tailPercentile = (1 - confidence) * 100;
  return -percentile(pnl, tailPercentile);
}`,
  },
  {
    slug: "/orderflow",
    status: "In Development",
    title: "ORDERFLOW EDGE LAB",
    tech: ["Python", "FastAPI", "React", "TypeScript", "pydantic", "scipy"],
    github: "https://github.com/paumbernal/OrderFlow-Edge-Lab",
    visual: "story",
    compact: true,
    buildStoryUrl: "/orderflow",
    storyButtonLabel: "Open Terminal",
  },
];

const codeSnippet = `class SetupDefinition(CamelModel):
    """A named, versioned research hypothesis."""

    id: str
    rules: list[WeightedRule]
    min_edge_score_default: float
    entry_methodology: str
    stop_methodology: str
    target_methodology: str

    @property
    def max_score(self) -> float:
        return sum(rule.weight for rule in self.rules)

    def evaluate(self, bar: OHLCVBar) -> EdgeScoreResult:
        conditions = detect_conditions(bar, self.rules)
        score = sum(r.weight for r in conditions)
        return EdgeScoreResult(score=score, max_score=self.max_score)`;

const ProjectsTitle = () => (
  <h1 className="font-display text-center text-[13vw] sm:text-6xl md:text-7xl leading-none">Projects</h1>
);

const Projects = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-accent-green/20 blur-[120px]" />
        <div className="absolute top-[28%] -right-40 w-[30rem] h-[30rem] rounded-full bg-foreground/10 blur-[120px]" />
        <div className="absolute top-[62%] left-[8%] w-[26rem] h-[26rem] rounded-full bg-accent-green/10 blur-[120px]" />
      </div>

      <Navigation />
      <div className="max-w-5xl mx-auto px-8 pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-20">
            <ProjectsTitle />
          </div>
        </motion.div>

        <div className="flex flex-col gap-8">
          {projects.map((project, index) => {
            const textContent = (
              <>
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono text-xs uppercase tracking-wide text-text-muted border border-foreground/15 bg-foreground/5 backdrop-blur-sm rounded-full px-3 py-1">
                      {project.status}
                    </span>
                  </div>

                  <h2 className={`font-display text-3xl md:text-4xl leading-[0.95] ${project.compact ? "mb-5" : "mb-4"}`}>
                    {project.title}
                  </h2>

                  {project.oneLiner && (
                    <p className="text-lg text-foreground/90 leading-relaxed mb-4">{project.oneLiner}</p>
                  )}

                  {project.blurb && (
                    <p className="text-base text-foreground/60 leading-relaxed mb-6">{project.blurb}</p>
                  )}

                  {project.tech.length > 0 && (
                    <div className={`flex flex-wrap gap-2 ${project.compact ? "mb-5" : "mb-8"}`}>
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-xs text-text-muted border border-foreground/10 bg-foreground/5 backdrop-blur-sm rounded-full px-3 py-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-5 font-mono text-sm">
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-foreground md:hover:text-text-muted transition-colors duration-200"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-text-faded">
                      <Github className="w-4 h-4" />
                      repo coming soon
                    </span>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-foreground md:hover:text-text-muted transition-colors duration-200"
                    >
                      Live Demo
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 text-text-muted md:group-hover:text-foreground md:group-hover:translate-x-1 transition-all duration-300">
                    Read more
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </>
            );

            return (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-[28px] md:hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative rounded-[28px] border border-foreground/10 bg-foreground/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.15),0_8px_40px_-16px_rgba(0,0,0,0.25)] md:hover:border-foreground/20 md:hover:bg-foreground/[0.05] transition-colors duration-300 overflow-hidden">
                {/* Glass sheen */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.08] via-transparent to-transparent" />

                <div
                  role="link"
                  tabIndex={0}
                  aria-label={`View project: ${typeof project.title === "string" ? project.title : project.slug.replace(/^\//, "")}`}
                  onClick={() => navigate(project.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(project.slug);
                    }
                  }}
                  className="relative grid md:grid-cols-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green"
                >
                  {/* Text side */}
                  <div className={`${project.compact ? "p-6 md:p-8" : "p-8 md:p-10"} flex flex-col justify-between`}>
                    {textContent}
                  </div>

                  {/* Visual side */}
                  {project.visual === "story" && project.buildStoryUrl ? (
                    <div
                      className={`relative flex items-center justify-center overflow-hidden ${
                        project.compact ? "p-6 min-h-[160px]" : "p-8 min-h-[240px]"
                      }`}
                    >
                      <pre className="absolute inset-0 flex items-center justify-center font-mono text-[10px] md:text-[11px] leading-relaxed text-text-muted/20 overflow-hidden whitespace-pre-wrap px-6 pointer-events-none select-none">
                        <code>{project.codeSnippet ?? codeSnippet}</code>
                      </pre>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(project.buildStoryUrl!);
                        }}
                        className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-[rgba(10,10,10,0.85)] px-5 py-2.5 font-mono text-sm text-white transition-colors md:hover:bg-black"
                      >
                        {project.storyButtonLabel ?? "How I Built It"}
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-t md:border-t-0 md:border-l border-foreground/10 bg-foreground/[0.02] flex items-center justify-center ${
                        project.compact ? "p-6 min-h-[160px]" : "p-8 min-h-[240px]"
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-mono text-xs uppercase tracking-wide text-text-faded border border-dashed border-foreground/15 rounded-xl px-6 py-8 backdrop-blur-sm">
                          In planning — no build yet
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                </div>

                <div className="hidden md:block">
                  <NeonBorder
                    style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}
                    color="#CC9149"
                    rounded={14}
                    thickness={2}
                    borderSize={28}
                    glow={60}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Projects;
