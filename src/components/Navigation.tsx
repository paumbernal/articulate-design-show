import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      {/* Top Left - Theme Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-8 left-8 z-50"
      >
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-border-default text-foreground hover:bg-surface-hover transition-colors"
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