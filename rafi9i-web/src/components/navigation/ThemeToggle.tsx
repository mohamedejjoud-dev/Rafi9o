/**
 * Rafi9i — Theme Toggle (Dark / Light Mode)
 * Animated sun ↔ moon button.
 */
"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 overflow-hidden"
    >
      {/* Sun icon */}
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
        }`}
      />
      {/* Moon icon */}
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        }`}
      />
    </button>
  );
}
