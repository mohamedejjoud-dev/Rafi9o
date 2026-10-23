/**
 * Rafi9i — LoadingSkeleton (Developer 1 design system)
 * Lightweight pulse placeholder for below-the-fold or deferred content.
 */
export default function LoadingSkeleton({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-full bg-muted"
          style={{ width: `${100 - ((i * 13) % 40)}%` }}
        />
      ))}
    </div>
  );
}
