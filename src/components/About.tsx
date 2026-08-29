import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="max-w-2xl mx-auto px-8 py-32">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-sm font-medium text-text-muted mb-8 uppercase tracking-wide"
      >
        About
      </motion.h3>
      
      <div className="flex flex-col gap-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-foreground"
        >
          I'm a finance and market analyst focused on order flow, options flow, and market positioning — turning complex market data into clear, actionable trading signals.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-foreground"
        >
          My approach blends structured research with hands-on{" "}
          <span className="font-semibold">analysis</span>,{" "}
          <span className="font-semibold">data</span>, and{" "}
          <span className="font-semibold">market structure</span> — building frameworks that help identify opportunities before they become obvious.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-foreground"
        >
          I'm dedicated to the craft of understanding markets. My work always starts with the data — from price action to positioning — and builds up to a confident, well-researched view.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-text-muted italic"
        >
          Curious and methodical.
        </motion.p>
      </div>
    </section>
  );
};

export default About;