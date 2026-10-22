/**
 * Rafi9i — Dashboard layout: sidebar + mobile header
 */
"use client";

import Link from "next/link";
import { useRequireAuth } from "@/lib/auth-client";
import { MobileNav, SidebarNav } from "@/components/dashboard/DashboardNav";
import TrialChip from "@/components/dashboard/TrialChip";
import PageLoader from "@/components/shared/PageLoader";
import DemoBadge from "@/components/shared/DemoBadge";
import RafiLogo from "@/components/ui/RafiLogo";
import LanguageSwitcher from "@/components/navigation/LanguageSwitcher";
import ThemeToggle from "@/components/navigation/ThemeToggle";
import { useI18n } from "@/lib/i18n";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useRequireAuth();
  const { t } = useI18n();

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background">
        <PageLoader message={t("dash.opening")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-border/70 bg-sidebar px-4 py-6 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2 px-1" aria-label="Rafi9i">
          <RafiLogo size={32} className="text-stone-900 dark:text-white" />
        </Link>
        <p className="rafi-eyebrow mt-3 px-2">{t("dash.space")}</p>

        <div className="mt-6 border-y border-border/60 py-4">
          <SidebarNav />
        </div>

        <div className="mt-auto space-y-3 px-1">
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
          <TrialChip />
          <div className="rounded-2xl border border-border/60 bg-white/60 dark:bg-slate-900 p-3 backdrop-blur-sm">
            <p className="text-xs font-bold text-stone-800 dark:text-slate-100">{session.user.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-stone-400">{session.user.email}</p>
          </div>
          <DemoBadge className="w-full justify-center" />
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border/70 bg-sidebar/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center" aria-label="Rafi9i">
            <RafiLogo size={28} className="text-stone-900 dark:text-white" />
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <TrialChip />
          </div>
        </div>
        <div className="mt-2.5">
          <MobileNav />
        </div>
      </header>

      <main className="px-4 py-5 sm:px-6 lg:ms-64 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
