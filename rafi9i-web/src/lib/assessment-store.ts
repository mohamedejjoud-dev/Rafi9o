/**
 * Rafi9i — Temporary assessment answers store (Developer 2)
 * -----------------------------------------------------------
 * Zustand + persist: holds in-progress answers, saved items and
 * soft-skill action completion. Completed submissions are persisted
 * through the backend (or its mock fallback), not here.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdvancedAnswers, BasicAnswers } from "./types";

type BasicPartial = Partial<BasicAnswers>;
type AdvancedPartial = Partial<AdvancedAnswers>;

/** Where the student was in a quiz, so a refresh resumes at the same question. */
export type AssessmentProgress = { step: number; phase: "questions" | "review" };
type AssessmentVariant = "basic" | "advanced";

interface AssessmentState {
  /* In-progress answers */
  basic: BasicPartial;
  advanced: AdvancedPartial;
  progress: Partial<Record<AssessmentVariant, AssessmentProgress>>;

  /* Saved (favorites) */
  savedFields: string[];
  savedResources: string[];

  /* Soft-skill actions completed from Premium result / dashboard */
  completedSoftSkillActions: string[];
  weeklyChallengeCompleted: boolean;

  setBasicAnswer: (key: keyof BasicAnswers, value: unknown) => void;
  resetBasic: () => void;

  setAdvancedAnswer: (key: keyof AdvancedAnswers, value: unknown) => void;
  resetAdvanced: () => void;

  setProgress: (variant: AssessmentVariant, progress: AssessmentProgress | null) => void;

  toggleSavedField: (id: string) => void;
  toggleSavedResource: (id: string) => void;

  toggleSoftSkillAction: (id: string) => void;
  setWeeklyChallengeCompleted: (done: boolean) => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      basic: {},
      advanced: {},
      progress: {},
      savedFields: [],
      savedResources: [],
      completedSoftSkillActions: [],
      weeklyChallengeCompleted: false,

      setBasicAnswer: (key, value) =>
        set((s) => ({ basic: { ...s.basic, [key]: value } })),
      resetBasic: () => set((s) => ({ basic: {}, progress: { ...s.progress, basic: undefined } })),

      setAdvancedAnswer: (key, value) =>
        set((s) => ({ advanced: { ...s.advanced, [key]: value } })),
      resetAdvanced: () => set((s) => ({ advanced: {}, progress: { ...s.progress, advanced: undefined } })),

      setProgress: (variant, progress) =>
        set((s) => ({ progress: { ...s.progress, [variant]: progress ?? undefined } })),

      toggleSavedField: (id) =>
        set((s) => ({
          savedFields: s.savedFields.includes(id)
            ? s.savedFields.filter((x) => x !== id)
            : [...s.savedFields, id],
        })),
      toggleSavedResource: (id) =>
        set((s) => ({
          savedResources: s.savedResources.includes(id)
            ? s.savedResources.filter((x) => x !== id)
            : [...s.savedResources, id],
        })),

      toggleSoftSkillAction: (id) =>
        set((s) => ({
          completedSoftSkillActions: s.completedSoftSkillActions.includes(id)
            ? s.completedSoftSkillActions.filter((x) => x !== id)
            : [...s.completedSoftSkillActions, id],
        })),
      setWeeklyChallengeCompleted: (done) => set({ weeklyChallengeCompleted: done }),
    }),
    { name: "rafi9i.assessment-store" }
  )
);
