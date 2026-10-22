/**
 * Rafi9i — Register page (Developer 2)
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/shared/AuthShell";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import { register, useRedirectIfAuthenticated } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

const schema = z
  .object({
    name: z.string().min(2, "Indique ton nom complet."),
    email: z.string().min(1, "Email requis.").email("Adresse email invalide."),
    password: z.string().min(6, "Au moins 6 caractères."),
    confirm: z.string().min(1, "Confirme ton mot de passe."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const { t } = useI18n();
  const form = useForm<Values>({ defaultValues: { name: "", email: "", password: "", confirm: "" } });
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = form.handleSubmit((values) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        form.setError(String(issue.path[0]) as keyof Values, { message: issue.message })
      );
      return;
    }
    setBusy(true);
    setFormError("");
    register({
      name: values.name,
      email: values.email,
      password: values.password,
      password_confirmation: values.confirm,
    })
      .then(() => router.push("/onboarding"))
      .catch((e: unknown) => {
        setFormError(e instanceof Error ? e.message : "Inscription impossible pour le moment.");
        setBusy(false);
      });
  });

  return (
    <AuthShell>
      <FoxGuide
        stage="auth"
        mood="celebrating"
        compact
        message={t("auth.register.welcome")}
      />

      <div className="rafi-card mt-5 rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-orange-950/5 backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">{t("auth.register.title")}</h1>
          <DemoBadge />
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {t("auth.register.haveAccount")}{" "}
          <Link href="/auth/login" className="font-semibold text-orange-700 hover:underline">
            {t("auth.register.signIn")}
          </Link>
        </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("auth.register.name")}</Label>
              <Input id="name" autoComplete="name" placeholder={t("auth.register.namePlaceholder")} {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-600" role="alert">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.register.email")}</Label>
              <Input id="email" type="email" autoComplete="email" placeholder={t("auth.register.emailPlaceholder")} {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600" role="alert">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.register.password")}</Label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600" role="alert">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">{t("auth.register.confirm")}</Label>
                <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("confirm")} />
                {form.formState.errors.confirm && (
                  <p className="text-xs text-red-600" role="alert">{form.formState.errors.confirm.message}</p>
                )}
              </div>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="h-11 w-full gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
              {t("auth.register.button")}
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-stone-400">
              {t("auth.register.demoNote")}
            </p>
          </form>
      </div>

      <p className="mt-5 text-center text-xs text-stone-500">{t("auth.tagline")}</p>
    </AuthShell>
  );
}
