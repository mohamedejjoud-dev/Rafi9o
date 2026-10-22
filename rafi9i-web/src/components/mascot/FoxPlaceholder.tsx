/**
 * Rafi9i — FoxPlaceholder
 * Lightweight stand-in for the mascot in image-light contexts:
 * the VEROX fox mark in a soft brand-coloured disc. No text, so it never
 * duplicates surrounding copy.
 */
"use client";

import Image from "next/image";

export default function FoxPlaceholder({
  size = 72,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src="/images/rafi9i-mark.png" alt="" width={Math.round(size * 0.7)} height={Math.round(size * 0.7)} />
    </span>
  );
}
