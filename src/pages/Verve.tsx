import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Verve = () => {
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
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Design Director • 2024–Present</p>
          <h1 className="font-display text-[12vw] md:text-[8vw] leading-[0.9] mb-8">VERVE</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            Reimagining creative collaboration for the next generation of design teams.
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
            Verve is reshaping how creative teams ideate, prototype, and ship design work together. As Design Director, I lead a team of 12 designers building a next-generation collaborative platform that serves over 2 million users worldwide.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            From establishing the design system to crafting the core product experience, my role spans strategic vision and hands-on execution—ensuring every pixel serves the creative professionals who rely on Verve daily.
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
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Interface Detail</span>
          </div>
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Design System</span>
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
            <li>• Led the complete redesign of the collaborative canvas, improving team efficiency by 40%</li>
            <li>• Built and scaled the design system from 0 to 200+ components</li>
            <li>• Established design operations and critique culture across the organization</li>
            <li>• Drove the vision for Verve's AI-powered design assistant feature</li>
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
          <span className="text-text-muted">Product Screenshot</span>
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
              <p className="font-display text-5xl md:text-6xl mb-2">2M+</p>
              <p className="text-text-muted">Active Users</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">40%</p>
              <p className="text-text-muted">Efficiency Gain</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">200+</p>
              <p className="text-text-muted">Components</p>
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
          <Link to="/spotify" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            SPOTIFY →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Verve;
