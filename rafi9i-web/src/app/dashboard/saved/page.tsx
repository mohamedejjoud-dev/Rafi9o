/**
 * Rafi9i — Dashboard · Saved items (Developer 2)
 * Saved fields, saved resources + "schools" coming-soon placeholder.
 */
"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkX, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoBadge from "@/components/shared/DemoBadge";
import PageLoader from "@/components/shared/PageLoader";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useI18n } from "@/lib/i18n";
import { FIELDS_CATALOG, RESOURCES_CATALOG } from "@/lib/mocks";

export default function SavedPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const { t } = useI18n();

  if (loading || !session) return <PageLoader message={t("dsh.loading")} />;

  const savedFields = FIELDS_CATALOG.filter((f) => store.savedFields.includes(f.id));
  const savedResources = RESOURCES_CATALOG.filter((r) => store.savedResources.includes(r.id));

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="rafi-icon-chip">
              <Bookmark className="h-5 w-5" aria-hidden />
            </span>
            {t("dash.saved")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dsh.saved.subtitle")}</p>
        </div>
        <DemoBadge />
      </header>

      {/* Saved fields */}
      <section aria-labelledby="saved-fields">
        <h2 id="saved-fields" className="text-sm font-bold text-foreground">{t("dsh.saved.fields")}</h2>
        {savedFields.length === 0 ? (
          <div className="mt-2.5 rounded-2xl border border-dashed border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">{t("dsh.saved.noFields")}</p>
            <Button asChild variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-orange-700 dark:text-orange-400">
              <Link href="/dashboard/orientation">
                {t("dsh.saved.exploreLink")} <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-2.5 space-y-3">
            {savedFields.map((f) => (
              <FieldMatchCard
                key={f.id}
                field={f}
                saved
                onToggleSave={() => store.toggleSavedField(f.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Saved resources */}
      <section aria-labelledby="saved-resources">
        <h2 id="saved-resources" className="text-sm font-bold text-foreground">{t("dsh.saved.resources")}</h2>
        {savedResources.length === 0 ? (
          <div className="mt-2.5 rounded-2xl border border-dashed border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">{t("dsh.saved.noResources")}</p>
            <Button asChild variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-orange-700 dark:text-orange-400">
              <Link href="/results/premium">
                {t("dsh.saved.discoverLink")} <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-2.5 space-y-2.5">
            {savedResources.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {t(`dsh.type.${r.type}`)} · {r.duration}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-foreground">{r.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => store.toggleSavedResource(r.id)}
                  className="shrink-0 rounded-full border border-border p-2 text-muted-foreground hover:border-red-200 hover:text-red-600 dark:hover:border-red-900/60 dark:hover:text-red-400"
                  aria-label={t("dsh.res.remove", { title: r.title })}
                >
                  <BookmarkX className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Schools — coming soon */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
        aria-labelledby="schools-soon"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <School className="h-5 w-5 text-muted-foreground" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="schools-soon" className="text-sm font-bold text-foreground">
                {t("dsh.saved.schools")}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t("dsh.comingSoon")}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("dsh.saved.schoolsBody")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
