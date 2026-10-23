/**
 * Rafi9i — Basic assessment (12 questions) (Developer 2)
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import FoxGuide from "@/components/fox/FoxGuide";
import { api, demoBackend } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useI18n } from "@/lib/i18n";
import { clearCachedOverview, readCachedOverview, writeCachedOverview } from "@/lib/assessment-cache";
import { basicSchema, type AssessmentOverview } from "@/lib/types";

/** Sentinel for failures without a server message; rendered as a translated fallback. */
const LOAD_FAILED = "__load_failed__";

export default function BasicAssessmentPage() {
  const { session, loading } = useRequireAuth();
  const { t, locale } = useI18n();
  const [overview, setOverview] = useState<AssessmentOverview | null>(null);
  const [error, setError] = useState<string>("");
  const [fetching, setFetching] = useState(true);

  const load = (useCache = true) => {
    const cached = useCache ? readCachedOverview("basic", locale) : null;
    if (cached) {
      setOverview(cached);
      setError("");
      setFetching(false);
      return;
    }
    setFetching(true);
    setError("");
    api.assessments
      .startBasic()
      .then((o) => {
        writeCachedOverview("basic", locale, o);
        setOverview(o);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : LOAD_FAILED))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    if (session) load();
  }, [session, locale]);

  if (loading || !session) return <PageLoader message={t("asm.loadingSpace")} />;

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 dark:bg-background py-8">
      <div className="mx-auto max-w-3xl">
        {fetching && <PageLoader message={t("asm.basic.preparing")} />}

        {!fetching && error && (
          <ErrorState
            title={t("asm.basic.unavailable")}
            description={error === LOAD_FAILED ? t("asm.loadError") : error}
            onRetry={() => load(false)}
            onDemoFallback={() => {
              setOverview(demoBackend.startBasic());
              setError("");
            }}
          />
        )}

        {!fetching && !error && overview && overview.completed && (
          <div className="mx-auto max-w-2xl">
            <FoxGuide
              stage="assessment"
              mood="celebrating"
              message={t("asm.basic.done")}
            />
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1 gap-2">
                <Link href="/results/free">
                  <Eye className="h-4 w-4" aria-hidden />
                  {t("asm.basic.viewResult")}
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setOverview({ ...overview, completed: false })}>
                <RefreshCcw className="h-4 w-4" aria-hidden />
                {t("asm.redo")}
              </Button>
            </div>
          </div>
        )}

        {!fetching && !error && overview && !overview.completed && (
          <AssessmentFlow
            variant="basic"
            title={t("asm.basic.title")}
            introMessage={t("asm.basic.intro")}
            loadingMessage={t("asm.basic.loading")}
            questions={overview.questions}
            schema={basicSchema}
            submit={(answers) => api.assessments.submitBasic(answers)}
            demoSubmit={(answers) => demoBackend.submitBasic(answers)}
            successRoute="/results/free"
            onSubmitted={() => {
              useAssessmentStore.getState().resetBasic();
              clearCachedOverview("basic");
            }}
          />
        )}
      </div>
    </main>
  );
}
