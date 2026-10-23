/**
 * Rafi9i — Public footer
 */
"use client";

import Link from "next/link";
import RafiLogo from "@/components/ui/RafiLogo";
import { useI18n } from "@/lib/i18n";

export default function PublicFooter() {
  const year = new Date().getFullYear();
  const { t } = useI18n();

  const groups = [
    {
      title: t("footer.product"),
      links: [
        { href: "/orientation", label: t("nav.orientation") },
        { href: "/soft-skills", label: t("nav.softSkills") },
        { href: "/resources", label: t("nav.resources") },
        { href: "/pricing", label: t("nav.pricing") },
        { href: "/agent", label: t("nav.agent") },
        { href: "/auth/register", label: t("footer.account") },
      ],
    },
    {
      title: t("footer.info"),
      links: [
        { href: "/legal/privacy", label: t("footer.privacy") },
        { href: "/legal/terms", label: t("footer.terms") },
        { href: "/about", label: t("nav.about") },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-stone-950 text-stone-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex" aria-label={t("pub.a11y.homeLink")}>
            <RafiLogo size={36} onDark />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-300">
            {t("footer.tagline")}
          </p>
          <p className="mt-4 text-xs text-stone-300">rafi9i.co.uk</p>
        </div>

        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-300">{group.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-300 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-orange-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-stone-800 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 text-xs leading-relaxed text-stone-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {year} {t("brand.name")}. {t("footer.rights")}</p>
          <p className="max-w-xl">{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
