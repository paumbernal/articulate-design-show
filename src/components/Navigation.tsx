import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navigation = () => {
  return (
    <>
      {/* Top Left - Logo/Initials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-8 left-8 z-50"
      >
        <Link 
          to="/" 
          className="text-sm font-medium text-accent-green hover:opacity-70 transition-opacity"
        >
          M—C
        </Link>
      </motion.div>

      {/* Top Right - Work Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed top-8 right-8 z-50"
      >
        <Link 
          to="/#work" 
          className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          Work
        </Link>
      </motion.div>

      {/* Bottom Left - About Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <Link 
          to="/#about" 
          className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          About
        </Link>
      </motion.div>

      {/* Bottom Right - Contact Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Link 
          to="/#contact" 
          className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          Contact
        </Link>
      </motion.div>

      {/* Top Center - Circular Badge */}
      <motion.div
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="relative w-16 h-16">
          {/* Circular text */}
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
            <path
              id="circlePath"
              d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              fill="none"
            />
            <text className="text-[11px] uppercase tracking-[0.2em] fill-foreground">
              <textPath href="#circlePath">
                CRAFTED BY MAYA CHEN × CRAFTED BY MAYA CHEN ×
              </textPath>
            </text>
          </svg>
        </div>
      </motion.div>
    </>
  );
};

export default Navigation;
