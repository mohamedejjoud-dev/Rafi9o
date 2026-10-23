/**
 * Rafi9i — Mobile navigation sheet
 */
"use client";

import Link from "next/link";
import { Menu, Bot } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { PrimaryButton } from "@/components/shared/Buttons";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import RafiLogo from "@/components/ui/RafiLogo";
import { useI18n } from "@/lib/i18n";

const NAV_LINKS = [
  { href: "/orientation", key: "nav.orientation" },
  { href: "/soft-skills", key: "nav.softSkills" },
  { href: "/resources", key: "nav.resources" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/about", key: "nav.about" },
  { href: "/agent", key: "nav.agent" },
] as const;

export default function MobileNavigation({ loggedIn }: { loggedIn: boolean }) {
  const { t, dir } = useI18n();

  return (
    <Sheet>
      <SheetTrigger
        aria-label={t("nav.menu")}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs transition-colors hover:border-orange-300 hover:text-orange-600 lg:hidden cursor-pointer"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-80 overflow-y-auto bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <SheetHeader>
          <SheetTitle className="text-start">
            <RafiLogo size={32} className="text-slate-900 dark:text-white" />
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex items-center gap-2 px-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
        <nav aria-label={t("nav.menu")} className="mt-4 flex flex-col gap-1.5 px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-700 dark:hover:text-orange-300"
            >
              {link.href === "/agent" ? (
                <span className="inline-flex items-center gap-2">
                  <Bot className="h-4 w-4" aria-hidden />
                  {t(link.key)}
                </span>
              ) : (
                t(link.key)
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-6 space-y-3 border-t border-slate-100 dark:border-slate-800 px-2 pt-6">
          {loggedIn ? (
            <PrimaryButton href={PRODUCT_ROUTES.dashboard} className="w-full" size="md">
              {t("nav.dashboard")}
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton href={PRODUCT_ROUTES.register} className="w-full" size="md">
                {t("nav.start")}
              </PrimaryButton>
              <Link
                href={PRODUCT_ROUTES.login}
                className="block rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t("nav.login")}
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
