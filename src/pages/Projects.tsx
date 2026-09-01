import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, ArrowUpRight } from "lucide-react";
import Navigation from "@/components/Navigation";

type Project = {
  slug: string;
  status: string;
  title: string;
  oneLiner: string;
  blurb: string;
  tech: string[];
  github?: string;
  live?: string;
  visual: "code" | "concept";
};

const projects: Project[] = [
  {
    slug: "/orderflow",
    status: "In Development",
    title: "ORDERFLOW EDGE LAB",
    oneLiner: "A research platform testing whether order-flow patterns in futures actually predict anything.",
    blurb:
      "A Python research engine (synthetic data generation, signal detection, a weighted Edge Score, and a backtesting/statistics engine with in-sample/out-of-sample validation) behind a React research terminal. The question it's built to answer honestly: does a given combination of order-flow conditions carry real historical signal, or just look convincing?",
    tech: ["Python", "FastAPI", "React", "TypeScript", "pydantic", "scipy"],
    github: "https://github.com/paumbernal/articulate-design-show/tree/main/engine",
    visual: "code",
  },
  {
    slug: "/optionsflow",
    status: "Concept",
    title: "OPTIONSFLOW EDGE LAB",
    oneLiner: "An early-stage idea for reading options flow and positioning.",
    blurb:
      "Still in the planning stage — no code yet. The idea is to explore how options activity, volume, and open interest can reveal what the market is positioning for.",
    tech: [],
    visual: "concept",
  },
];

const codeSnippet = `class SetupDefinition(CamelModel):
    """A named, versioned research hypothesis: a combination
    of weighted conditions plus the entry/exit methodology
    used to backtest it."""

    id: str
    rules: list[WeightedRule]
    min_edge_score_default: float
    entry_methodology: str
    stop_methodology: str
    target_methodology: str

    @property
    def max_score(self) -> float:
        return sum(rule.weight for rule in self.rules)`;

const Projects = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="max-w-5xl mx-auto px-8 pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Portfolio</p>
          <h1 className="font-display text-[13vw] md:text-[6vw] leading-[0.9] mb-6">PROJECTS</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-20">
            Things I've built at the intersection of markets, data and technology.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-foreground/10 hover:border-foreground/25 transition-colors duration-300 overflow-hidden"
            >
              <Link to={project.slug} className="grid md:grid-cols-2">
                {/* Text side */}
                <div className="p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-xs uppercase tracking-wide text-text-muted border border-foreground/15 rounded-full px-3 py-1">
                        {project.status}
                      </span>
                    </div>

                    <h2 className="font-display text-3xl md:text-4xl leading-[0.95] mb-4">
                      {project.title}
                    </h2>

                    <p className="text-lg text-foreground/90 leading-relaxed mb-4">
                      {project.oneLiner}
                    </p>

                    <p className="text-base text-foreground/60 leading-relaxed mb-6">
                      {project.blurb}
                    </p>

                    {project.tech.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-xs text-text-muted border border-foreground/10 rounded-full px-3 py-1"
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
                        className="inline-flex items-center gap-2 text-foreground hover:text-text-muted transition-colors duration-200"
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
                        className="inline-flex items-center gap-2 text-foreground hover:text-text-muted transition-colors duration-200"
                      >
                        Live Demo
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300">
                      Read more
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Visual side */}
                <div className="bg-foreground/[0.03] border-t md:border-t-0 md:border-l border-foreground/10 flex items-center justify-center p-8 min-h-[240px]">
                  {project.visual === "code" ? (
                    <pre className="w-full font-mono text-[11px] md:text-xs leading-relaxed text-text-muted overflow-hidden whitespace-pre-wrap">
                      <code>{codeSnippet}</code>
                    </pre>
                  ) : (
                    <div className="text-center">
                      <p className="font-mono text-xs uppercase tracking-wide text-text-faded border border-dashed border-foreground/15 rounded-xl px-6 py-8">
                        In planning — no build yet
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Projects;
