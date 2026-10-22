/**
 * Rafi9i — PublicNavbar
 * Features: New Fox+RAFI9I logo, Language switcher (FR/EN/AR), Dark/Light toggle, i18n labels.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, onSessionChange } from "@/lib/api";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { PrimaryButton } from "@/components/shared/Buttons";
import MobileNavigation from "./MobileNavigation";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import RafiLogo from "@/components/ui/RafiLogo";
import { useI18n } from "@/lib/i18n";
import { Bot } from "lucide-react";

const NAV_LINKS = [
  { href: "/orientation",  key: "nav.orientation" },
  { href: "/soft-skills",  key: "nav.softSkills" },
  { href: "/resources",    key: "nav.resources" },
  { href: "/pricing",      key: "nav.pricing" },
  { href: "/about",        key: "nav.about" },
] as const;

export default function PublicNavbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setLoggedIn(Boolean(getSession()));
    setMounted(true);
    return onSessionChange(() => setLoggedIn(Boolean(getSession())));
  }, []);

  const linkClasses = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-orange-500 ${
      active
        ? "text-orange-600 bg-orange-50/80 dark:bg-orange-900/20 dark:text-orange-400 shadow-2xs font-bold"
        : "text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xs">
      <nav aria-label="Navigation principale" className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* ── Brand Logo ── */}
        <Link
          href="/"
          className="flex items-center rounded-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-orange-500"
          aria-label="Rafi9i — retour à l'accueil"
        >
          <RafiLogo size={36} className="text-slate-900 dark:text-white" />
        </Link>

        {/* ── Desktop Nav Links ── */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClasses(link.href)} aria-current={pathname === link.href ? "page" : undefined}>
                {t(link.key)}
              </Link>
            </li>
          ))}
          {/* Rafi AI Agent link */}
          <li>
            <Link href="/agent" className={linkClasses("/agent")}>
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                {t("nav.agent")}
              </span>
            </Link>
          </li>
        </ul>

        {/* ── Controls Bar ── */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Auth buttons — desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            {mounted && loggedIn ? (
              <PrimaryButton href={PRODUCT_ROUTES.dashboard} size="sm">
                {t("nav.dashboard")}
              </PrimaryButton>
            ) : (
              <>
                <Link
                  href={PRODUCT_ROUTES.login}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-orange-500"
                >
                  {t("nav.login")}
                </Link>
                <PrimaryButton href={PRODUCT_ROUTES.register} size="sm">
                  {t("nav.start")}
                </PrimaryButton>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="lg:hidden">
            <MobileNavigation loggedIn={mounted && loggedIn} />
          </div>
        </div>
      </nav>
    </header>
  );
}
