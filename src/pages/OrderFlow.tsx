import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const OrderFlow = () => {
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
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Market Analysis Tool</p>
          <h1 className="font-display text-[9vw] md:text-[7vw] leading-[0.9] mb-8">ORDERFLOW EDGE LAB</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            An order-flow trading analysis tool built for futures markets — reading volume, delta, and liquidity to find the edge.
          </p>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full aspect-[16/10] bg-foreground/5 rounded-2xl mb-24 flex items-center justify-center"
        >
          <span className="text-text-muted">Project Visual</span>
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
            OrderFlow Edge Lab is a research and analysis framework focused on order-flow trading in futures markets. The goal is simple: understand where and why big money is transacting, then trade alongside it.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            I built the analysis framework from the ground up — combining volume profile, footprint charts, and cumulative delta to surface the imbalances and absorption levels that define meaningful order flow.
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
            <span className="text-text-muted text-sm">Volume Profile</span>
          </div>
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Cumulative Delta</span>
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
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">What I Built</h2>
          <ul className="space-y-4 text-lg text-foreground/80">
            <li>• Developed the core order-flow analysis framework for futures markets</li>
            <li>• Researched volume profile, footprint, and delta concepts to inform the approach</li>
            <li>• Identified liquidity zones and absorption levels to frame high-probability setups</li>
            <li>• Built tooling to combine order-flow signals with price action</li>
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
          <span className="text-text-muted">Analysis Dashboard</span>
        </motion.div>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-8">Focus Areas</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="font-display text-3xl md:text-4xl mb-2">VOLUME</p>
              <p className="text-text-muted">Profile &amp; Footprint</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl mb-2">DELTA</p>
              <p className="text-text-muted">Cumulative Flow</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl mb-2">LIQ</p>
              <p className="text-text-muted">Liquidity Zones</p>
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
          <Link to="/optionsflow" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            OPTIONSFLOW EDGE LAB →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderFlow;