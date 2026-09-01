import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <Navigation />
      <div className="h-full flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-mono text-2xl md:text-4xl text-foreground lowercase tracking-tight mb-6">
            404
          </p>
          <p className="font-mono text-sm md:text-base text-text-muted lowercase tracking-wide mb-8">
            page not found
          </p>
          <Link
            to="/"
            className="inline-block font-mono text-sm md:text-base text-foreground hover:text-primary transition-all duration-300 hover:-translate-y-0.5 lowercase tracking-wide"
          >
            back home
          </Link>
        </motion.div>
      </div>
    </main>
  );
};

export default NotFound;
