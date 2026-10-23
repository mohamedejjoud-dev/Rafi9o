/**
 * Rafi9i — Admin: Premium management
 * Admins verify WhatsApp bank transfers and grant or remove Premium.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock, Crown, Search, ShieldAlert, UserX, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { formatPremiumDate } from "@/lib/premium";
import type { AdminSubscriber, AdminSubscriberList, SubscriptionStatus } from "@/lib/types";

const FILTERS: Array<{ value: SubscriptionStatus | undefined; key: string }> = [
  { value: "pending", key: "admin.filter.pending" },
  { value: "premium", key: "admin.filter.premium" },
  { value: "free", key: "admin.filter.free" },
  { value: undefined, key: "admin.filter.all" },
];

const DURATIONS = [
  { months: 1, key: "admin.duration.1" },
  { months: 3, key: "admin.duration.3" },
  { months: 12, key: "admin.duration.12" },
  { months: 0, key: "admin.duration.unlimited" },
] as const;

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  premium: "border-orange-600 bg-orange-600 text-white",
  free: "border-stone-200 bg-stone-100 text-stone-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

type PendingRemoval = { user: AdminSubscriber; isRejection: boolean } | null;

export default function AdminPremiumPage() {
  const { session } = useSession();
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [status, setStatus] = useState<SubscriptionStatus | undefined>("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminSubscriberList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [removal, setRemoval] = useState<PendingRemoval>(null);

  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api.admin
      .subscribers({ status, search: search || undefined, page })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t("admin.toast.error")))
      .finally(() => setLoading(false));
  }, [status, search, page, t]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (!session) return <PageLoader message={t("dash.opening")} />;

  if (!isAdmin) {
    return (
      <EmptyState icon={ShieldAlert} title={t("admin.forbidden")} />
    );
  }

  const activate = (user: AdminSubscriber) => {
    const months = durations[user.id] ?? 1;
    setBusyId(user.id);
    api.admin
      .activate(user.id, months || undefined)
      .then(() => {
        toast({ title: `${t("admin.toast.activated")} ${user.name}` });
        load();
      })
      .catch(() => toast({ title: t("admin.toast.error"), variant: "destructive" }))
      .finally(() => setBusyId(null));
  };

  const confirmRemoval = () => {
    if (!removal) return;
    const { user } = removal;
    setRemoval(null);
    setBusyId(user.id);
    api.admin
      .deactivate(user.id)
      .then(() => {
        toast({ title: `${t("admin.toast.deactivated")} ${user.name}` });
        load();
      })
      .catch(() => toast({ title: t("admin.toast.error"), variant: "destructive" }))
      .finally(() => setBusyId(null));
  };

  const statusBadge = (user: AdminSubscriber) => (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[user.subscription_status]}`}
    >
      {user.subscription_status === "pending" && <Clock className="h-3 w-3" aria-hidden />}
      {user.subscription_status === "premium" && <Crown className="h-3 w-3" aria-hidden />}
      {t(`admin.filter.${user.subscription_status}`)}
    </span>
  );

  const actions = (user: AdminSubscriber) => {
    const busy = busyId === user.id;
    if (user.subscription_status === "premium") {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => setRemoval({ user, isRejection: false })}
          className="min-h-11 gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <UserX className="h-4 w-4" aria-hidden />
          {t("admin.deactivate")}
        </Button>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`duration-${user.id}`}>
          {t("admin.duration")}
        </label>
        <select
          id={`duration-${user.id}`}
          value={durations[user.id] ?? 1}
          onChange={(e) => setDurations((d) => ({ ...d, [user.id]: Number(e.target.value) }))}
          disabled={busy}
          className="min-h-11 rounded-lg border border-stone-300 bg-white px-2 text-sm text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {DURATIONS.map((d) => (
            <option key={d.months} value={d.months}>
              {t(d.key)}
            </option>
          ))}
        </select>
        <Button size="sm" disabled={busy} onClick={() => activate(user)} className="min-h-11 gap-1.5">
          <Check className="h-4 w-4" aria-hidden />
          {t("admin.activate")}
        </Button>
        {user.subscription_status === "pending" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => setRemoval({ user, isRejection: true })}
            className="min-h-11 text-stone-600 dark:text-slate-300"
          >
            {t("admin.reject")}
          </Button>
        )}
      </div>
    );
  };

  const expiresLabel = (user: AdminSubscriber) =>
    user.subscription_status !== "premium"
      ? "—"
      : user.premium_expires_at
        ? formatPremiumDate(user.premium_expires_at, locale)
        : t("admin.unlimited");

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">{t("admin.subtitle")}</p>
        </div>
        {data && data.pending_count > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
            aria-live="polite"
          >
            <Clock className="h-4 w-4" aria-hidden />
            {data.pending_count} {t("admin.pending.count")}
          </span>
        )}
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label={t("admin.col.status")}>
          {FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  active
                    ? "border-orange-500/40 bg-orange-100 font-bold text-orange-900 dark:bg-orange-950 dark:text-orange-200"
                    : "border-stone-200 bg-white font-medium text-stone-600 hover:border-orange-300 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {t(f.key)}
              </button>
            );
          })}
        </div>
        <div className="sm:w-72">
          <label htmlFor="admin-search" className="mb-1 block text-xs font-semibold text-stone-600 dark:text-slate-400">
            {t("admin.search")}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input
              id="admin-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-stone-300 bg-white ps-9 pe-3 text-sm text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {loading && <PageLoader message={t("premium.loading")} />}

      {!loading && error && <ErrorState description={error} onRetry={load} />}

      {!loading && !error && items.length === 0 && <EmptyState icon={Users} title={t("admin.empty")} />}

      {!loading && !error && items.length > 0 && (
        <>
          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {items.map((user) => (
              <li
                key={user.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900 dark:text-white">{user.name}</p>
                    <p className="truncate text-sm text-stone-500 dark:text-slate-400">{user.email}</p>
                  </div>
                  {statusBadge(user)}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-stone-500 dark:text-slate-400">{t("admin.col.requested")}</dt>
                    <dd className="font-medium text-stone-800 dark:text-slate-200">
                      {formatPremiumDate(user.premium_requested_at, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-500 dark:text-slate-400">{t("admin.col.expires")}</dt>
                    <dd className="font-medium text-stone-800 dark:text-slate-200">{expiresLabel(user)}</dd>
                  </div>
                </dl>
                <div className="mt-3">{actions(user)}</div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm md:block dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("admin.col.user")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("admin.col.status")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("admin.col.requested")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("admin.col.expires")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("admin.col.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                {items.map((user) => (
                  <tr key={user.id} className={user.subscription_status === "pending" ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-stone-500 dark:text-slate-400">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">{statusBadge(user)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700 dark:text-slate-300">
                      {formatPremiumDate(user.premium_requested_at, locale)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700 dark:text-slate-300">{expiresLabel(user)}</td>
                    <td className="px-4 py-3">{actions(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <nav className="flex items-center justify-between gap-3" aria-label={t("admin.page")}>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="min-h-11">
                {t("admin.prev")}
              </Button>
              <span className="text-sm text-stone-600 dark:text-slate-400">
                {t("admin.page")} {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                variant="outline"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="min-h-11"
              >
                {t("admin.next")}
              </Button>
            </nav>
          )}
        </>
      )}

      <AlertDialog open={removal !== null} onOpenChange={(open) => !open && setRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removal?.isRejection ? t("admin.confirm.rejectTitle") : t("admin.confirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removal?.user.name} · {t("admin.confirm.text")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoval} className="bg-red-600 hover:bg-red-700">
              {t("admin.confirm.ok")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
