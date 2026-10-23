/**
 * Rafi9i — Language bar (FR / EN / AR) with RTL support.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n, LOCALES, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  if (compact) {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={t("lang.choose")}
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <Globe className="h-3.5 w-3.5 opacity-70" />
          <span className="uppercase">{current.code}</span>
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute top-full mt-1.5 end-0 z-50 min-w-[148px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
          >
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                type="button"
                role="option"
                aria-selected={loc.code === locale}
                onClick={() => select(loc.code)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-start ${
                  loc.code === locale
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{loc.nativeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("lang.choose")}
      className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900 p-0.5"
    >
      {LOCALES.map((loc) => (
        <button
          key={loc.code}
          type="button"
          role="radio"
          aria-checked={loc.code === locale}
          onClick={() => select(loc.code)}
          className={`rounded-lg px-2 py-1 text-[11px] font-bold tracking-wide transition-all ${
            loc.code === locale
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          {loc.code === "ar" ? "عربي" : loc.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
