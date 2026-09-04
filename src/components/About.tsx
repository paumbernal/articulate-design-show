import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { usePageInView } from "@/hooks/use-page-in-view";
import { TextFlip } from "@/components/ui/text-flip";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { GithubMark } from "@/components/ui/github-mark";
import AboutDock from "@/components/AboutDock";

const WORDS = ["Researcher", "Developer", "Strategist"];

const About = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isPageInView = usePageInView();
  const isInView = useInView(ref);
  const play = isPageInView && isInView;

  return (
    <section id="about" className="w-full overflow-hidden">
      <MacbookScroll
        src="/about-me-board.jpg"
        alt="A project board summarizing my background: my interest in finance and markets, what I'm currently working on, and where I'm headed"
        title={
          <span ref={ref} className="inline-flex items-center gap-2.5 font-medium text-muted-foreground">
            <span>I am a</span>
            <span className="inline-grid">
              {/* Placeholder for the longest word */}
              <span className="invisible col-start-1 row-start-1" aria-hidden>
                {WORDS.reduce((a, b) => (a.length >= b.length ? a : b))}
              </span>
              {/* text-left keeps every word starting at the same x — the slot is
                  sized to the longest word, and the h2 centers text by default. */}
              <TextFlip as={motion.span} className="col-start-1 row-start-1 text-left text-foreground" play={play}>
                {WORDS.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </TextFlip>
            </span>
          </span>
        }
        badge={
          <a href="https://github.com/paumbernal" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GithubMark className="h-8 w-8 -rotate-12 transform text-black" />
          </a>
        }
        showGradient={false}
      />

      <AboutDock />
    </section>
  );
};

export default About;
