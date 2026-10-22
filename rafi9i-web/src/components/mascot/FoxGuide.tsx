/**
 * Rafi9i — OFFICIAL FoxGuide (3D Character Interface)
 * ----------------------------------------------------
 * The 3D Fox speaking directly to the student with clear dialogue.
 */
"use client";

import RafiFox, { type RafiMood } from "./RafiFox";
import FoxMessage from "./FoxMessage";

export type FoxStage =
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

export type FoxMood = "neutral" | "encouraging" | "thinking" | "celebrating" | "concerned";

export interface FoxGuideProps {
  stage: FoxStage;
  progress?: number;
  message: string;
  mood?: FoxMood;
  compact?: boolean;
  className?: string;
}

const STAGE_DEFAULT_MOOD: Record<FoxStage, FoxMood> = {
  welcome: "encouraging",
  assessment: "encouraging",
  thinking: "thinking",
  result: "celebrating",
  progress: "encouraging",
  achievement: "celebrating",
  auth: "encouraging",
  onboarding: "encouraging",
  results: "celebrating",
  trial: "encouraging",
  dashboard: "encouraging",
};

export default function FoxGuide({
  stage,
  progress,
  message,
  mood,
  compact = false,
  className = "",
}: FoxGuideProps) {
  const resolvedMood: RafiMood = mood ?? STAGE_DEFAULT_MOOD[stage];
  const size = compact ? 52 : 76;

  return (
    <div
      data-stage={stage}
      className={`flex items-end gap-3.5 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="rf-float shrink-0">
        <RafiFox mood={resolvedMood} stage={stage} size={size} decorative />
      </div>
      <FoxMessage message={message} progress={progress} compact={compact} />
    </div>
  );
}
