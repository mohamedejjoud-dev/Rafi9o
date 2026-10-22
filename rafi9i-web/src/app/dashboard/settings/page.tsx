/**
 * Rafi9i — Dashboard · Settings (Developer 2)
 * Name, email, preferred language, logout, delete-account placeholder.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Save, Settings as SettingsIcon, Trash2 } from "lucide-react";
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
import DemoBadge from "@/components/shared/DemoBadge";
import PageLoader from "@/components/shared/PageLoader";
import FoxGuide from "@/components/fox/FoxGuide";
import { api } from "@/lib/api";
import { logout, updateSessionUser, useRequireAuth } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import type { AppLanguage } from "@/lib/types";

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  fr: "Français",
  ar: "العربية (bientôt)",
  en: "English (bientôt)",
};

export default function SettingsPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("fr");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.user.name);
      setLanguage(session.user.language ?? "fr");
    }
  }, [session]);

  if (loading || !session) return <PageLoader message="Chargement…" />;

  const save = async () => {
    if (name.trim().length < 2) {
      toast({ title: "Nom invalide", description: "Indique au moins 2 caractères." });
      return;
    }
    setSaving(true);
    try {
      const updated = await api.profile.update({ name: name.trim(), language });
      updateSessionUser(updated);
      toast({ title: "Profil mis à jour ✓", description: "Tes préférences sont enregistrées." });
    } catch {
      toast({ title: "Échec de l'enregistrement", description: "Réessaie dans un instant." });
    } finally {
      setSaving(false);
    }
  };

  const doLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-stone-900">
            <span className="rafi-icon-chip">
              <SettingsIcon className="h-5 w-5" aria-hidden />
            </span>
            Paramètres
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">Ton compte et tes préférences.</p>
        </div>
        <DemoBadge />
      </header>

      <FoxGuide
        stage="dashboard"
        mood="neutral"
        compact
        message="Garde ton profil à jour : Rafi adapte ses conseils à ton nom, ta ville et ta langue."
      />

      {/* Profile form */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="profile-settings">
        <h2 id="profile-settings" className="text-sm font-bold text-stone-900">Profil</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">Nom complet</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" value={session.user.email} disabled aria-describedby="email-note" />
            <p id="email-note" className="text-[11px] text-stone-400">
              L&apos;adresse email ne peut pas être modifiée dans cette version du MVP.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-language">Langue préférée</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as AppLanguage)}>
              <SelectTrigger id="settings-language" aria-label="Choisis ta langue préférée">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LANGUAGE_LABELS) as AppLanguage[]).map((l) => (
                  <SelectItem key={l} value={l}>
                    {LANGUAGE_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-stone-400">
              L&apos;interface complète en arabe et en anglais arrive dans une prochaine itération.
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            Enregistrer les modifications
          </Button>
        </div>
      </section>

      {/* Session */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="session-settings">
        <h2 id="session-settings" className="text-sm font-bold text-stone-900">Session</h2>
        <p className="mt-1 text-xs text-stone-600">
          Connecté en tant que <strong>{session.user.email}</strong>.
        </p>
        <Button variant="outline" onClick={doLogout} className="mt-3 gap-2">
          <LogOut className="h-4 w-4" aria-hidden />
          Se déconnecter
        </Button>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5" aria-labelledby="danger-zone">
        <h2 id="danger-zone" className="text-sm font-bold text-red-800">Zone de danger</h2>
        <p className="mt-1 text-xs leading-relaxed text-red-700">
          La suppression de compte effacera définitivement tes évaluations, résultats et progression.
        </p>
        <Button
          variant="destructive"
          className="mt-3 gap-2"
          onClick={() =>
            toast({
              title: "Bientôt disponible",
              description:
                "La suppression de compte sera activée avec le backend définitif. Contacte support@rafi9i.ma en attendant.",
            })
          }
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Supprimer mon compte
        </Button>
      </section>
    </div>
  );
}
