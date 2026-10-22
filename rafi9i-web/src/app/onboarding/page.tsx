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

export default function OnboardingPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState<string>("");
  const [bacStream, setBacStream] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) setName(session.user.name ?? "");
  }, [session]);

  if (loading || !session) return <PageLoader message="Chargement de ton espace…" />;

  const cityOptions = BASIC_QUESTIONS.find((q) => q.id === "city")?.options ?? [];
  const streamOptions = BASIC_QUESTIONS.find((q) => q.id === "bacStream")?.options ?? [];

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Indique ton nom (au moins 2 caractères).";
    if (!city) nextErrors.city = "Choisis ta ville.";
    if (!bacStream) nextErrors.bacStream = "Choisis ta filière.";
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
      setErrors({ form: "Impossible d'enregistrer pour le moment. Réessaie." });
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50/50 px-4 py-10">
      <div className="w-full max-w-lg">
        <DemoBadge className="mb-4" />
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <FoxGuide
            stage="onboarding"
            mood="celebrating"
            message={`Bienvenue${session.user.name ? ` ${session.user.name.split(" ")[0]}` : ""} ! Trois infos rapides et ton parcours commence.`}
          />

          <h1 className="mt-6 text-xl font-bold text-stone-900">Personnalise ton profil</h1>
          <p className="mt-1 text-sm text-stone-500">
            Rafi utilise ces informations pour adapter ses recommandations d&apos;écoles et de filières.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Ton nom complet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Yassine El Amrani"
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-600" role="alert">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">Ta ville</Label>
              <Select value={city} onValueChange={(v) => { setCity(v); setErrors((e) => ({ ...e, city: "" })); }}>
                <SelectTrigger id="city" aria-label="Choisis ta ville">
                  <SelectValue placeholder="Choisis ta ville" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.emoji} {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-xs text-red-600" role="alert">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bacStream">Ta filière au bac</Label>
              <Select value={bacStream} onValueChange={(v) => { setBacStream(v); setErrors((e) => ({ ...e, bacStream: "" })); }}>
                <SelectTrigger id="bacStream" aria-label="Choisis ta filière">
                  <SelectValue placeholder="Choisis ta filière" />
                </SelectTrigger>
                <SelectContent>
                  {streamOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.emoji} {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bacStream && <p className="text-xs text-red-600" role="alert">{errors.bacStream}</p>}
            </div>

            {errors.form && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {errors.form}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                onClick={submit}
                disabled={busy}
                className="flex-1 gap-2"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
                Commencer mon évaluation
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/assessment/basic")}
                disabled={busy}
              >
                Passer pour l&apos;instant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
