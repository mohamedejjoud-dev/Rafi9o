/**
 * Rafi9i — Client-side auth session helpers + hooks (Developer 2)
 * -----------------------------------------------------------------
 * Tokens live in localStorage (demo MVP). When the backend ships real
 * httpOnly cookies, only this file and api.ts change — pages stay put.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearSession,
  getSession,
  onSessionChange,
  setSession,
  type StoredSession,
} from "./api";
import type {
  LoginPayload,
  RegisterPayload,
  SendVerificationCodePayload,
  VerifyCodePayload,
  UserProfile,
} from "./types";

/* ------------------------------------------------------------------ */
/* Plain helpers                                                       */
/* ------------------------------------------------------------------ */

export async function login(payload: LoginPayload): Promise<UserProfile> {
  const res = await api.auth.login(payload);
  setSession(res);
  return res.user;
}

export async function register(payload: RegisterPayload): Promise<UserProfile> {
  const res = await api.auth.register(payload);
  setSession(res);
  return res.user;
}

export async function sendVerificationCode(
  payload: SendVerificationCodePayload
): Promise<{ message: string; dev_code?: string }> {
  return await api.auth.sendVerificationCode(payload);
}

export async function verifyCode(
  payload: VerifyCodePayload
): Promise<{ message: string }> {
  return await api.auth.verifyCode(payload);
}

export function logout(): void {
  clearSession();
}

/** Patch the cached user inside the stored session (after profile update). */
export function updateSessionUser(user: UserProfile): void {
  const session = getSession();
  if (session) setSession({ ...session, user });
}

/* ------------------------------------------------------------------ */
/* React hooks                                                         */
/* ------------------------------------------------------------------ */

export function useSession(): { session: StoredSession | null; loading: boolean } {
  const [session, setSessionState] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionState(getSession());
    setLoading(false);
    return onSessionChange(() => setSessionState(getSession()));
  }, []);

  return { session, loading };
}

/**
 * Guard hook: redirects to /auth/login when no session exists.
 * While loading, callers should render a loader.
 */
export function useRequireAuth(redirectTo = "/auth/login"): { session: StoredSession | null; loading: boolean } {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace(redirectTo);
    }
  }, [loading, session, router, redirectTo]);

  return { session, loading };
}

/** Convenience: redirect authenticated users away from auth pages. */
export function useRedirectIfAuthenticated(target: string | null = null): void {
  const { session, loading } = useSession();
  const router = useRouter();

  const resolveTarget = useCallback(async (): Promise<string> => {
    if (target) return target;
    try {
      const profile = await api.profile.get();
      return profile.onboardingCompleted ? "/dashboard" : "/onboarding";
    } catch {
      return "/onboarding";
    }
  }, [target]);

  useEffect(() => {
    if (!loading && session) {
      void resolveTarget().then((t) => router.replace(t));
    }
  }, [loading, session, router, resolveTarget]);
}
