import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import About from "@/components/About";

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Link
        to="/"
        aria-label="Back to home"
        className="fixed top-8 left-8 z-50 flex items-center justify-center w-9 h-9 text-foreground hover:opacity-70 transition-opacity"
      >
        <ArrowLeft size={18} strokeWidth={2} />
      </Link>

      <About />
    </main>
  );
};

export default AboutPage;
