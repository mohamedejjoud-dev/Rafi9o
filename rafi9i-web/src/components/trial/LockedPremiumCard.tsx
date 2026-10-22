/**
 * Rafi9i — Locked premium card teaser (Developer 2)
 */
"use client";

import { Lock } from "lucide-react";

export default function LockedPremiumCard({
  title,
  teaser,
}: {
  title: string;
  teaser: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="select-none p-5 blur-[3px]" aria-hidden>
        <h3 className="text-base font-bold text-stone-800">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{teaser}</p>
        <div className="mt-3 space-y-2">
          <div className="h-2.5 w-3/4 rounded-full bg-stone-100" />
          <div className="h-2.5 w-2/3 rounded-full bg-stone-100" />
          <div className="h-2.5 w-1/2 rounded-full bg-stone-100" />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/45">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white shadow">
          <Lock className="h-4.5 w-4.5" aria-hidden />
        </span>
        <p className="text-xs font-semibold text-stone-700">Contenu Aperçu Premium</p>
      </div>
    </div>
  );
}
