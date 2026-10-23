/**
 * Rafi9i — Global motion settings: honor the OS "reduce motion" preference
 * (transforms are skipped, only opacity fades remain).
 */
"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
