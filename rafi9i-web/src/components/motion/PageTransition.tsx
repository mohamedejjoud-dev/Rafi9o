/**
 * Rafi9i — Page enter transition (fade + short slide) used by template.tsx.
 * The first page load renders without animation, so server-rendered content
 * is visible immediately (good LCP on slow devices); later client-side
 * navigations animate in.
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

let hasNavigated = false;

export default function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
