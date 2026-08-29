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
          Over a decade of experience crafting digital products, brands and experiences that are used by millions of people every day.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-foreground"
        >
          Embracing growth, I continually combine extensive experience in{" "}
          <span className="font-semibold">Product</span>,{" "}
          <span className="font-semibold">Motion</span>,{" "}
          <span className="font-semibold">Sound</span> and{" "}
          <span className="font-semibold">Brand</span>-Design.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-foreground"
        >
          I am dedicated to shaping a better future through Design. My approach always puts people first — from clients to users.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg leading-relaxed text-text-muted italic"
        >
          Curious and optimistic.
        </motion.p>
      </div>
    </section>
  );
};

export default About;
