import { motion, useScroll, useTransform } from "framer-motion";
import { Home, Linkedin, Phone } from "lucide-react";
import { FloatingDock, type DockItem } from "@/components/ui/floating-dock";
import { GithubMark } from "@/components/ui/github-mark";

const iconClass = "h-full w-full text-foreground/70";

export const DOCK_ITEMS: DockItem[] = [
  { title: "Home", href: "/", icon: <Home className={iconClass} /> },
  { title: "Contact", href: "/contact", icon: <Phone className={iconClass} /> },
  {
    title: "GitHub",
    href: "https://github.com/paumbernal",
    external: true,
    icon: <GithubMark className={iconClass} />,
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/paumartinezbernal/",
    external: true,
    icon: <Linkedin className={iconClass} />,
  },
];

/**
 * Fades in over the last stretch of the page. Driven by framer-motion's
 * useScroll rather than a scroll listener + state: it needs no re-renders
 * (so it can't stutter behind the heavy MacbookScroll tree) and it uses the
 * same scroll source the rest of the page already animates from.
 */
const AboutDock = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.86, 0.97], [0, 1]);
  // keep the links unclickable while the dock is still faded out
  const pointerEvents = useTransform(scrollYProgress, (v) => (v > 0.86 ? "auto" : "none"));

  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="fixed inset-x-0 bottom-44 z-50 flex justify-center"
    >
      <FloatingDock items={DOCK_ITEMS} />
    </motion.div>
  );
};

export default AboutDock;
