/**
 * Rafi9i — Dashboard navigation
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Bot,
  Brain,
  Compass,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

const DASHBOARD_NAV = [
  { href: "/dashboard", key: "dash.home", icon: LayoutDashboard },
  { href: "/dashboard/orientation", key: "dash.orientation", icon: Compass },
  { href: "/dashboard/soft-skills", key: "dash.soft", icon: Brain },
  { href: "/dashboard/roadmap", key: "dash.roadmap", icon: Map },
  { href: "/dashboard/progress", key: "dash.progress", icon: TrendingUp },
  { href: "/dashboard/saved", key: "dash.saved", icon: Bookmark },
  { href: "/agent", key: "nav.agent", icon: Bot },
  { href: "/dashboard/settings", key: "dash.settings", icon: Settings },
] as const;

const ADMIN_NAV_ITEM = { href: "/dashboard/admin", key: "admin.nav", icon: ShieldCheck };

/** Admins also get the Premium management page. */
function useNavItems() {
  const { session } = useSession();
  return session?.user.role === "admin" ? [...DASHBOARD_NAV, ADMIN_NAV_ITEM] : DASHBOARD_NAV;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = useNavItems();
  return (
    <nav aria-label={t("dash.home")} className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
              active
                ? "bg-gradient-to-r from-orange-100 to-amber-100/60 dark:from-orange-950/70 dark:to-amber-950/40 font-bold text-orange-900 dark:text-orange-200 shadow-[inset_0_0_0_1px_rgba(192,80,45,0.18)]"
                : "font-medium text-stone-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-800 dark:hover:text-orange-300",
            ].join(" ")}
          >
            <item.icon
              className={["h-4.5 w-4.5 shrink-0 transition-transform duration-200", !active && "group-hover:scale-110"].join(" ")}
              aria-hidden
            />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = useNavItems();
  return (
    <nav aria-label={t("dash.home")} className="flex gap-1.5 overflow-x-auto pb-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
              active
                ? "border-orange-500/40 bg-gradient-to-r from-orange-100 to-amber-100/70 dark:from-orange-950 dark:to-amber-950 font-bold text-orange-900 dark:text-orange-200"
                : "border-stone-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 font-medium text-stone-600 dark:text-slate-300 hover:border-orange-300 hover:text-orange-700",
            ].join(" ")}
          >
            <item.icon className="h-3.5 w-3.5" aria-hidden />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
