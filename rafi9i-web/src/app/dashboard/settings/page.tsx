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
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import type { AppLanguage } from "@/lib/types";

/** Language names are shown in their own language, whatever the UI locale. */
const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  fr: "Français",
  ar: "العربية",
  ary: "الدارجة",
  en: "English",
};

export default function SettingsPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("fr");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.user.name);
      setLanguage(session.user.language ?? "fr");
    }
  }, [session]);

  if (loading || !session) return <PageLoader message={t("dsh.loading")} />;

  const save = async () => {
    if (name.trim().length < 2) {
      toast({ title: t("dsh.set.invalidName"), description: t("dsh.set.invalidNameBody") });
      return;
    }
    setSaving(true);
    try {
      const updated = await api.profile.update({ name: name.trim(), language });
      updateSessionUser(updated);
      toast({ title: t("dsh.set.saved"), description: t("dsh.set.savedBody") });
    } catch {
      toast({ title: t("dsh.set.saveFailed"), description: t("dsh.set.saveFailedBody") });
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
          <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="rafi-icon-chip">
              <SettingsIcon className="h-5 w-5" aria-hidden />
            </span>
            {t("dash.settings")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dsh.set.subtitle")}</p>
        </div>
        <DemoBadge />
      </header>

      <FoxGuide
        stage="dashboard"
        mood="neutral"
        compact
        message={t("dsh.set.fox")}
      />

      {/* Profile form */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="profile-settings">
        <h2 id="profile-settings" className="text-sm font-bold text-foreground">{t("dsh.set.profile")}</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">{t("dsh.set.fullName")}</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-email">{t("dsh.set.email")}</Label>
            <Input id="settings-email" value={session.user.email} disabled dir="ltr" aria-describedby="email-note" />
            <p id="email-note" className="text-[11px] text-muted-foreground">{t("dsh.set.emailNote")}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-language">{t("dsh.set.language")}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as AppLanguage)}>
              <SelectTrigger id="settings-language" aria-label={t("dsh.set.languageAria")}>
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
            <p className="text-[11px] text-muted-foreground">{t("dsh.set.languageNote")}</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {t("dsh.set.save")}
          </Button>
        </div>
      </section>

      {/* Session */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="session-settings">
        <h2 id="session-settings" className="text-sm font-bold text-foreground">{t("dsh.set.session")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("dsh.set.connectedAs")} <strong className="text-foreground">{session.user.email}</strong>.
        </p>
        <Button variant="outline" onClick={doLogout} className="mt-3 gap-2">
          <LogOut className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t("dsh.set.logout")}
        </Button>
      </section>

      {/* Danger zone */}
      <section
        className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/50 dark:bg-red-950/30"
        aria-labelledby="danger-zone"
      >
        <h2 id="danger-zone" className="text-sm font-bold text-red-800 dark:text-red-300">{t("dsh.set.danger")}</h2>
        <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-300/90">{t("dsh.set.dangerBody")}</p>
        <Button
          variant="destructive"
          className="mt-3 gap-2"
          onClick={() =>
            toast({
              title: t("dsh.comingSoon"),
              description: t("dsh.set.deleteSoonBody"),
            })
          }
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t("dsh.set.delete")}
        </Button>
      </section>
    </div>
  );
}
