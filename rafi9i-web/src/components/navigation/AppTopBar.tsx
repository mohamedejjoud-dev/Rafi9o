/**
 * Rafi9i — Minimal top bar for focused flows (assessment, results, Premium)
 * that have no full navbar: brand, a back button, language and theme.
 */
"use client";

import Link from "next/link";
import BackButton from "@/components/shared/BackButton";
import LanguageSwitcher from "@/components/navigation/LanguageSwitcher";
import ThemeToggle from "@/components/navigation/ThemeToggle";
import RafiLogo from "@/components/ui/RafiLogo";
import { useI18n } from "@/lib/i18n";

/** `showBack` is off where the page has its own back control (assessment flow). */
export default function AppTopBar({ showBack = true }: { showBack?: boolean }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          {showBack && <BackButton size="sm" />}
          <Link href="/" aria-label={t("brand.name")} className={showBack ? "hidden sm:inline-flex" : "inline-flex"}>
            <RafiLogo size={28} />
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
