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
import { FIELDS_CATALOG, RESOURCES_CATALOG } from "@/lib/mocks";

export default function SavedPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();

  if (loading || !session) return <PageLoader message="Chargement…" />;

  const savedFields = FIELDS_CATALOG.filter((f) => store.savedFields.includes(f.id));
  const savedResources = RESOURCES_CATALOG.filter((r) => store.savedResources.includes(r.id));

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-stone-900">
            <span className="rafi-icon-chip">
              <Bookmark className="h-5 w-5" aria-hidden />
            </span>
            Favoris
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">Les domaines et ressources que tu as enregistrés.</p>
        </div>
        <DemoBadge />
      </header>

      {/* Saved fields */}
      <section aria-labelledby="saved-fields">
        <h2 id="saved-fields" className="text-sm font-bold text-stone-900">Domaines enregistrés</h2>
        {savedFields.length === 0 ? (
          <div className="mt-2.5 rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-center">
            <p className="text-sm text-stone-500">Aucun domaine enregistré.</p>
            <Button asChild variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-orange-700">
              <Link href="/dashboard/orientation">
                Explorer mes pistes <ArrowRight className="h-3 w-3" aria-hidden />
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
        <h2 id="saved-resources" className="text-sm font-bold text-stone-900">Ressources enregistrées</h2>
        {savedResources.length === 0 ? (
          <div className="mt-2.5 rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-center">
            <p className="text-sm text-stone-500">Aucune ressource enregistrée.</p>
            <Button asChild variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-orange-700">
              <Link href="/results/premium">
                Découvrir mes ressources <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-2.5 space-y-2.5">
            {savedResources.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                    {r.type === "course" ? "Cours" : r.type === "podcast" ? "Podcast" : "E-book"} · {r.duration}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-stone-900">{r.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-stone-600">{r.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => store.toggleSavedResource(r.id)}
                  className="shrink-0 rounded-full border border-stone-200 p-2 text-stone-400 hover:border-red-200 hover:text-red-600"
                  aria-label={`Retirer « ${r.title} » des favoris`}
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
        className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        aria-labelledby="schools-soon"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100">
            <School className="h-5 w-5 text-stone-400" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="schools-soon" className="text-sm font-bold text-stone-900">
                Annuaire des établissements
              </h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
                Bientôt disponible
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              Compare les écoles et universités du Maroc (frais, admission, avis d&apos;étudiants) et enregistre tes
              établissements cibles — cette section arrive dans une prochaine version du MVP.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
