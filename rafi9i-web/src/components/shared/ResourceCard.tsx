/**
 * Rafi9i — public ResourceCard (Luminous Educational Edition)
 * Clean white resource card with orange badges and clear metadata.
 */
"use client";

import { BookMarked, BookOpen, Clock, Mic } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useI18n } from "@/lib/i18n";

export type PublicResourceType = "cours" | "podcast" | "ebook";

export interface PublicResource {
  type: PublicResourceType;
  title: string;
  description: string;
  duration: string;
  topic: string;
  access: "free" | "premium";
}

const TYPE_ICONS = { cours: BookOpen, podcast: Mic, ebook: BookMarked } as const;

export default function ResourceCard({ resource }: { resource: PublicResource }) {
  const { t } = useI18n();
  const Icon = TYPE_ICONS[resource.type];
  const typeLabels: Record<PublicResourceType, string> = {
    cours: t("resources.courseLabel"),
    podcast: t("resources.podcastLabel"),
    ebook: t("resources.ebookLabel"),
  };
  return (
    <article className="rafi-card rafi-card-hover flex h-full flex-col p-6 border border-slate-200 bg-white group">
      <div className="flex items-center justify-between gap-2">
        <span className="rafi-icon-chip group-hover:scale-110 transition-transform" aria-hidden>
          <Icon className="h-5 w-5 text-orange-600" />
        </span>
        <div className="flex items-center gap-1.5">
          <StatusBadge variant={resource.access === "free" ? "free" : "premium"} />
        </div>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-orange-700">
        {typeLabels[resource.type]}
      </p>
      <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900 group-hover:text-orange-600 transition-colors">
        {resource.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{resource.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3.5 text-xs text-slate-500 font-medium">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-orange-500" aria-hidden /> {resource.duration}
        </span>
        <span aria-hidden>·</span>
        <span className="text-slate-700">{resource.topic}</span>
      </div>
    </article>
  );
}
