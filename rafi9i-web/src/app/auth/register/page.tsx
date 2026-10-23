/**
 * Rafi9i — Register page with pre-registration email verification (Developer 2)
 * Features:
 * - Real-time password requirement validation (8+ chars, letters, numbers, match)
 * - Password visibility toggles (eye / eye-off)
 * - Pre-registration email verification code sent via real SMTP
 * - 6-digit verification code entry with resend cooldown timer
 * - Clear field-level errors (no generic "The given data was invalid" message)
 * - Exact "This email is already registered. Please sign in." error handling
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Loader2,
  Eye,
  EyeOff,
  Check,
  Mail,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/shared/AuthShell";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import { register, sendVerificationCode, useRedirectIfAuthenticated } from "@/lib/auth-client";
import { ApiError } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

/** Validation schema for Step 1 (account info) */
const step1Schema = z
  .object({
    name: z.string().trim().min(2, "pub.auth.err.nameRequired"),
    email: z.string().trim().min(1, "pub.auth.err.emailRequired").email("pub.auth.err.emailInvalid"),
    password: z
      .string()
      .min(8, "pub.auth.err.passwordMin")
      .regex(/[a-zA-Z]/, "pub.auth.err.passwordLetters")
      .regex(/[0-9]/, "pub.auth.err.passwordNumbers"),
    confirm: z.string().min(1, "pub.auth.err.confirmRequired"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "pub.auth.err.mismatch",
    path: ["confirm"],
  });

type Step1Values = z.infer<typeof step1Schema>;

export default function RegisterPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const { t } = useI18n();

  // Wizard step: 1 = Enter credentials, 2 = Enter verification code
  const [step, setStep] = useState<1 | 2>(1);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [codeSentAlert, setCodeSentAlert] = useState(false);

  // Form handling
  const form = useForm<Step1Values>({
    defaultValues: { name: "", email: "", password: "", confirm: "" },
    mode: "onChange",
  });
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const watchedPassword = form.watch("password") || "";
  const watchedConfirm = form.watch("confirm") || "";
  const watchedEmail = form.watch("email") || "";
  const watchedName = form.watch("name") || "";

  // Password checklist rules
  const hasMinLength = watchedPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(watchedPassword);
  const hasNumber = /[0-9]/.test(watchedPassword);
  const passwordsMatch = watchedConfirm.length > 0 && watchedConfirm === watchedPassword;

  // Countdown timer for resending code
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  /** Step 1 submit: validates info, sends verification code via SMTP */
  const onStep1Submit = form.handleSubmit(async (values) => {
    const parsed = step1Schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]) as keyof Step1Values;
        form.setError(fieldName, {
          message: issue.message.startsWith("pub.") ? t(issue.message) : issue.message,
        });
      });
      return;
    }

    setBusy(true);
    setFormError("");
    setCodeSentAlert(false);

    try {
      await sendVerificationCode({
        email: values.email.trim(),
        name: values.name.trim(),
      });

      setCountdown(60);
      setCodeSentAlert(true);
      setStep(2);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.fieldErrors) {
        let hasFieldErrors = false;
        Object.entries(e.fieldErrors).forEach(([field, messages]) => {
          let targetField: keyof Step1Values | null = null;
          if (field === "email") targetField = "email";
          else if (field === "name") targetField = "name";
          else if (field === "password") targetField = "password";
          else if (field === "confirm" || field === "password_confirmation") targetField = "confirm";

          if (targetField) {
            hasFieldErrors = true;
            let msg = messages[0];
            const lowerMsg = (msg || "").toLowerCase();
            if (
              targetField === "email" &&
              (lowerMsg.includes("already") ||
                lowerMsg.includes("déjà") ||
                lowerMsg.includes("مسجل") ||
                lowerMsg.includes("unique") ||
                lowerMsg.includes("taken"))
            ) {
              msg = "This email is already registered. Please sign in.";
            } else if (
              targetField === "confirm" &&
              (lowerMsg.includes("match") ||
                lowerMsg.includes("correspond") ||
                lowerMsg.includes("متطابق"))
            ) {
              msg = t("pub.auth.err.mismatch") || "The password confirmation does not match.";
            }
            form.setError(targetField, { message: msg });
          }
        });

        // Never display the generic "The given data was invalid" message
        if (!hasFieldErrors) {
          const rawMsg = e.message || "";
          if (!rawMsg.toLowerCase().includes("given data was invalid")) {
            setFormError(rawMsg);
          } else {
            setFormError(t("pub.auth.err.registerFailed"));
          }
        }
      } else {
        const rawMsg = e instanceof Error ? e.message : t("pub.auth.err.registerFailed");
        if (!rawMsg.toLowerCase().includes("given data was invalid")) {
          setFormError(rawMsg);
        } else {
          setFormError(t("pub.auth.err.registerFailed"));
        }
      }
    } finally {
      setBusy(false);
    }
  });

  /** Resend verification code */
  const handleResendCode = async () => {
    if (countdown > 0 || busy) return;
    setBusy(true);
    setCodeError("");
    setFormError("");
    setCodeSentAlert(false);

    try {
      await sendVerificationCode({
        email: watchedEmail.trim(),
        name: watchedName.trim(),
      });
      setCountdown(60);
      setCodeSentAlert(true);
    } catch (e: unknown) {
      const rawMsg = e instanceof Error ? e.message : t("pub.auth.err.registerFailed");
      if (!rawMsg.toLowerCase().includes("given data was invalid")) {
        setFormError(rawMsg);
      }
    } finally {
      setBusy(false);
    }
  };

  /** Step 2 submit: verifies code and creates account */
  const onStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();

    if (!cleanCode) {
      setCodeError(t("pub.auth.err.codeRequired"));
      return;
    }
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setCodeError(t("pub.auth.err.codeLength"));
      return;
    }

    setBusy(true);
    setCodeError("");
    setFormError("");

    try {
      await register({
        name: watchedName.trim(),
        email: watchedEmail.trim(),
        password: watchedPassword,
        password_confirmation: watchedConfirm,
        verification_code: cleanCode,
      });

      router.push("/onboarding");
    } catch (e: unknown) {
      if (e instanceof ApiError && e.fieldErrors?.verification_code) {
        setCodeError(e.fieldErrors.verification_code[0]);
      } else {
        const rawMsg = e instanceof Error ? e.message : t("pub.auth.err.codeInvalid");
        if (!rawMsg.toLowerCase().includes("given data was invalid")) {
          setCodeError(rawMsg);
        } else {
          setCodeError(t("pub.auth.err.codeInvalid"));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <FoxGuide
        stage="auth"
        mood={step === 1 ? "celebrating" : "encouraging"}
        compact
        message={
          step === 1
            ? t("auth.register.welcome")
            : t("auth.register.step2Desc") + " " + watchedEmail
        }
      />

      <div className="rafi-card mt-5 rounded-3xl border border-border bg-card/95 p-5 shadow-xl shadow-orange-950/5 backdrop-blur sm:p-8">
        {/* Header & Steps Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {step === 1 ? t("auth.register.title") : t("auth.register.step2")}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={`flex items-center gap-1 font-medium ${
                  step === 1
                    ? "text-orange-700 dark:text-orange-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {step === 2 && <Check className="h-3 w-3" />}
                1. {t("auth.register.step1")}
              </span>
              <span>•</span>
              <span
                className={`font-medium ${
                  step === 2 ? "text-orange-700 dark:text-orange-400" : "text-muted-foreground"
                }`}
              >
                2. {t("auth.register.step2")}
              </span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.register.haveAccount")}{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-orange-700 hover:underline dark:text-orange-400"
            >
              {t("auth.register.signIn")}
            </Link>
          </p>
        )}

        {/* Global form error banner (for system/network errors only) */}
        {formError && (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">{formError}</div>
          </div>
        )}

        {/* ================= STEP 1: ACCOUNT DETAILS ================= */}
        {step === 1 ? (
          <form onSubmit={onStep1Submit} className="mt-6 space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("auth.register.name")}</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder={t("auth.register.namePlaceholder")}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                  {form.formState.errors.name.message?.startsWith("pub.")
                    ? t(form.formState.errors.name.message)
                    : form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.register.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.register.emailPlaceholder")}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <div className="flex flex-wrap items-center gap-1 text-xs text-red-600 dark:text-red-400" role="alert">
                  <span>
                    {form.formState.errors.email.message?.startsWith("pub.")
                      ? t(form.formState.errors.email.message)
                      : form.formState.errors.email.message}
                  </span>
                  {(form.formState.errors.email.message?.includes("already registered") ||
                    form.formState.errors.email.message?.includes("déjà") ||
                    form.formState.errors.email.message?.includes("مسجل")) && (
                    <Link
                      href="/auth/login"
                      className="font-bold underline text-orange-700 hover:text-orange-800 dark:text-orange-400"
                    >
                      {t("auth.register.signIn")}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Password & Confirm */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.register.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pr-10 rtl:pl-10 rtl:pr-3"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rtl:left-3 rtl:right-auto"
                    aria-label={
                      showPassword
                        ? t("auth.register.hidePassword")
                        : t("auth.register.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {form.formState.errors.password.message?.startsWith("pub.")
                      ? t(form.formState.errors.password.message)
                      : form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">{t("auth.register.confirm")}</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pr-10 rtl:pl-10 rtl:pr-3"
                    {...form.register("confirm")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rtl:left-3 rtl:right-auto"
                    aria-label={
                      showConfirm
                        ? t("auth.register.hidePassword")
                        : t("auth.register.showPassword")
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirm && (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {form.formState.errors.confirm.message?.startsWith("pub.")
                      ? t(form.formState.errors.confirm.message)
                      : form.formState.errors.confirm.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password security checklist */}
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 text-xs space-y-2">
              <p className="font-medium text-foreground text-[11px] uppercase tracking-wider">
                Exigences de sécurité :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasMinLength
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      hasMinLength
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-muted"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>{t("auth.register.pwdRule.min")}</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasLetter
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      hasLetter
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-muted"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>{t("auth.register.pwdRule.letter")}</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasNumber
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      hasNumber
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-muted"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>{t("auth.register.pwdRule.number")}</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors ${
                    passwordsMatch
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      passwordsMatch
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-muted"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>{t("auth.register.pwdRule.match")}</span>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={busy} className="h-11 w-full gap-2">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Mail className="h-4 w-4" aria-hidden />
              )}
              {t("auth.register.step1Btn")}
            </Button>
          </form>
        ) : (
          /* ================= STEP 2: EMAIL VERIFICATION CODE ================= */
          <form onSubmit={onStep2Submit} className="mt-6 space-y-5" noValidate>
            {/* Email recap banner */}
            <div className="flex items-center justify-between rounded-2xl border border-orange-200/80 bg-orange-50/70 p-3.5 dark:border-orange-900/40 dark:bg-orange-950/30">
              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="h-4 w-4 text-orange-700 dark:text-orange-400 shrink-0" />
                <div>
                  <p className="text-muted-foreground">{t("auth.register.step2Desc")}</p>
                  <p className="font-semibold text-foreground">{watchedEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFormError("");
                  setCodeError("");
                }}
                className="flex items-center gap-1 text-xs font-semibold text-orange-700 hover:underline dark:text-orange-400"
              >
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                {t("auth.register.editEmail")}
              </button>
            </div>

            {/* Code sent success banner */}
            {codeSentAlert && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{t("auth.register.codeSentSuccess")}</span>
              </div>
            )}

            {/* 6-digit Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verification_code" className="text-center block font-medium">
                {t("auth.register.code")}
              </Label>
              <div className="flex justify-center">
                <Input
                  id="verification_code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(clean);
                    if (codeError) setCodeError("");
                  }}
                  placeholder={t("auth.register.codePlaceholder")}
                  className="h-14 w-full max-w-xs text-center font-mono text-2xl font-bold tracking-[0.4em] sm:tracking-[0.5em]"
                />
              </div>
              {codeError && (
                <p className="text-center text-xs text-red-600 dark:text-red-400" role="alert">
                  {codeError}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={busy || verificationCode.length !== 6}
                className="h-11 w-full gap-2 text-base font-semibold"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                )}
                {t("auth.register.step2Btn")}
              </Button>

              <div className="flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || busy}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                  {countdown > 0
                    ? t("auth.register.resendIn", { seconds: countdown })
                    : t("auth.register.resend")}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">{t("auth.tagline")}</p>
    </AuthShell>
  );
}
