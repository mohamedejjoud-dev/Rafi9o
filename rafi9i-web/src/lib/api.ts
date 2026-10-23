/**
 * Rafi9i — Unified API client (Developer 2)
 * -------------------------------------------
 * FINAL BACKEND CONTRACT (Laravel + MySQL + Sanctum, no Redis):
 * - Base URL from NEXT_PUBLIC_API_URL (unset → demo mode with mocks)
 * - Every request sends: Accept: application/json (+ Content-Type on bodies)
 * - Protected requests send: Authorization: Bearer <sanctum-token>
 * - Success envelope    : { success: true,  message, data }   → data is unwrapped
 * - Validation failures : { success: false, message, errors } → ApiError.fieldErrors
 * - Single Sanctum token: NO refresh-token logic (none exists in the backend).
 *   A 401 clears the local session; the auth hooks then redirect to login.
 * - Assessment submissions include the sessionId returned by the matching
 *   start endpoint (POST /assessments/{basic|advanced}/start).
 * - If the backend is unreachable, silently falls back to mock data without
 *   changing the page interface (demo fallback kept for the MVP demo).
 *
 * All fetch logic lives here — pages never call fetch directly.
 */
import {
  AdminSubscriber,
  AdminSubscriberList,
  ApiEnvelope,
  ApiError,
  ApiFieldErrors,
  AssessmentSession,
  AuthResponse,
  DashboardData,
  LatestResult,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  SubscriptionStatus,
  TrialStatus,
} from "./types";
import { mockApi, MOCK_KEYS } from "./mocks";
import { getStoredLocale, translate } from "./i18n";

/** User-visible error message in the current UI language. */
const errorText = (key: string) => translate(getStoredLocale(), key);

/* ------------------------------------------------------------------ */
/* Environment + mode                                                  */
/* ------------------------------------------------------------------ */

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export type ApiMode = "live" | "demo";

let currentMode: ApiMode = API_URL ? "live" : "demo";
const modeListeners = new Set<(mode: ApiMode) => void>();

export function getApiMode(): ApiMode {
  return currentMode;
}

export function onApiModeChange(cb: (mode: ApiMode) => void): () => void {
  modeListeners.add(cb);
  return () => modeListeners.delete(cb);
}

function setMode(mode: ApiMode) {
  if (currentMode === mode) return;
  currentMode = mode;
  modeListeners.forEach((cb) => cb(mode));
}

/* ------------------------------------------------------------------ */
/* Session storage (token + user)                                      */
/* ------------------------------------------------------------------ */

export type StoredSession = AuthResponse;
const SESSION_EVENT = "rafi9i:session";

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MOCK_KEYS.session);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_KEYS.session, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOCK_KEYS.session);
  clearAssessmentSessionIds();
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function onSessionChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(SESSION_EVENT, cb);
  return () => window.removeEventListener(SESSION_EVENT, cb);
}

/* ------------------------------------------------------------------ */
/* Assessment session ids (start → submit handshake)                   */
/* ------------------------------------------------------------------ */

type AssessmentKind = "basic" | "advanced";

const ASSESSMENT_SESSION_KEYS: Record<AssessmentKind, string> = {
  basic: "rafi9i:assess:basic:sessionId",
  advanced: "rafi9i:assess:advanced:sessionId",
};

function readAssessmentSessionId(kind: AssessmentKind): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ASSESSMENT_SESSION_KEYS[kind]);
  } catch {
    return null;
  }
}

function storeAssessmentSessionId(kind: AssessmentKind, sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ASSESSMENT_SESSION_KEYS[kind], sessionId);
  } catch {
    /* storage unavailable — submissions re-start a session automatically */
  }
}

function clearAssessmentSessionIds(): void {
  if (typeof window === "undefined") return;
  Object.values(ASSESSMENT_SESSION_KEYS).forEach((k) => {
    try {
      window.sessionStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}

/* ------------------------------------------------------------------ */
/* Core request helper                                                 */
/* ------------------------------------------------------------------ */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mockLatency = () => sleep(450 + Math.random() * 400);

type CallOptions = { auth?: boolean };

/** Laravel error body: { success: false, message, errors? }. */
type LaravelErrorBody = { message?: string; errors?: ApiFieldErrors };

async function mapHttpError(res: Response): Promise<never> {
  let message = errorText("cnt.api.error.default");
  let code: ApiError["code"] = "server";
  let fieldErrors: ApiFieldErrors | undefined;

  if (res.status === 401) {
    code = "unauthorized";
    message = errorText("cnt.api.error.unauthorized");
  } else if (res.status === 403) {
    code = "forbidden";
    message = errorText("cnt.api.error.forbidden");
  } else if (res.status === 404) {
    code = "not_found";
    message = errorText("cnt.api.error.notFound");
  } else if (res.status === 422) {
    code = "validation";
    message = errorText("cnt.api.error.validation");
  }

  try {
    const body = (await res.json()) as LaravelErrorBody;
    if (body?.message) message = body.message;
    if (body?.errors) fieldErrors = body.errors;
  } catch {
    /* body not JSON — keep defaults */
  }
  throw new ApiError(code, message, res.status, fieldErrors);
}

/**
 * Unwrap the Laravel response envelope:
 * { success: true, message, data } → data
 * { success: false, ... }          → typed validation error (defensive:
 *                                     a success:false on a 2xx is treated
 *                                     as a validation failure too).
 */
function unwrapEnvelope<T>(body: unknown): T {
  if (body !== null && typeof body === "object" && "success" in (body as Record<string, unknown>)) {
    const envelope = body as ApiEnvelope<T>;
    if (envelope.success) {
      return (envelope.data ?? null) as T;
    }
    throw new ApiError(
      "validation",
      envelope.message ?? errorText("cnt.api.error.validation"),
      422,
      envelope.errors
    );
  }
  // Non-enveloped body (defensive) — return as-is.
  return body as T;
}

async function call<T>(
  path: string,
  init: RequestInit | undefined,
  mock: () => T | Promise<T>,
  options: CallOptions = {}
): Promise<T> {
  if (API_URL) {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
        // The backend localizes questions and generated results (fr | en | ar | ary).
        "X-Locale": getStoredLocale(),
        ...(init?.headers as Record<string, string> | undefined),
      };
      if (options.auth) {
        const token = getSession()?.token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const requestUrl =
        API_URL.endsWith("/api/v1") && path.startsWith("/api/v1")
          ? `${API_URL}${path.replace(/^\/api\/v1/, "")}`
          : `${API_URL}${path}`;

      const res = await fetch(requestUrl, { ...init, headers });
      if (!res.ok) {
        if (res.status === 401 && options.auth) {
          // Sanctum token invalid/revoked — no refresh endpoint exists.
          // Clear the session; auth hooks take over and redirect to login.
          clearSession();
        }
        // 404 on "latest result" simply means "nothing yet" → let the
        // endpoint wrapper decide; others become typed errors.
        if (res.status === 404 && path.startsWith("/api/v1/results")) return null as T;
        await mapHttpError(res);
      }
      setMode("live");
      return unwrapEnvelope<T>(await res.json());
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // Network failure / backend unavailable → graceful demo fallback.
      setMode("demo");
    }
  } else {
    setMode("demo");
  }

  await mockLatency();
  return mock();
}

/* ------------------------------------------------------------------ */
/* Assessment start → submit handshake                                 */
/* ------------------------------------------------------------------ */

async function ensureAssessmentSessionId(kind: AssessmentKind): Promise<string> {
  const existing = readAssessmentSessionId(kind);
  if (existing) return existing;
  // sessionId lost (new tab, cleared storage) → start a fresh session.
  const started =
    kind === "basic" ? await api.assessments.startBasic() : await api.assessments.startAdvanced();
  return started.sessionId;
}

/* ------------------------------------------------------------------ */
/* Public API — mirrors the final Laravel contract                     */
/* ------------------------------------------------------------------ */

export const api = {
  auth: {
    register: (payload: RegisterPayload) =>
      call<AuthResponse>(
        "/api/v1/auth/register",
        { method: "POST", body: JSON.stringify(payload) },
        () => mockApi.register(payload)
      ),
    login: (payload: LoginPayload) =>
      call<AuthResponse>(
        "/api/v1/auth/login",
        { method: "POST", body: JSON.stringify(payload) },
        () => mockApi.login(payload)
      ),
  },

  profile: {
    get: () =>
      call<ReturnType<typeof mockApi.getProfile>>(
        "/api/v1/profile",
        { method: "GET" },
        () => mockApi.getProfile(),
        { auth: true }
      ),
    update: (patch: ProfileUpdatePayload) =>
      call<ReturnType<typeof mockApi.getProfile>>(
        "/api/v1/profile",
        { method: "PATCH", body: JSON.stringify(patch) },
        () => mockApi.updateProfile(patch),
        { auth: true }
      ),
  },

  assessments: {
    /** POST /assessments/basic/start — opens a session, returns sessionId + questions. */
    startBasic: () =>
      call<AssessmentSession>(
        "/api/v1/assessments/basic/start",
        { method: "POST" },
        () => mockApi.startBasic(),
        { auth: true }
      ).then((session) => {
        storeAssessmentSessionId("basic", session.sessionId);
        return session;
      }),
    /** POST /assessments/basic/submit — payload includes the start sessionId. */
    submitBasic: (answers: Record<string, unknown>) =>
      ensureAssessmentSessionId("basic").then((sessionId) =>
        call<{ result: LatestResult }>(
          "/api/v1/assessments/basic/submit",
          { method: "POST", body: JSON.stringify({ sessionId, answers }) },
          () => mockApi.submitBasic(answers),
          { auth: true }
        )
      ),
    /** POST /assessments/advanced/start — opens a session, returns sessionId + questions. */
    startAdvanced: () =>
      call<AssessmentSession>(
        "/api/v1/assessments/advanced/start",
        { method: "POST" },
        () => mockApi.startAdvanced(),
        { auth: true }
      ).then((session) => {
        storeAssessmentSessionId("advanced", session.sessionId);
        return session;
      }),
    /** POST /assessments/advanced/submit — payload includes the start sessionId. */
    submitAdvanced: (answers: Record<string, unknown>) =>
      ensureAssessmentSessionId("advanced").then((sessionId) =>
        call<{ result: LatestResult }>(
          "/api/v1/assessments/advanced/submit",
          { method: "POST", body: JSON.stringify({ sessionId, answers }) },
          () => mockApi.submitAdvanced(answers),
          { auth: true }
        )
      ),
  },

  trial: {
    status: () => call<TrialStatus>("/api/v1/trial/status", { method: "GET" }, () => mockApi.getTrialStatus(), { auth: true }),
  },

  /** Premium is paid by bank transfer over WhatsApp, then verified by an admin. */
  premium: {
    request: () =>
      call<TrialStatus>("/api/v1/premium/request", { method: "POST" }, () => mockApi.requestPremium(), { auth: true }),
  },

  admin: {
    subscribers: (params: { status?: SubscriptionStatus; search?: string; page?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.page) query.set("page", String(params.page));
      const qs = query.toString();
      return call<AdminSubscriberList>(
        `/api/v1/admin/subscriptions${qs ? `?${qs}` : ""}`,
        { method: "GET" },
        () => mockApi.adminSubscribers(params),
        { auth: true }
      );
    },
    activate: (id: string, durationMonths?: number) =>
      call<AdminSubscriber>(
        `/api/v1/admin/users/${encodeURIComponent(id)}/activate-premium`,
        {
          method: "POST",
          body: JSON.stringify({
            duration_months: durationMonths ?? null,
            notes: "Virement vérifié via WhatsApp (19 DH)",
          }),
        },
        () => mockApi.adminSetStatus(id, "premium", durationMonths),
        { auth: true }
      ),
    deactivate: (id: string) =>
      call<AdminSubscriber>(
        `/api/v1/admin/users/${encodeURIComponent(id)}/deactivate-premium`,
        { method: "POST", body: JSON.stringify({}) },
        () => mockApi.adminSetStatus(id, "free"),
        { auth: true }
      ),
  },

  results: {
    latest: () =>
      call<LatestResult | null>("/api/v1/results/latest", { method: "GET" }, () => mockApi.getLatestResult(), { auth: true }),
  },

  dashboard: {
    get: () => call<DashboardData>("/api/v1/dashboard", { method: "GET" }, () => mockApi.getDashboard(), { auth: true }),
  },

  progress: {
    resource: (id: string, completed: boolean) =>
      call<{ id: string; completed: boolean }>(
        `/api/v1/progress/resource/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify({ completed }) },
        () => mockApi.updateResource(id, completed),
        { auth: true }
      ),
    roadmap: (id: string, completed: boolean) =>
      call<{ id: string; completed: boolean }>(
        `/api/v1/progress/roadmap/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify({ completed }) },
        () => mockApi.updateRoadmap(id, completed),
        { auth: true }
      ),
  },

  agent: {
    chat: (payload: {
      message: string;
      history?: Array<{ role: "user" | "rafi" | "assistant"; content: string }>;
      profile?: Record<string, unknown>;
    }) =>
      call<{ reply: string; role?: string }>(
        "/api/v1/agent/chat",
        { method: "POST", body: JSON.stringify(payload) },
        () => ({
          reply: translate(getStoredLocale(), "cnt.api.agentDemoReply"),
          role: "rafi",
        }),
        { auth: true }
      ),
  },
};

/* Demo helpers re-exported for demo tooling UI (trial simulations). */
export { mockApi as demoBackend } from "./mocks";
