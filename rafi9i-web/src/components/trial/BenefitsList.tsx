/**
 * Rafi9i — Premium benefits list
 */
"use client";

import { Bot, ClipboardList, FileBarChart2, Brain, Map, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const BENEFITS = [
  { icon: ClipboardList, key: "premium.benefit.1" },
  { icon: FileBarChart2, key: "premium.benefit.2" },
  { icon: Bot, key: "premium.benefit.3" },
  { icon: Brain, key: "premium.benefit.4" },
  { icon: Map, key: "premium.benefit.5" },
] as const;

export default function BenefitsList({ columns = 1 }: { columns?: 1 | 2 }) {
  const { t } = useI18n();

  return (
    <ul className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {BENEFITS.map((b) => (
        <li
          key={b.key}
          className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <b.icon className="h-4.5 w-4.5 text-orange-600 dark:text-orange-400" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white">{t(`${b.key}.title`)}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-slate-400">{t(`${b.key}.text`)}</p>
          </div>
        </li>
      ))}
      <li className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 sm:col-span-full dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <MessageCircle className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{t("premium.benefit.pay.title")}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">{t("premium.benefit.pay.text")}</p>
        </div>
      </li>
    </ul>
  );
}
