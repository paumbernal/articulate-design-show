import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const OptionsFlow = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-8 left-8 z-50"
      >
        <Link
          to="/projects"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </motion.nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block font-mono text-xs uppercase tracking-wide text-text-muted border border-foreground/15 rounded-full px-3 py-1 mb-6">
            Concept — no build yet
          </span>
          <h1 className="font-display text-[10vw] md:text-[6vw] leading-[0.9] mb-8">OPTIONSFLOW EDGE LAB</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            An early-stage idea for reading options flow and market positioning — not built yet.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">The Idea</h2>
          <p className="text-lg leading-relaxed text-foreground/80 mb-6">
            After building the first version of OrderFlow Edge Lab, I started thinking about the options
            side of the market — how options volume, open interest, and positioning can hint at what
            institutional participants expect next.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            OptionsFlow Edge Lab is the project I want to build to explore that: pulling in options data
            and surfacing the flow and positioning that pure price action would miss.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">Where It Stands</h2>
          <p className="text-lg leading-relaxed text-foreground/80">
            No code written yet — this is still at the planning stage. Once it's underway, this page
            will link to the repository and walk through what's actually been built, the same way{" "}
            <Link to="/orderflow" className="underline hover:text-foreground transition-colors">
              OrderFlow Edge Lab
            </Link>{" "}
            does.
          </p>
        </motion.section>

        {/* Back to Projects */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-foreground/10 pt-12"
        >
          <p className="text-text-muted text-sm mb-4">Back to</p>
          <Link to="/projects" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            PROJECTS →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OptionsFlow;
