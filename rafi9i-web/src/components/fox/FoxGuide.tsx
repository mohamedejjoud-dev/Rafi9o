/**
 * Rafi9i — FoxGuide import bridge (Developer 1 integration glue)
 * --------------------------------------------------------------
 * The OFFICIAL mascot lives in `@/components/mascot/FoxGuide`.
 * This file keeps Developer 2's import path (`@/components/fox/FoxGuide`)
 * stable — all 16 existing call sites compile against the new mascot
 * without a single page change. Do not add mascot logic here.
 */
export { default } from "@/components/mascot/FoxGuide";
export type { FoxStage as FoxGuideStage, FoxMood, FoxGuideProps } from "@/components/mascot/FoxGuide";
