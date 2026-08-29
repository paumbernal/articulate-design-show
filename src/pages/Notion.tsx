import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Notion = () => {
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
          to="/"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </motion.nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Senior Designer • 2012–2016</p>
          <h1 className="font-display text-[12vw] md:text-[8vw] leading-[0.9] mb-8">NOTION</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            Crafting the workspace that would redefine how teams organize knowledge and collaborate.
          </p>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full aspect-[16/10] bg-foreground/5 rounded-2xl mb-24 flex items-center justify-center"
        >
          <span className="text-text-muted">Project Hero Image</span>
        </motion.div>

        {/* Overview */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">Overview</h2>
          <p className="text-lg leading-relaxed text-foreground/80 mb-6">
            Notion was my first major product role after design school. I joined during the pivot from a developer tool to the all-in-one workspace we know today. It was a masterclass in product thinking.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            I worked across the entire product surface—from the block-based editor to database views to the iconic emoji-based navigation. Every decision taught me something about simplicity.
          </p>
        </motion.section>

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-24"
        >
          <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Block Editor</span>
          </div>
          <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Database Views</span>
          </div>
          <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Templates</span>
          </div>
          <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Mobile App</span>
          </div>
        </motion.div>

        {/* Responsibilities */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">Key Contributions</h2>
          <ul className="space-y-4 text-lg text-foreground/80">
            <li>• Designed the original database block and its various view types</li>
            <li>• Created the template gallery experience and initial templates</li>
            <li>• Established Notion's distinctive minimal visual language</li>
            <li>• Led the first mobile app design from scratch</li>
          </ul>
        </motion.section>

        {/* Full Width Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full aspect-video bg-foreground/5 rounded-2xl mb-24 flex items-center justify-center"
        >
          <span className="text-text-muted">Workspace Overview</span>
        </motion.div>

        {/* Personal Reflection */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">Reflection</h2>
          <p className="text-lg leading-relaxed text-foreground/80">
            Notion taught me that the best tools disappear. They become extensions of thought rather than obstacles to it. Four years of questioning every element, every interaction, every pixel. This foundation shapes everything I design today.
          </p>
        </motion.section>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-8">Impact</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">V1</p>
              <p className="text-text-muted">Mobile App</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">6</p>
              <p className="text-text-muted">Database Views</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">100+</p>
              <p className="text-text-muted">Templates</p>
            </div>
          </div>
        </motion.section>

        {/* Next Project */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-foreground/10 pt-12"
        >
          <p className="text-text-muted text-sm mb-4">Next Project</p>
          <Link to="/explorations" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            EXPLORATIONS →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Notion;
