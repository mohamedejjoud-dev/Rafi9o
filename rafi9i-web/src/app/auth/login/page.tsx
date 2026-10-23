/**
 * Rafi9i — Login page (Developer 2)
 * Includes a one-click demo account for presentations.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/shared/AuthShell";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import { login, useRedirectIfAuthenticated } from "@/lib/auth-client";
import { DEMO_CREDENTIALS } from "@/lib/mocks";
import type { UserProfile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

/** Validation messages are translation keys, translated at render time. */
const schema = z.object({
  email: z.string().min(1, "pub.auth.err.emailRequired").email("pub.auth.err.emailInvalid"),
  password: z.string().min(1, "pub.auth.err.passwordRequired"),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const { t } = useI18n();
  const form = useForm<Values>({ defaultValues: { email: "", password: "" } });
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<"form" | "demo" | null>(null);

  const goToNext = (user: UserProfile) => router.push(user.onboardingCompleted ? "/dashboard" : "/onboarding");

  const onSubmit = form.handleSubmit((values) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        form.setError(String(issue.path[0]) as keyof Values, { message: issue.message })
      );
      return;
    }
    setBusy("form");
    setFormError("");
    login(values)
      .then(goToNext)
      .catch((e: unknown) => {
        setFormError(e instanceof Error ? e.message : t("pub.auth.err.loginFailed"));
        setBusy(null);
      });
  });

  const demoLogin = () => {
    setBusy("demo");
    setFormError("");
    login(DEMO_CREDENTIALS)
      .then(goToNext)
      .catch((e: unknown) => {
        setFormError(e instanceof Error ? e.message : t("pub.auth.err.demoFailed"));
        setBusy(null);
      });
  };

  return (
    <AuthShell>
      <FoxGuide
        stage="auth"
        mood="encouraging"
        compact
        message={t("login.welcomeBack")}
      />

      <div className="rafi-card mt-5 rounded-3xl border border-border bg-card/95 p-5 shadow-xl shadow-orange-950/5 backdrop-blur sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{t("login.title")}</h1>
          <DemoBadge />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link href="/auth/register" className="font-semibold text-orange-700 hover:underline dark:text-orange-400">
              {t("login.createAccount")}
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{t(form.formState.errors.email.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{t(form.formState.errors.password.message ?? "")}</p>
              )}
            </div>

            {formError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={busy !== null}
              className="h-11 w-full gap-2"
            >
              {busy === "form" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogIn className="h-4 w-4" aria-hidden />}
              {t("login.connect")}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/30">
            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t("login.demoAccount")}
            </p>
            <p className="mt-1 break-all text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password} — {t("login.demoText")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={demoLogin}
              disabled={busy !== null}
              className="mt-3 h-auto min-h-9 w-full gap-1.5 whitespace-normal border-amber-300 bg-card px-3 py-2 text-amber-800 hover:bg-amber-100 sm:w-auto dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/50"
            >
              {busy === "demo" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {t("login.demoButton")}
            </Button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">{t("auth.tagline")}</p>
    </AuthShell>
  );
}
