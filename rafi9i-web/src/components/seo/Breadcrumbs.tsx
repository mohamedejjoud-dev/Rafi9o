/**
 * Rafi9i — Breadcrumbs (Developer 1)
 * Visual breadcrumb trail + matching BreadcrumbList JSON-LD, so the
 * structured data always mirrors visible content.
 */
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import JsonLd from "./JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/structured-data";
import { useI18n } from "@/lib/i18n";

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useI18n();

  return (
    <nav aria-label={t("pub.a11y.breadcrumb")} className="mb-6">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 rtl:rotate-180" aria-hidden />}
              {isLast ? (
                <span aria-current="page" className="font-semibold text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="rounded transition-colors hover:text-orange-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:hover:text-orange-400"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
