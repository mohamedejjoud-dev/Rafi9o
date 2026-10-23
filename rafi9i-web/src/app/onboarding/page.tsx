/**
 * Rafi9i — Onboarding: quick profile personalization (Developer 2)
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import PageLoader from "@/components/shared/PageLoader";
import { api } from "@/lib/api";
import { useRequireAuth, updateSessionUser } from "@/lib/auth-client";
import { BASIC_QUESTIONS } from "@/lib/mocks";
import { useI18n } from "@/lib/i18n";

export default function OnboardingPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [city, setCity] = useState<string>("");
  const [bacStream, setBacStream] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) setName(session.user.name ?? "");
  }, [session]);

  if (loading || !session) return <PageLoader message={t("asm.loadingSpace")} />;

  const cityOptions = BASIC_QUESTIONS.find((q) => q.id === "city")?.options ?? [];
  const streamOptions = BASIC_QUESTIONS.find((q) => q.id === "bacStream")?.options ?? [];

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "asm.onb.err.name";
    if (!city) nextErrors.city = "asm.onb.err.city";
    if (!bacStream) nextErrors.bacStream = "asm.onb.err.stream";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      const updated = await api.profile.update({
        name: name.trim(),
        city,
        bacStream,
        onboardingCompleted: true,
      });
      updateSessionUser(updated);
      router.push("/assessment/basic");
    } catch {
      setErrors({ form: "asm.onb.err.form" });
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50/50 px-4 py-10 dark:bg-background">
      <div className="w-full max-w-lg">
        <DemoBadge className="mb-4" />
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <FoxGuide
            stage="onboarding"
            mood="celebrating"
            message={
              session.user.name
                ? t("asm.onb.welcomeNamed", { name: session.user.name.split(" ")[0] })
                : t("asm.onb.welcome")
            }
          />

          <h1 className="mt-6 text-xl font-bold text-foreground">{t("asm.onb.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("asm.onb.subtitle")}
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("asm.onb.name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("asm.onb.namePlaceholder")}
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{t(errors.name)}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">{t("asm.onb.city")}</Label>
              <Select value={city} onValueChange={(v) => { setCity(v); setErrors((e) => ({ ...e, city: "" })); }}>
                <SelectTrigger id="city" aria-label={t("asm.onb.cityPlaceholder")}>
                  <SelectValue placeholder={t("asm.onb.cityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.emoji} {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{t(errors.city)}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bacStream">{t("asm.onb.stream")}</Label>
              <Select value={bacStream} onValueChange={(v) => { setBacStream(v); setErrors((e) => ({ ...e, bacStream: "" })); }}>
                <SelectTrigger id="bacStream" aria-label={t("asm.onb.streamPlaceholder")}>
                  <SelectValue placeholder={t("asm.onb.streamPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {streamOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.emoji} {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bacStream && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{t(errors.bacStream)}</p>}
            </div>

            {errors.form && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {t(errors.form)}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                onClick={submit}
                disabled={busy}
                className="flex-1 gap-2"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />}
                {t("asm.onb.submit")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/assessment/basic")}
                disabled={busy}
              >
                {t("asm.onb.skip")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
