/**
 * Rafi9i — Shared frontend types + Zod schemas (Developer 2)
 * ------------------------------------------------------------
 * Mirrors the FINAL backend contract (Laravel + Sanctum, see worklog):
 * - Success envelope  : { success: true,  message, data }
 * - Validation errors : { success: false, message, errors: { field: string[] } }
 * - Auth              : Sanctum bearer token (single token, no refresh)
 * - Assessments       : submissions include the sessionId returned by
 *                       the corresponding start endpoint.
 */
import { z } from "zod";
import { getStoredLocale, translate } from "./i18n";

/* ------------------------------------------------------------------ */
/* Core contract types                                                 */
/* ------------------------------------------------------------------ */

export type AccessLevel = "free" | "premium_preview" | "premium";

/** Backend roles (Sanctum). The student app targets the "user" role. */
export type UserRole = "user" | "admin";

export type FieldMatch = {
  id: string;
  name: string;
  score: number;
  explanation: string;
  strengths: string[];
  potentialChallenges: string[];
  nextAction: string;
};

export type SoftSkillPriority = {
  id: string;
  name: string;
  currentLevel: number;
  reason: string;
  action: string;
  completed?: boolean;
};

export type LearningResource = {
  id: string;
  type: "course" | "podcast" | "ebook";
  title: string;
  description: string;
  duration: string;
  completed: boolean;
};

export type RoadmapStage = "explore" | "learn" | "practice" | "prepare";

export type RoadmapStep = {
  id: string;
  stage: RoadmapStage;
  title: string;
  description: string;
  completed: boolean;
};

export type OrientationResult = {
  profileSummary: string;
  topFields: FieldMatch[];
  strengths: string[];
  softSkillPriorities: SoftSkillPriority[];
  resources: LearningResource[];
  roadmap: RoadmapStep[];
};

/**
 * "active" = 3-day preview (demo mode only), "pending" = WhatsApp payment
 * sent and awaiting admin verification, "subscribed" = Premium verified.
 */
export type TrialState = "not_started" | "active" | "pending" | "expired" | "subscribed";

export type TrialStatus = {
  status: TrialState;
  startedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  accessLevel: AccessLevel;
  /** When the WhatsApp payment request was sent (status "pending"). */
  requestedAt?: string | null;
};

/* ------------------------------------------------------------------ */
/* Admin — subscription management                                     */
/* ------------------------------------------------------------------ */

export type SubscriptionStatus = "free" | "pending" | "premium";

export type AdminSubscriber = {
  id: string;
  name: string;
  email: string;
  role?: string;
  subscription_status: SubscriptionStatus;
  is_premium: boolean;
  premium_requested_at: string | null;
  premium_activated_at: string | null;
  premium_expires_at: string | null;
  created_at: string | null;
};

export type AdminSubscriberList = {
  pending_count: number;
  items: AdminSubscriber[];
  pagination: { current_page: number; last_page: number; per_page: number; total: number };
};

export type DashboardData = {
  profileCompletion: number;
  trial: TrialStatus;
  orientationStage: string;
  primaryField: FieldMatch | null;
  weeklyChallenge: SoftSkillPriority | null;
  roadmapProgress: number;
  completedResources: number;
  streak: number;
  nextAction: string;
};

/* ------------------------------------------------------------------ */
/* Auth & profile                                                      */
/* ------------------------------------------------------------------ */

export type AppLanguage = "fr" | "ar" | "en";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  city?: string;
  bacStream?: string;
  language: AppLanguage;
  onboardingCompleted: boolean;
  createdAt: string;
  /** Present once the backend returns it; the student app expects "user". */
  role?: UserRole;
};

/** Sanctum personal access token — no refresh token in the final contract. */
export type AuthResponse = {
  user: UserProfile;
  token: string;
};

export type RegisterPayload = { name: string; email: string; password: string; password_confirmation?: string };
export type LoginPayload = { email: string; password: string };
export type ProfileUpdatePayload = Partial<
  Pick<UserProfile, "name" | "email" | "city" | "bacStream" | "language" | "onboardingCompleted">
>;

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export type ResultKind = "free" | "premium";
export type ResultSource = "ai" | "fallback";

export type LatestResult = {
  kind: ResultKind;
  result: OrientationResult;
  accessLevel: AccessLevel;
  source: ResultSource;
  generatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Assessment questions (served by GET /assessments/*)                 */
/* ------------------------------------------------------------------ */

export type QuestionOption = {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
};

export type ScaleConfig = {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
};

export type AssessmentQuestion = {
  id: string;
  question: string;
  helper?: string;
  type: "single" | "multi" | "scale";
  options?: QuestionOption[];
  scale?: ScaleConfig;
  maxSelections?: number;
  required: boolean;
};

export type AssessmentOverview = {
  questions: AssessmentQuestion[];
  completed: boolean;
  lastSubmittedAt: string | null;
};

/**
 * Returned by POST /assessments/{basic|advanced}/start.
 * The sessionId MUST be sent back with the matching submit call.
 */
export type AssessmentSession = AssessmentOverview & {
  sessionId: string;
};

/**
 * Validation message resolved lazily (at parse time), so it follows the
 * current UI language. Keys live in lib/translations/content.ts.
 */
const required = (key: string) => ({ error: () => translate(getStoredLocale(), `cnt.validation.${key}`) });

/* ------------------------------------------------------------------ */
/* Zod schemas — Basic assessment (12 questions)                       */
/* ------------------------------------------------------------------ */

export const basicSchema = z.object({
  /** 1. Filière du baccalauréat */
  bacStream: z.string().min(1, required("bacStream")),
  /** 2. Points forts académiques */
  academicStrengths: z.array(z.string()).min(1, required("academicStrengths")).max(4),
  /** 3. Matières préférées */
  favouriteSubjects: z.array(z.string()).min(1, required("favouriteSubjects")).max(5),
  /** 4. Intérêts généraux */
  interests: z.array(z.string()).min(1, required("interests")).max(5),
  /** 5. Activités préférées */
  preferredActivities: z.array(z.string()).min(1, required("preferredActivities")).max(4),
  /** 6. Préférence de travail */
  workPreference: z.string().min(1, required("workPreference")),
  /** 7. Ville préférée */
  city: z.string().min(1, required("city")),
  /** 8. Public ou privé */
  studyType: z.enum(["public", "prive", "indifferent"], required("option")),
  /** 9. Budget approximatif */
  budget: z.string().min(1, required("budget")),
  /** 10. Intérêts carrière initiaux */
  careerInterests: z.array(z.string()).min(1, required("careerInterests")).max(5),
  /** 11. Confiance sur la direction */
  confidence: z.number().int().min(1).max(5),
  /** 12. Difficulté principale */
  mainDifficulty: z.string().min(1, required("mainDifficulty")),
});

export type BasicAnswers = z.infer<typeof basicSchema>;

/* ------------------------------------------------------------------ */
/* Zod schemas — Advanced assessment (10 questions)                    */
/* ------------------------------------------------------------------ */

export const advancedSchema = z.object({
  /** 1. Environnement de travail préféré */
  workEnvironment: z.string().min(1, required("workEnvironment")),
  /** 2. Pratique vs théorique */
  learningStyle: z.enum(["pratique", "theorique", "equilibre"], required("option")),
  /** 3. Autonome vs collaboratif */
  workMode: z.enum(["autonome", "collaboratif", "equilibre"], required("option")),
  /** 4. Confort de leadership */
  leadershipComfort: z.number().int().min(1).max(5),
  /** 5. Confiance en communication */
  communicationConfidence: z.number().int().min(1).max(5),
  /** 6. Mobilité géographique */
  mobility: z.string().min(1, required("option")),
  /** 7. Contraintes financières */
  financialConstraint: z.string().min(1, required("option")),
  /** 8. Priorité carrière */
  careerPriority: z.string().min(1, required("careerPriority")),
  /** 9. Objectif long terme */
  longTermGoal: z.string().min(1, required("longTermGoal")),
  /** 10. Plus grand obstacle personnel */
  mainObstacle: z.string().min(1, required("mainObstacle")),
});

export type AdvancedAnswers = z.infer<typeof advancedSchema>;

/* ------------------------------------------------------------------ */
/* Saved items (client-side in MVP)                                    */
/* ------------------------------------------------------------------ */

export type SavedItems = {
  fields: string[];
  resources: string[];
};

/* ------------------------------------------------------------------ */
/* API errors                                                          */
/* ------------------------------------------------------------------ */

export type ApiErrorCode =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "server"
  | "ai_unavailable";

/** Laravel validation failure payload: { field: ["Validation message"] }. */
export type ApiFieldErrors = Record<string, string[]>;

/** Final backend envelope: { success, message, data } / { success, message, errors }. */
export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiFieldErrors;
};

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;
  /** Populated on 422 validation failures from the Laravel backend. */
  fieldErrors?: ApiFieldErrors;

  constructor(code: ApiErrorCode, message: string, status?: number, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/* ------------------------------------------------------------------ */
/* Misc helpers                                                        */
/* ------------------------------------------------------------------ */

export const ROADMAP_STAGE_LABELS: Record<RoadmapStage, string> = {
  explore: "Explorer",
  learn: "Apprendre",
  practice: "Pratiquer",
  prepare: "Préparer",
};

export const ROADMAP_STAGE_DESCRIPTIONS: Record<RoadmapStage, string> = {
  explore: "Découvre les métiers et parle à ceux qui les vivent.",
  learn: "Construis les bases académiques et techniques.",
  practice: "Mets en pratique avec des projets concrets.",
  prepare: "Prépare tes candidatures et saisis les opportunités.",
};

export const RESOURCE_TYPE_LABELS: Record<LearningResource["type"], string> = {
  course: "Cours",
  podcast: "Podcast",
  ebook: "E-book",
};
