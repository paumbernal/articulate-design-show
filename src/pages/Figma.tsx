import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Figma = () => {
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
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Senior Designer • 2016–2020</p>
          <h1 className="font-display text-[12vw] md:text-[8vw] leading-[0.9] mb-8">FIGMA</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            Building the design tool that would revolutionize how teams create together in the browser.
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
            I joined Figma when the team was just 30 people, working directly on the core editor experience. Those early years shaped not just my career, but how millions of designers approach their craft.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            From the constraints panel to interactive components, I helped build features that became industry standards. The challenge was always the same: make the complex feel effortless.
          </p>
        </motion.section>

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-24"
        >
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Components</span>
          </div>
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Prototyping</span>
          </div>
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Collaboration</span>
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
            <li>• Designed the Auto Layout feature from concept to launch</li>
            <li>• Created the original constraints and resizing system</li>
            <li>• Led the design of Figma's commenting and feedback tools</li>
            <li>• Established early design system documentation practices</li>
          </ul>
        </motion.section>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-l-2 border-foreground/20 pl-8 mb-24"
        >
          <p className="text-2xl md:text-3xl leading-relaxed text-foreground/80 italic mb-4">
            "Maya's work on Auto Layout fundamentally changed how designers think about responsive design."
          </p>
          <p className="text-text-muted">— Dylan Field, Figma CEO</p>
        </motion.div>

        {/* Full Width Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full aspect-video bg-foreground/5 rounded-2xl mb-24 flex items-center justify-center"
        >
          <span className="text-text-muted">Editor Interface</span>
        </motion.div>

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
              <p className="font-display text-5xl md:text-6xl mb-2">30→</p>
              <p className="text-text-muted">300 Employees</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">3</p>
              <p className="text-text-muted">Core Features</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">4M+</p>
              <p className="text-text-muted">Daily Users</p>
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
          <Link to="/notion" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            NOTION →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Figma;
