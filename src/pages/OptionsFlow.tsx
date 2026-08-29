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
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Market Analysis Project</p>
          <h1 className="font-display text-[9vw] md:text-[7vw] leading-[0.9] mb-8">OPTIONSFLOW EDGE LAB</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            A market analysis project using options flow, volume, and positioning data to identify potential trading opportunities.
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
            OptionsFlow Edge Lab explores how options activity reveals what institutional participants are positioning for. By analysing options flow, volume, and open interest, it surfaces potential moves that pure price action alone would miss.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            I built and developed the analysis framework, researched options-flow concepts, analysed market positioning, and tested how options activity could be used alongside price action and order flow.
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
            <span className="text-text-muted text-sm">Flow Signals</span>
          </div>
          <div className="aspect-square bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Positioning</span>
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
            <li>• Built and developed the options-flow analysis framework</li>
            <li>• Researched options-flow concepts to shape the methodology</li>
            <li>• Analysed market positioning and open-interest dynamics</li>
            <li>• Tested how options activity combines with price action and order flow</li>
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
              <p className="font-display text-3xl md:text-4xl mb-2">FLOW</p>
              <p className="text-text-muted">Options Volume</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl mb-2">OI</p>
              <p className="text-text-muted">Positioning</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl mb-2">RX</p>
              <p className="text-text-muted">Price Action</p>
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
          <p className="text-text-muted text-sm mb-4">Back to</p>
          <Link to="/orderflow" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            ORDERFLOW EDGE LAB →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OptionsFlow;