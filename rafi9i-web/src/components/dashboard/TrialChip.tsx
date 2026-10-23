/**
 * Rafi9i — Trial status chip with self-fetch (Developer 2)
 */
"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { api } from "@/lib/api";
import { trialBadge } from "@/lib/access";
import { useI18n } from "@/lib/i18n";
import type { TrialStatus } from "@/lib/types";

export default function TrialChip() {
  const { t } = useI18n();
  const [trial, setTrial] = useState<TrialStatus | null>(null);

  useEffect(() => {
    let alive = true;
    api.trial
      .status()
      .then((status) => alive && setTrial(status))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!trial) return null;
  const badge = trialBadge(trial, t);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.className}`}
    >
      {trial.status === "subscribed" && <Crown className="h-3.5 w-3.5" aria-hidden />}
      {badge.label}
    </span>
  );
}
