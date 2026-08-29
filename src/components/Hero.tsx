import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NAME = "pau martínez bernal";

const useTypewriter = (text: string, speed = 80) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplay("");
    const interval = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return display;
};

const Hero = () => {
  const typed = useTypewriter(NAME);

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
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1] }}
            transition={{ duration: 0.3, delay: 1 }}
            className="inline-block w-0.5 h-[0.9em] bg-primary ml-1 align-middle"
          />
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;