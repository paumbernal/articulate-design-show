import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { usePageInView } from "@/hooks/use-page-in-view";
import { TextFlip } from "@/components/ui/text-flip";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { GithubMark } from "@/components/ui/github-mark";

const WORDS = ["Researcher", "Developer", "Strategist"];

const PRESENT_ITEMS = [
  "Intern at SYNK, an AI startup, where I work on real-world AI solutions and contribute to meaningful projects.",
  "Funded retail trader, managing risk and building strategies while constantly refining my edge in the markets.",
  "Freelance web developer, building websites and web applications for clients and turning ideas into functional, user-focused products.",
];

const FUTURE_ITEMS = [
  "I want to build a career in the finance sector.",
  "Create products and systems that bring clarity to markets, solve real problems, and make a lasting impact.",
  "Keep building, keep learning, and keep growing.",
  "My long-term goal is to work on meaningful projects that shape the future of finance and technology.",
];

const AboutMobile = () => (
  <div className="md:hidden px-6 pt-12 pb-28 max-w-lg mx-auto">
    <h1 className="text-3xl font-bold text-foreground text-center mb-8">About Me</h1>

    <p className="text-base text-foreground/80 leading-relaxed mb-10">
      My interest in finance and its markets pushed me beyond just studying them into building my own tools around
      them. I started developing apps to analyse markets and visualise financial activity, and realised finance sits
      at the center of my life: interning at an AI startup, trading a funded account, and working as a freelance web
      developer. Those experiences have taught me discipline, problem-solving, and adaptability.
    </p>

    <section className="mb-10">
      <h2 className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-4">Present</h2>
      <ul className="space-y-4">
        {PRESENT_ITEMS.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-foreground/80 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent-green" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>

    <section className="mb-4">
      <h2 className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-4">Future</h2>
      <ul className="space-y-4">
        {FUTURE_ITEMS.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-foreground/80 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent-green" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  </div>
);

const About = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isPageInView = usePageInView();
  const isInView = useInView(ref);
  const play = isPageInView && isInView;

  return (
    <section id="about" className="w-full overflow-hidden">
      <div className="hidden md:block">
        <MacbookScroll
          src="/about-me-board.jpg"
          alt="A project board summarizing my background: my interest in finance and markets, what I'm currently working on, and where I'm headed"
          title={
            <span className="flex flex-col items-center gap-14">
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
              <span className="text-xs tracking-wide text-text-muted">(scroll)</span>
            </span>
          }
          badge={
            <a href="https://github.com/paumbernal" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubMark className="h-8 w-8 -rotate-12 transform text-black" />
            </a>
          }
          showGradient={false}
        />
      </div>

      <AboutMobile />
    </section>
  );
};

export default About;
