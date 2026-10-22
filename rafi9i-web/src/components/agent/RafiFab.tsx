"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RafiLogo from "@/components/ui/RafiLogo";
import { useI18n } from "@/lib/i18n";

export default function RafiFab() {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname === "/agent" || pathname.startsWith("/auth")) return null;

  return (
    <Link
      href="/agent"
      className="fixed bottom-5 end-5 z-40 flex items-center gap-2 rounded-full bg-orange-600 px-3 py-2 text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-colors"
      aria-label={t("nav.agent")}
    >
      <RafiLogo iconOnly size={32} />
      <span className="hidden sm:inline text-sm font-bold pe-1">{t("nav.agent")}</span>
    </Link>
  );
}
