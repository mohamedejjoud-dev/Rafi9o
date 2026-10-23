/**
 * Rafi9i — Auth shell (Developer 2)
 * ----------------------------------
 * Shared frame for the login / register screens: a warm brand panel
 * (desktop) with the fox, the promise and a subtle zellige-inspired
 * pattern, next to the form column. Mobile stacks a compact brand bar.
 */
"use client";

import { Compass, Map, Sprout } from "lucide-react";
import LanguageSwitcher from "@/components/navigation/LanguageSwitcher";
import ThemeToggle from "@/components/navigation/ThemeToggle";
import RafiLogo from "@/components/ui/RafiLogo";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const PROMISES = [
  {
    icon: Compass,
    key: "auth.promise1",
  },
  {
    icon: Sprout,
    key: "auth.promise2",
  },
  {
    icon: Map,
    key: "auth.promise3",
  },
];

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-orange-50 via-white to-stone-50 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:bg-white dark:bg-background dark:bg-none dark:lg:bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:hidden">
        <Link href="/" aria-label={t("pub.a11y.homeLink")} className="shrink-0">
          <RafiLogo size={42} />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher compact />
        </div>
      </header>

      <section
        aria-label={t("auth.subtitle")}
        className="relative hidden min-h-[100svh] overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 lg:flex lg:flex-col"
      >
        {/* Zellige-inspired decorative layers */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(255,246,239,0.9) 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute -start-24 -top-24 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute -bottom-32 -end-16 h-[28rem] w-[28rem] rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-1 flex-col justify-between p-8 xl:p-14">
          <Link href="/" aria-label={t("pub.a11y.homeLink")} className="w-fit rounded-2xl bg-white px-4 py-2.5 shadow-lg">
            <RafiLogo size={44} />
          </Link>

          <div className="max-w-xl py-12">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-100">
              {t("auth.subtitle")}
            </p>
            <h2 className="font-display text-4xl font-semibold leading-tight text-white xl:text-5xl">
              {t("auth.title")}
              <br />
              <span className="italic text-amber-200">{t("auth.titleItalic")}</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {PROMISES.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-start gap-3 text-sm leading-relaxed text-orange-50">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    <Icon className="h-4 w-4 text-white" aria-hidden />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs font-semibold text-orange-100">{t("auth.footer")}</p>
        </div>
      </section>

      <section className="relative flex min-h-[calc(100svh-74px)] flex-col items-center justify-center px-4 pb-10 pt-2 sm:px-8 sm:pb-14 lg:min-h-[100svh] lg:px-10 lg:py-16 xl:px-16">
        <div className="absolute end-6 top-6 hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher compact />
        </div>
        <div className="w-full max-w-[440px]">{children}</div>
      </section>
    </main>
  );
}
