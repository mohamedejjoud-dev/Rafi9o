/**
 * Rafi9i — Scroll reveal. Content is visible in the server HTML; only
 * sections that start below the fold are hidden after mount and fade/slide
 * in once when scrolled into view, so nothing stays blank if JS is slow.
 */
"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element && element.getBoundingClientRect().top > window.innerHeight) setArmed(true);
  }, []);

  const hidden = armed && !inView;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={hidden ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
      transition={hidden ? { duration: 0 } : { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
