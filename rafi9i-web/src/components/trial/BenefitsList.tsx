/**
 * Rafi9i — Premium Preview benefits list (Developer 2)
 */
"use client";

import {
  Brain,
  ClipboardList,
  Crown,
  FileBarChart2,
  Library,
  Map,
} from "lucide-react";

const BENEFITS = [
  {
    icon: ClipboardList,
    title: "Évaluation approfondie",
    description: "10 questions supplémentaires : environnement, mobilité, obstacles, priorités.",
  },
  {
    icon: FileBarChart2,
    title: "Résultat détaillé en 4 sections",
    description: "Orientation, soft skills, ressources et parcours complet avec scores détaillés.",
  },
  {
    icon: Brain,
    title: "3 soft skills prioritaires",
    description: "Niveau actuel, pourquoi c'est important et une action pratique par semaine.",
  },
  {
    icon: Library,
    title: "10 ressources adaptées",
    description: "Cours, podcasts et e-books choisis pour ton profil, avec suivi de complétion.",
  },
  {
    icon: Map,
    title: "Parcours en 4 étapes",
    description: "Explorer, apprendre, pratiquer, préparer — ton plan d'action jusqu'aux candidatures.",
  },
];

export default function BenefitsList({ columns = 1 }: { columns?: 1 | 2 }) {
  return (
    <ul className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {BENEFITS.map((b) => (
        <li key={b.title} className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
            <b.icon className="h-4.5 w-4.5 text-orange-600" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">{b.title}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{b.description}</p>
          </div>
        </li>
      ))}
      <li className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 sm:col-span-full">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <Crown className="h-4.5 w-4.5 text-amber-600" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-amber-900">Sans carte bancaire</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
            3 jours d&apos;accès complet, gratuitement. À la fin, tu reviens automatiquement au plan gratuit.
          </p>
        </div>
      </li>
    </ul>
  );
}
