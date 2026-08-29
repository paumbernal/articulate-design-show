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
          P—B
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


export default Navigation;