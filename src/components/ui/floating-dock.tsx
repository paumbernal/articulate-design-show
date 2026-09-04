import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FloatingDock — macOS-style magnifying dock, ported from the Aceternity UI
 * component to this project's stack: framer-motion instead of motion/react,
 * lucide instead of @tabler/icons-react, and react-router Link for internal
 * routes (external items open in a new tab).
 */

export interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  /** External links render as <a target="_blank">, internal ones as <Link>. */
  external?: boolean;
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => (
  <>
    <FloatingDockDesktop items={items} className={desktopClassName} />
    <FloatingDockMobile items={items} className={mobileClassName} />
  </>
);

const DockLink = ({
  item,
  className,
  children,
}: {
  item: DockItem;
  className?: string;
  children: React.ReactNode;
}) =>
  item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.title} className={className}>
      {children}
    </a>
  ) : (
    <Link to={item.href} aria-label={item.title} className={className}>
      {children}
    </Link>
  );

const FloatingDockMobile = ({ items, className }: { items: DockItem[]; className?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div layoutId="dock-nav" className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2">
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { delay: idx * 0.05 } }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <DockLink
                  item={item}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-background/90 backdrop-blur"
                >
                  <div className="h-5 w-5">{item.icon}</div>
                </DockLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-background/90 backdrop-blur"
      >
        <ChevronUp className={cn("h-5 w-5 text-foreground transition-transform", open && "rotate-180")} />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }: { items: DockItem[]; className?: string }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-20 items-end gap-5 rounded-2xl border border-foreground/10 bg-background/80 px-5 pb-3.5 backdrop-blur-md md:flex",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} item={item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, item }: { mouseX: MotionValue<number>; item: DockItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(useTransform(distance, [-150, 0, 150], [46, 92, 46]), spring);
  const height = useSpring(useTransform(distance, [-150, 0, 150], [46, 92, 46]), spring);
  const widthIcon = useSpring(useTransform(distance, [-150, 0, 150], [23, 46, 23]), spring);
  const heightIcon = useSpring(useTransform(distance, [-150, 0, 150], [23, 46, 23]), spring);

  return (
    <DockLink item={item}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-foreground/10"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-foreground/10 bg-background px-2 py-0.5 text-xs text-foreground"
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: widthIcon, height: heightIcon }} className="flex items-center justify-center">
          {item.icon}
        </motion.div>
      </motion.div>
    </DockLink>
  );
}
