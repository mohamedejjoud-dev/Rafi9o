/**
 * Rafi9i — Public resources explorer (Developer 1)
 * Client island: filters the static demo resources (All / Cours /
 * Podcasts / E-books). The list itself is server-rendered on the page
 * for SEO; this only reshuffles what is already loaded.
 */
"use client";

import { useMemo, useState } from "react";
import ResourceCard, { type PublicResourceType } from "@/components/shared/ResourceCard";
import EmptyState from "@/components/shared/EmptyState";
import { PackageOpen } from "lucide-react";
import { getPublicResources } from "@/lib/demo-content";
import { useI18n } from "@/lib/i18n";

type Filter = "all" | PublicResourceType;

export default function ResourcesExplorer() {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("resources.all") },
    { value: "cours", label: t("resources.courses") },
    { value: "podcast", label: t("resources.podcasts") },
    { value: "ebook", label: t("resources.ebooks") },
  ];

  const resources = useMemo(() => getPublicResources(locale), [locale]);

  const visible = useMemo(
    () => (filter === "all" ? resources : resources.filter((r) => r.type === filter)),
    [filter, resources]
  );

  return (
    <div>
      {/* Filters */}
      <div role="group" aria-label={t("resources.filterLabel")} className="flex flex-wrap justify-center gap-2">
        {filters.map((f) => {
          const active = filter === f.value;
          const count = f.value === "all" ? resources.length : resources.filter((r) => r.type === f.value).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${
                active
                  ? "border-orange-600 bg-orange-600 text-white shadow-sm"
                  : "border-border bg-card text-foreground hover:border-orange-300 hover:text-orange-700 dark:hover:border-orange-800 dark:hover:text-orange-400"
              }`}
            >
              {f.label}
              <span className={`ms-1.5 text-xs ${active ? "text-orange-100" : "text-muted-foreground"}`} aria-hidden>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {visible.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState icon={PackageOpen} title={t("resources.empty")}>
            {t("resources.emptyBody")}
          </EmptyState>
        </div>
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        {t("resources.disclaimer")}
      </p>
    </div>
  );
}
