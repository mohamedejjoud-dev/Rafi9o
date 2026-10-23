/**
 * Rafi9i — Rafi the Fox (VEROX mascot)
 * ----------------------------------------------------
 * The brand fox from the VEROX logo, given depth with CSS:
 * ground shadow, drop shadow and a glossy highlight masked to the fox shape.
 * Moods change the motion, not the artwork:
 * - neutral / encouraging: gentle float
 * - thinking: head tilt + thought dots
 * - celebrating: bounce + sparkles
 * - concerned: slight droop, no motion
 *
 * To use a real 3D render later, point MASCOT_SRC at it (transparent PNG).
 */
"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const MASCOT_SRC = "/images/rafi9i-mark.png";

export type RafiMood = "neutral" | "encouraging" | "thinking" | "celebrating" | "concerned";
export type RafiStage =
  | "welcome"
  | "assessment"
  | "thinking"
  | "result"
  | "progress"
  | "achievement"
  | "auth"
  | "onboarding"
  | "results"
  | "trial"
  | "dashboard";

export interface RafiFoxProps {
  mood?: RafiMood;
  stage?: RafiStage;
  /** Rendered size in px */
  size?: number;
  className?: string;
  /** Hide from assistive tech */
  decorative?: boolean;
}

const GLOSS =
  "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.55), rgba(255,255,255,0) 42%)," +
  "radial-gradient(circle at 72% 88%, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%)";

export default function RafiFox({
  mood = "encouraging",
  stage = "welcome",
  size = 140,
  className = "",
  decorative = false,
}: RafiFoxProps) {
  const { t } = useI18n();
  const thinking = mood === "thinking" || stage === "thinking";
  const celebrating = mood === "celebrating" || stage === "achievement" || stage === "result";
  const concerned = mood === "concerned";

  const altText = t(
    thinking
      ? "pub.mascot.alt.thinking"
      : celebrating
        ? "pub.mascot.alt.celebrating"
        : concerned
          ? "pub.mascot.alt.concerned"
          : "pub.mascot.alt.default"
  );

  const motion = celebrating ? "rf-bounce" : concerned ? "" : "rf-float";
  const pose = thinking ? "-rotate-[8deg]" : concerned ? "rotate-[6deg] translate-y-[4%]" : "";

  return (
    <div
      className={`relative inline-flex shrink-0 select-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : altText}
    >
      {/* Ground shadow */}
      <span
        aria-hidden
        className="absolute bottom-[3%] left-1/2 h-[9%] w-[58%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-[6px] dark:bg-black/60"
      />

      <div className={`relative h-[86%] w-[86%] ${motion}`}>
        <div className={`relative h-full w-full transition-transform duration-500 ${pose}`}>
          <Image
            src={MASCOT_SRC}
            alt=""
            fill
            sizes={`${size}px`}
            className="object-contain"
            style={{ filter: "drop-shadow(0 6px 8px rgba(20,18,16,0.28)) drop-shadow(0 2px 2px rgba(20,18,16,0.2))" }}
            priority={size > 150}
          />
          {/* Gloss + shading, clipped to the fox silhouette */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background: GLOSS,
              WebkitMaskImage: `url(${MASCOT_SRC})`,
              maskImage: `url(${MASCOT_SRC})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </div>
      </div>

      {celebrating && (
        <>
          <Sparkles aria-hidden className="rf-sparkle absolute end-[2%] top-[4%] h-[18%] w-[18%] text-amber-400" />
          <Sparkles aria-hidden className="rf-sparkle absolute start-[4%] top-[30%] h-[12%] w-[12%] text-orange-400 [animation-delay:600ms]" />
        </>
      )}

      {thinking && (
        <span aria-hidden className="absolute end-[0%] top-[2%] flex gap-[6%] rounded-full bg-white px-[6%] py-[3%] shadow-md dark:bg-slate-800" style={{ width: "30%" }}>
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="aspect-square flex-1 animate-bounce rounded-full bg-orange-500"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
