/**
 * Rafi9i — Interactive Student Console
 * -------------------------------------
 * Interactive preview of the student dashboard:
 * Tabs: Écoles & Filières, Soft Skills, Roadmap Concours.
 * Demo rates are spread out on purpose so the ranking is readable.
 */
"use client";

import { useState } from "react";
import { Check, Clock, Compass, Cpu, GraduationCap, Handshake, Mic, Puzzle, Route, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import StatusBadge from "@/components/shared/StatusBadge";
import { useI18n } from "@/lib/i18n";

type Tab = "orientation" | "skills" | "roadmap";

const TABS: { id: Tab; icon: LucideIcon; label: string }[] = [
  { id: "orientation", icon: Compass, label: "preview.tab1" },
  { id: "skills", icon: Handshake, label: "preview.tab2" },
  { id: "roadmap", icon: Route, label: "preview.tab3" },
];

function RateBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden>
      <div className="h-full rounded-full bg-orange-500" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function ProductPreview() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>("orientation");

  const schools = [
    { icon: GraduationCap, name: "UM6P Benguerir", sub: "School of Computer Science / EMINES", rate: 92, route: t("preview.admissionRoute") },
    { icon: Cpu, name: "ENSIAS / EMI Rabat", sub: t("preview.csAiNetworks"), rate: 78, route: t("preview.admissionPrepRoute") },
    { icon: Wrench, name: t("preview.ensa11"), sub: t("preview.prepIntegrated"), rate: 64, route: t("preview.estimatedThreshold") },
  ];

  const skills = [
    { icon: Puzzle, name: t("preview.problemSolving"), rate: 86 },
    { icon: Mic, name: t("preview.speaking"), rate: 58 },
    { icon: Clock, name: t("preview.timeManagement"), rate: 73 },
  ];

  const roadmap = [
    { step: t("preview.phase1"), date: `${t("preview.january")} 2026`, status: t("preview.validated"), done: true },
    { step: t("preview.phase2"), date: `${t("preview.aprilMay")} 2026`, status: t("preview.inProgress"), active: true },
    { step: t("preview.phase3"), date: `${t("preview.june")} 2026`, status: t("preview.upcoming") },
    { step: t("preview.phase4"), date: `${t("preview.july")} 2026`, status: t("preview.upcoming") },
  ];

  return (
    <section id="apercu-produit" aria-labelledby="apercu-titre" className="scroll-mt-20 py-20 sm:py-24">
      <PageContainer>
        <SectionHeading id="apercu-titre" eyebrow={t("preview.eyebrow")} title={t("preview.title")} />

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
            <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 p-1" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? "text-orange-500" : ""}`} aria-hidden />
                  <span>{t(tab.label)}</span>
                </button>
              ))}
            </div>
            <StatusBadge variant="demo" className="hidden sm:inline-flex">
              {t("preview.demo")}
            </StatusBadge>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "orientation" && (
              <div className="grid gap-5 md:grid-cols-3">
                {schools.map((school, index) => (
                  <div
                    key={school.name}
                    className={`rafi-card-hover rounded-2xl border p-5 ${
                      index === 0 ? "border-orange-300 bg-orange-50/60 dark:border-orange-800 dark:bg-orange-950/30" : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <school.icon className="h-5 w-5 text-orange-500" aria-hidden />
                      <span className="text-lg font-extrabold text-slate-950 dark:text-white">{school.rate}%</span>
                    </div>
                    <RateBar value={school.rate} />
                    <h3 className="mt-4 font-bold text-slate-950 dark:text-white">{school.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{school.sub}</p>
                    <p className="mt-4 border-t border-slate-200/70 dark:border-slate-800 pt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {school.route}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="grid gap-5 md:grid-cols-3">
                {skills.map((skill) => (
                  <div key={skill.name} className="rafi-card-hover rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center justify-between">
                      <skill.icon className="h-5 w-5 text-orange-500" aria-hidden />
                      <span className="text-lg font-extrabold text-slate-950 dark:text-white">{skill.rate}%</span>
                    </div>
                    <RateBar value={skill.rate} />
                    <h3 className="mt-4 font-bold text-slate-950 dark:text-white">{skill.name}</h3>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "roadmap" && (
              <ol className="space-y-3">
                {roadmap.map((item, index) => (
                  <li
                    key={item.step}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                      item.active
                        ? "border-orange-300 bg-orange-50/60 dark:border-orange-800 dark:bg-orange-950/30"
                        : "border-slate-200 dark:border-slate-800"
                    } ${!item.done && !item.active ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          item.done
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                            : item.active
                              ? "bg-orange-500 text-slate-950"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {item.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{item.step}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.status}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
