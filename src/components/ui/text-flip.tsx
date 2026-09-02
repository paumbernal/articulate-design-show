import { Children, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TextFlipProps {
  as?: ComponentType<{ className?: string; children?: ReactNode }>;
  className?: string;
  play?: boolean;
  interval?: number;
  onIndexChange?: (index: number) => void;
  children: ReactNode;
}

export const TextFlip = ({
  as: Component = motion.span,
  className,
  play = true,
  interval = 2200,
  onIndexChange,
  children,
}: TextFlipProps) => {
  const words = Children.toArray(children);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (!play || words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [play, words.length, interval]);

  return (
    <Component className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 12, rotateX: 60 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -12, rotateX: -60 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-clip-text text-transparent animate-text-shimmer"
          style={{
            transformOrigin: "50% 100%",
            backgroundImage:
              "linear-gradient(110deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 40%, hsl(var(--foreground) / 0.3) 50%, hsl(var(--foreground)) 60%, hsl(var(--foreground)) 100%)",
            backgroundSize: "200% 100%",
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </Component>
  );
};
