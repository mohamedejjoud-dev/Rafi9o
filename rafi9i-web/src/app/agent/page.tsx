/**
 * Rafi9i — /agent — Rafi AI Agent Page
 */
"use client";

import { useState } from "react";
import { Bot, Brain, Target, Zap, GraduationCap, MessageCircle } from "lucide-react";
import PublicNavbar from "@/components/navigation/PublicNavbar";
import PublicFooter from "@/components/navigation/PublicFooter";
import RafiAgentChat from "@/components/agent/RafiAgentChat";
import { useI18n } from "@/lib/i18n";
import type { StudentProfile } from "@/lib/rafi-agent";
import RafiFox from "@/components/mascot/RafiFox";
import RafiLogo from "@/components/ui/RafiLogo";

const BAC_STREAMS = [
  { id: "sm", color: "#f88541" },
  { id: "pc", color: "#0284c7" },
  { id: "svt", color: "#059669" },
  { id: "eco", color: "#7c3aed" },
  { id: "lettres", color: "#db2777" },
] as const;

const FEATURES = [
  { icon: Brain, label: "ai.feat.analyze", desc: "ai.feat.analyze.desc" },
  { icon: Zap, label: "ai.feat.quiz", desc: "ai.feat.quiz.desc" },
  { icon: Target, label: "ai.feat.challenge", desc: "ai.feat.challenge.desc" },
  { icon: GraduationCap, label: "ai.feat.fields", desc: "ai.feat.fields.desc" },
  { icon: MessageCircle, label: "ai.feat.talk", desc: "ai.feat.talk.desc" },
  { icon: Bot, label: "ai.feat.always", desc: "ai.feat.always.desc" },
] as const;

export default function AgentPage() {
  const { t, dir } = useI18n();
  const [profile, setProfile] = useState<StudentProfile>({});
  const selectedStream = profile.bacStream;

  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen bg-background" dir={dir}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-8 flex flex-col items-center text-center gap-4">
            <RafiFox mood="encouraging" size={110} decorative />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t("ai.title")}
              </h1>
              <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                {t("ai.subtitle")}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 self-center me-1">{t("ai.stream")}</span>
            {BAC_STREAMS.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => setProfile((p) => ({ ...p, bacStream: stream.id }))}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all border-2 ${
                  selectedStream === stream.id
                    ? "text-white shadow-md scale-105"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:scale-105"
                }`}
                style={selectedStream === stream.id ? { backgroundColor: stream.color, borderColor: stream.color } : {}}
              >
                {t(`stream.${stream.id}`)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col" style={{ height: "600px" }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="relative">
                    <RafiLogo iconOnly size={36} />
                    <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Rafi</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t("ai.online")}</p>
                  </div>
                  {selectedStream && (
                    <span className="ms-auto text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                      {t(`stream.${selectedStream}`)}
                    </span>
                  )}
                </div>
                <RafiAgentChat profile={profile} onProfileChange={setProfile} className="flex-1 min-h-0" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-orange-500" />
                  {t("ai.canDo")}
                </h2>
                <div className="space-y-3">
                  {FEATURES.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800">
                        <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t(label)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/10 p-5">
                <p className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-2">💡 {t("ai.try")}</p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">→</span> {t("ai.quick.quiz")}</li>
                  <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">→</span> {t("ai.quick.analyze")}</li>
                  <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">→</span> {t("ai.quick.challenge")}</li>
                  <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">→</span> {t("ai.quick.fields")}</li>
                  <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">→</span> {t("ai.quick.ask")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
