/**
 * Rafi9i — Demonstration tools for the trial (Developer 2)
 * Lets a reviewer toggle every trial state + simulate an AI failure.
 * Clearly identified as demo-only UI; harmless in production.
 */
"use client";

import { useEffect, useState } from "react";
import { Bug, Clock, Crown, FlaskConical, RotateCcw, Timer, TimerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  isAiFailureSimulated,
  requestPremium,
  resetAllDemoData,
  resetTrial,
  setAiFailureSimulated,
  simulateExpiredTrial,
  simulateSubscribed,
  startTrial,
} from "@/lib/mocks";
import { useI18n } from "@/lib/i18n";

export default function DemoTrialTools({ onChanged }: { onChanged: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [aiFail, setAiFail] = useState(false);

  useEffect(() => {
    setAiFail(isAiFailureSimulated());
  }, []);

  const run = (fn: () => void, message: string) => {
    fn();
    toast({ title: t("pub.demoTools.toastTitle"), description: message });
    onChanged();
  };

  return (
    <details className="rounded-xl border border-dashed border-border bg-muted p-3 text-muted-foreground">
      <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
        <FlaskConical className="h-4 w-4" aria-hidden />
        {t("pub.demoTools.summary")}
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => startTrial(), t("pub.demoTools.trialActiveDone"))}
        >
          <Timer className="h-4 w-4" aria-hidden /> {t("pub.demoTools.trialActive")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => simulateExpiredTrial(), t("pub.demoTools.expireDone"))}
        >
          <TimerOff className="h-4 w-4" aria-hidden /> {t("pub.demoTools.expire")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => simulateSubscribed(), t("pub.demoTools.premiumDone"))}
        >
          <Crown className="h-4 w-4" aria-hidden /> {t("pub.demoTools.premium")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => requestPremium(), t("pub.demoTools.pendingDone"))}
        >
          <Clock className="h-4 w-4" aria-hidden /> {t("pub.demoTools.pending")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => resetTrial(), t("pub.demoTools.resetTrialDone"))}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> {t("pub.demoTools.resetTrial")}
        </Button>
        <Button
          variant={aiFail ? "default" : "outline"}
          size="sm"
          className={`gap-1.5 ${aiFail ? "bg-red-600 text-white hover:bg-red-700" : ""}`}
          onClick={() => {
            const next = !isAiFailureSimulated();
            setAiFailureSimulated(next);
            setAiFail(next);
            toast({
              title: t("pub.demoTools.toastTitle"),
              description: next
                ? t("pub.demoTools.aiFailOnDone")
                : t("pub.demoTools.aiFailOffDone"),
            });
          }}
        >
          <Bug className="h-4 w-4" aria-hidden /> {aiFail ? t("pub.demoTools.aiFailOff") : t("pub.demoTools.aiFailOn")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => resetAllDemoData(), t("pub.demoTools.resetAllDone"))}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> {t("pub.demoTools.resetAll")}
        </Button>
      </div>
    </details>
  );
}
