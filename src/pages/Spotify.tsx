import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Spotify = () => {
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
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Staff Designer • 2020–2024</p>
          <h1 className="font-display text-[12vw] md:text-[8vw] leading-[0.9] mb-8">SPOTIFY</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            Shaping the future of audio through design that connects 500 million listeners worldwide.
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
            At Spotify, I worked on the Premium Experience team, redesigning how subscribers discover and enjoy content. My focus was on creating seamless listening experiences that feel personal and intuitive.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            From the redesigned home feed algorithm visualizations to the immersive "Behind the Lyrics" feature, I helped bridge the gap between complex audio technology and human emotion.
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
          <div className="aspect-[4/5] bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Mobile Experience</span>
          </div>
          <div className="aspect-[4/5] bg-foreground/5 rounded-xl flex items-center justify-center">
            <span className="text-text-muted text-sm">Now Playing</span>
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
            <li>• Redesigned the Premium onboarding flow, increasing conversion by 23%</li>
            <li>• Led design for the "Blend" social playlist feature, now used by 50M+ users</li>
            <li>• Created the visual language for Spotify's podcast discovery experience</li>
            <li>• Mentored 4 designers and established team design principles</li>
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
          <span className="text-text-muted">Desktop App Interface</span>
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
              <p className="font-display text-5xl md:text-6xl mb-2">50M+</p>
              <p className="text-text-muted">Blend Users</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">23%</p>
              <p className="text-text-muted">Conversion Lift</p>
            </div>
            <div>
              <p className="font-display text-5xl md:text-6xl mb-2">4</p>
              <p className="text-text-muted">Designers Mentored</p>
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
          <Link to="/figma" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            FIGMA →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Spotify;
