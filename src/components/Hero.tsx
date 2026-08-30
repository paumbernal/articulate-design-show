import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NAME = "pau martínez bernal";

const useTypewriter = (text: string, speed = 80, onComplete?: () => void) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplay("");
    const interval = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return display;
};

const Hero = () => {
  const [finished, setFinished] = useState(false);
  const typed = useTypewriter(NAME, 80, () => setFinished(true));

  return (
    <section className="min-h-screen flex flex-col justify-start items-center px-8 pt-64 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="font-mono text-2xl md:text-4xl text-foreground lowercase tracking-tight">
          {typed}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={finished ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex items-center justify-center gap-6 font-mono text-sm md:text-base lowercase tracking-wide"
        >
          <Link to="/projects" className="text-foreground hover:text-primary transition-colors duration-300">
            projects
          </Link>
          <span className="text-text-muted">/</span>
          <Link to="/about" className="text-foreground hover:text-primary transition-colors duration-300">
            about
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;