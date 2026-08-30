import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NAME = "pau martínez bernal";

const Candlesticks = () => (
  <svg
    width="64"
    height="24"
    viewBox="0 0 64 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-accent-green"
  >
    {/* Candlestick 1 */}
    <rect x="4" y="10" width="4" height="8" rx="1" className="fill-current" />
    <rect x="5.5" y="6" width="1" height="16" className="fill-current" />
    {/* Candlestick 2 */}
    <rect x="16" y="6" width="4" height="12" rx="1" className="fill-current" />
    <rect x="17.5" y="2" width="1" height="20" className="fill-current" />
    {/* Candlestick 3 */}
    <rect x="28" y="12" width="4" height="6" rx="1" className="fill-current" />
    <rect x="29.5" y="8" width="1" height="14" className="fill-current" />
    {/* Candlestick 4 */}
    <rect x="40" y="5" width="4" height="14" rx="1" className="fill-current" />
    <rect x="41.5" y="1" width="1" height="22" className="fill-current" />
    {/* Candlestick 5 */}
    <rect x="52" y="9" width="4" height="10" rx="1" className="fill-current" />
    <rect x="53.5" y="4" width="1" height="18" className="fill-current" />
  </svg>
);

const useTypewriter = (text: string, speed = 80, onComplete?: () => void) => {
  const [display, setDisplay] = useState("");
  const callbackRef = useRef(onComplete);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    setDisplay("");
    const interval = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        callbackRef.current?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

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
          className="mt-6 flex flex-col items-center gap-5"
        >
          <div className="flex items-center justify-center gap-6 font-mono text-sm md:text-base lowercase tracking-wide">
            <Link to="/projects" className="text-foreground hover:text-primary transition-colors duration-300">
              projects
            </Link>
            <span className="text-text-muted">/</span>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors duration-300">
              about
            </Link>
          </div>
          <Candlesticks />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;