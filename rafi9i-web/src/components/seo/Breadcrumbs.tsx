/**
 * Rafi9i — Breadcrumbs (Developer 1)
 * Visual breadcrumb trail + matching BreadcrumbList JSON-LD, so the
 * structured data always mirrors visible content.
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import JsonLd from "./JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/structured-data";

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-stone-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-stone-300" aria-hidden />}
              {isLast ? (
                <span aria-current="page" className="font-semibold text-navy-800">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="rounded transition-colors hover:text-orange-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
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
