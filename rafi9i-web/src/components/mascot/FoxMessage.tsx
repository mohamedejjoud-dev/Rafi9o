/**
 * Rafi9i — Rafi's 3D Speech Bubble
 * Friendly, clear dialogue balloon where Rafi speaks directly with the student.
 */
import Image from "next/image";

export interface FoxMessageProps {
  message: string;
  /** Optional 0–100 progress shown as a small bar under the text. */
  progress?: number;
  compact?: boolean;
  className?: string;
}

export default function FoxMessage({ message, progress, compact = false, className = "" }: FoxMessageProps) {
  const safe = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;

  return (
    <div
      className={`relative rounded-2xl rounded-bl-sm border border-slate-200/90 bg-white px-4 py-3 shadow-md ${
        compact ? "max-w-xs" : "max-w-md"
      } ${className}`}
    >
      {/* Speech balloon pointer */}
      <div className="absolute -left-2 bottom-3.5 h-3 w-3 -rotate-45 border-b border-l border-slate-200/90 bg-white" />

      {/* Header with Rafi's identity */}
      <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-100 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Image src="/images/rafi9i-mark.png" alt="" width={16} height={16} aria-hidden />
            Rafi
          </span>
          <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
            Guide d&apos;orientation
          </span>
        </div>
      </div>

      <p className={`leading-relaxed text-slate-700 font-medium ${compact ? "text-xs" : "text-sm"}`}>{message}</p>

      {safe !== undefined && (
        <div className="mt-2.5 flex items-center gap-2">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={safe}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${safe}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-orange-600">{safe}%</span>
        </div>
      )}
    </div>
  );
}
