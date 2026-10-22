/**
 * Rafi9i — Hero
 * ----------------------------------------------------
 * Short pitch + an interactive Moroccan Bac stream matcher
 * where Rafi (the logo fox) suggests schools per stream.
 */
"use client";

import { useState, useMemo } from "react";
import { ArrowRight, Check, GraduationCap, MessageCircle } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/shared/Buttons";
import RafiLogo from "@/components/ui/RafiLogo";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n";

interface BacStream {
  id: string;
  name: string;
  short: string;
  topMatches: string[];
  message: string;
  compat: number;
}

// Demo affinity rates: deliberately spread out so each stream reads differently.
const BAC_STREAMS_CONFIG: Omit<BacStream, "name">[] = [
  {
    id: "sm",
    short: "stream.sm",
    topMatches: ["CPGE / Grandes Écoles", "UM6P Benguerir", "ENSIAS / EMI Rabat"],
    message: "stream.sm.msg",
    compat: 94,
  },
  {
    id: "pc",
    short: "stream.pc",
    topMatches: ["ENSA", "Médecine (FMP)", "ENSAM"],
    message: "stream.pc.msg",
    compat: 81,
  },
  {
    id: "svt",
    short: "stream.svt",
    topMatches: ["Médecine & Pharmacie", "IAV Hassan II", "Biotechnologies"],
    message: "stream.svt.msg",
    compat: 88,
  },
  {
    id: "eco",
    short: "stream.eco",
    topMatches: ["ISCAE Casablanca", "Réseau ENCG", "Al Akhawayn"],
    message: "stream.eco.msg",
    compat: 72,
  },
  {
    id: "lettres",
    short: "stream.lettres",
    topMatches: ["Droit (FSJES)", "Journalisme & Médias", "Langues & Traduction"],
    message: "stream.lettres.msg",
    compat: 65,
  },
];

export default function Hero() {
  const { t, locale } = useI18n();
  const [activeStreamId, setActiveStreamId] = useState("sm");

  // Recalculate streams when locale changes
  const BAC_STREAMS: BacStream[] = useMemo(() => BAC_STREAMS_CONFIG.map(stream => ({
    ...stream,
    name: t(stream.short),
    message: t(stream.message),
  })), [locale, t]);

  const activeStream = BAC_STREAMS.find(s => s.id === activeStreamId) || BAC_STREAMS[0];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div className="pointer-events-none absolute -top-40 end-[-10rem] -z-10 h-[520px] w-[520px] rounded-full bg-orange-400/15 blur-[110px]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Copy & actions */}
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-950/50 px-3.5 py-1 text-xs font-semibold text-orange-800 dark:text-orange-200">
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            {t("hero.title.lead")}{" "}
            <span className="text-orange-500">Rafi</span>
            {t("hero.title.trail")}
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t("home.hero.body")}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <PrimaryButton href={PRODUCT_ROUTES.register} size="lg" className="w-full sm:w-auto">
              <span>{t("hero.cta.free")}</span>
              <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </PrimaryButton>
            <SecondaryButton href="/agent" size="lg" className="w-full sm:w-auto">
              <MessageCircle className="h-5 w-5 text-orange-500" aria-hidden />
              <span>{t("nav.agent")}</span>
            </SecondaryButton>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            {[t("hero.trust.q"), t("hero.trust.schools")].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-orange-500" strokeWidth={3} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Bac stream matcher */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-900/5">
            {/* Rafi speaking */}
            <div className="flex items-start gap-3">
              <RafiLogo iconOnly size={44} className="shrink-0" />
              <p className="rounded-2xl rounded-ss-sm bg-orange-50 dark:bg-orange-950/40 px-4 py-3 text-sm font-medium leading-relaxed text-slate-800 dark:text-orange-50">
                {activeStream.message}
              </p>
            </div>

            {/* Stream switcher */}
            <p className="mt-6 mb-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t("hero.pickStream")}
            </p>
            <div className="flex flex-wrap gap-2">
              {BAC_STREAMS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStreamId(s.id)}
                  aria-pressed={activeStream.id === s.id}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    activeStream.id === s.id
                      ? "bg-slate-950 text-white dark:bg-orange-500 dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Affinity + schools */}
            <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <GraduationCap className="h-4 w-4 text-orange-500" aria-hidden />
                  {t("hero.schoolsForYou")}
                </span>
                <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                  {activeStream.compat}%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden>
                <div
                  className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
                  style={{ width: `${activeStream.compat}%` }}
                />
              </div>
              <ul className="mt-3.5 space-y-1.5">
                {activeStream.topMatches.map((school) => (
                  <li key={school} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {school}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
