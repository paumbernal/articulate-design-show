import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-8 pt-32 pb-24">
      {/* Intro Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-24 max-w-lg"
      >
        <p className="text-lg md:text-xl text-foreground leading-relaxed">
          Welcome to the portfolio of Pau Martinez Bernal —
          <br />
          a finance &amp; market analyst
          <br />
          from Manchester, UK
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;