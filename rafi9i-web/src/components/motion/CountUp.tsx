/**
 * Rafi9i — Animated number for stats ("65%", "4 j", "12"). Counts up once
 * when visible (client-rendered pages such as the dashboard); text that
 * doesn't start with a number is shown as-is.
 */
"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const NUMBER_PREFIX = /^(\d+(?:[.,]\d+)?)([\s\S]*)$/;

export default function CountUp({ value, duration = 0.9 }: { value: string; duration?: number }) {
  const match = NUMBER_PREFIX.exec(value);
  const target = match ? Number(match[1].replace(",", ".")) : null;
  const suffix = match ? match[2] : "";
  const decimals = match && /[.,]/.test(match[1]) ? match[1].split(/[.,]/)[1].length : 0;

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === null || !inView || reduceMotion) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Number(latest.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [target, inView, reduceMotion, duration, decimals]);

  if (target === null) return <>{value}</>;
  return (
    <span ref={ref}>
      {(reduceMotion ? target : display).toFixed(decimals)}
      {suffix}
    </span>
  );
}
