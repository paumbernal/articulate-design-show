import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isContactPage = location.pathname === "/contact";

  return (
    <>
      {/* Top Left - Contact or Back */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-8 left-8 z-50"
      >
        {isContactPage ? (
          <Link
            to="/"
            aria-label="Back to home"
            className="flex items-center justify-center w-9 h-9 text-foreground hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
        ) : (
          <Link
            to="/contact"
            className="font-mono text-sm text-foreground hover:opacity-70 transition-opacity lowercase"
          >
            contact
          </Link>
        )}
      </motion.div>

      {/* Top Right - Theme Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-8 right-8 z-50"
      >
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
className="flex items-center justify-center w-9 h-9 rounded-full text-foreground hover:opacity-70 transition-opacity"
        >
          {theme === "dark" ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>
      </motion.div>
    </>
  );
};

export default Navigation;