/**
 * Rafi9i — FeatureCard (Luminous Educational Edition)
 * Crisp white card with warm orange icon chip, slate-900 title, and readable description.
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function FeatureCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rafi-card rafi-card-hover p-6 group transition-all duration-300 border border-slate-200/80 bg-white ${className}`}>
      <span className="rafi-icon-chip group-hover:scale-110 group-hover:bg-orange-100/80 transition-all duration-300" aria-hidden>
        <Icon className="h-5 w-5 text-orange-600" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
        {children}
      </p>
    </article>
  );
}
