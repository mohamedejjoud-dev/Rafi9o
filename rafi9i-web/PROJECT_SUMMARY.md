# Rafi9i Project Summary

## Overview
**Rafi9i** is an AI-powered academic orientation platform for Moroccan high school students. It helps students discover their ideal career paths, develop soft skills, and navigate the Moroccan education system (Baccalaureate to university/Grande Écoles).

**Tech Stack:**
- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + Shadcn-like components
- **State Management:** Zustand, React Context
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **i18n:** Custom implementation (FR/EN/AR with RTL support)
- **AI Agent:** Rule-based frontend AI (simulated LLM behavior)

---

## Project Structure

```
work/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout with I18nProvider, ThemeProvider
│   │   ├── page.tsx             # Landing page
│   │   ├── agent/               # AI Agent page
│   │   ├── auth/                # Authentication (login/register)
│   │   ├── dashboard/           # Protected dashboard pages
│   │   ├── assessment/          # Assessment flow
│   │   ├── orientation/         # Orientation tool
│   │   ├── resources/           # Resources page
│   │   ├── results/             # Results display
│   │   ├── trial/               # Trial pages
│   │   └── legal/               # Legal pages
│   ├── components/
│   │   ├── agent/               # AI Agent components
│   │   ├── assessment/          # Assessment UI
│   │   ├── dashboard/           # Dashboard components
│   │   ├── fox/                 # Fox mascot components
│   │   ├── marketing/           # Landing page sections
│   │   ├── mascot/              # 3D fox guide components
│   │   ├── navigation/          # Navbar, footer, language switcher
│   │   ├── progress/            # Progress charts
│   │   ├── resources/           # Resource cards
│   │   ├── results/             # Results display
│   │   ├── seo/                 # SEO components
│   │   ├── shared/              # Shared UI components
│   │   ├── trial/               # Trial components
│   │   └── ui/                  # Base UI components (buttons, inputs, etc.)
│   ├── lib/
│   │   ├── i18n.tsx             # Internationalization (FR/EN/AR)
│   │   ├── theme.tsx            # Dark/Light mode provider
│   │   ├── rafi-agent.ts        # AI Agent logic (quiz generation, analysis)
│   │   ├── auth-client.ts       # Authentication utilities
│   │   ├── assessment-store.ts # Assessment state management
│   │   ├── api.ts               # API utilities
│   │   ├── constants.ts         # App constants
│   │   ├── types.ts             # TypeScript types
│   │   └── utils.ts             # Utility functions
│   └── hooks/                   # Custom React hooks
├── public/                      # Static assets (images, mascot photos)
├── docs/                        # Documentation
└── scripts/                     # Build/deployment scripts
```

---

## Key Components & Functions

### 1. Internationalization (i18n.tsx)
**Purpose:** Multi-language support (French, English, Arabic) with RTL for Arabic

**Key Variables:**
- `Locale`: Type = "fr" | "en" | "ar"
- `LOCALES`: Array of locale info with flags, names, directions
- `translations`: Object containing all translation keys for each language

**Key Functions:**
- `I18nProvider({ children })`: Context provider for i18n
  - Detects browser language on first visit
  - Persists locale to localStorage
  - Applies RTL/LTR to document
- `useI18n()`: Hook to access translations
  - Returns: `{ locale, dir, setLocale, t, localeInfo }`
  - `t(key)`: Translation function with fallback to French

**Usage:**
```typescript
const { t, locale, setLocale } = useI18n();
const text = t("hero.title"); // Returns translated text
setLocale("ar"); // Switch to Arabic (RTL)
```

---

### 2. Theme Provider (theme.tsx)
**Purpose:** Dark/Light mode toggle with system preference detection

**Key Variables:**
- `Theme`: Type = "light" | "dark"

**Key Functions:**
- `ThemeProvider({ children })`: Context provider
  - Reads from localStorage
  - Respects system preference (prefers-color-scheme)
  - Toggles "dark" class on document
- `useTheme()`: Hook to access theme
  - Returns: `{ theme, toggleTheme, setTheme, isDark }`

---

### 3. AI Agent (rafi-agent.ts)
**Purpose:** Simulated AI agent for quizzes, profile analysis, challenges

**Key Types:**
```typescript
type StudentProfile = {
  bacStream?: "sm" | "pc" | "svt" | "eco" | "lettres";
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  preferredStyle?: "analytical" | "creative" | "social" | "practical";
  score?: number;
  goals?: string[];
};

type ChatMessage = {
  id: string;
  role: "user" | "rafi";
  content: string;
  type?: "text" | "quiz" | "challenge" | "analysis" | "field-list" | "ask";
  data?: QuizData | ChallengeData | AnalysisData | FieldData | AskData;
  timestamp: Date;
};
```

**Key Functions:**
- `generateAgentResponse(input, profile, locale)`: Main AI response generator
  - Detects intent (quiz, challenge, analyze, fields, greeting)
  - Returns structured message with optional rich data
- `generateQuizFor(stream)`: Generates quiz questions based on Bac stream
- `analyzeProfile(profile)`: Analyzes student profile and returns strengths, recommended fields
- `characterQuestion(locale, missing)`: Generates follow-up questions for missing profile data

**Data Banks:**
- `QUIZ_BANK`: Quiz questions for each Bac stream (SM, PC, SVT, Eco, Lettres)
- `CHALLENGES`: Pre-defined challenges for students
- `FIELD_SCHOOLS`: School data for each field

---

### 4. Authentication (auth-client.ts)
**Purpose:** User authentication flow

**Key Functions:**
- `login({ email, password })`: Authenticates user
- `register({ email, password, name })`: Registers new user
- `logout()`: Logs out user
- `getSession()`: Returns current session
- `onSessionChange(callback)`: Listens for session changes
- `useRequireAuth()`: Hook to protect authenticated routes

---

### 5. Assessment Store (assessment-store.ts)
**Purpose:** State management for assessment flow

**Key Variables:**
- Current step, answers, progress, score

**Key Functions:**
- State management for multi-step assessment
- Progress tracking
- Answer validation

---

## Main Page Components

### Landing Page (page.tsx)
**Components:**
- Hero: 3D fox mascot with interactive Bac stream selector
- ProblemSection: Explains orientation challenges
- ProductPillars: Three core value propositions
- HowItWorks: Five-step process explanation
- ProductPreview: Interactive dashboard preview
- ResourcesPreview: Resources showcase
- PremiumPreview: Premium features
- PricingPreview: Pricing information
- FinalCTA: Final call-to-action

### Dashboard (dashboard/)
**Pages:**
- Dashboard: Main overview
- Orientation: Orientation results
- Soft Skills: Soft skills development
- Roadmap: Progress roadmap
- Progress: Progress tracking
- Saved: Saved items
- Settings: User settings

**Layout:** Sidebar navigation + mobile header with language/theme switchers

### AI Agent Page (agent/page.tsx)
**Features:**
- Chat interface with Rafi AI
- Bac stream selector
- Quick action buttons (quiz, analyze, challenge, fields, ask)
- Feature cards showing AI capabilities

---

## Translation Keys (i18n.tsx)

**Key Sections:**
- Navigation: `nav.orientation`, `nav.softSkills`, `nav.resources`, etc.
- Hero: `hero.badge`, `hero.title`, `hero.body`, etc.
- Streams: `stream.sm`, `stream.pc`, `stream.svt`, etc.
- AI Agent: `ai.title`, `ai.subtitle`, `ai.greeting`, etc.
- Pillars: `pillars.eyebrow`, `pillars.title`, `pillars.card1.title`, etc.
- How It Works: `how.eyebrow`, `how.step1.title`, etc.
- Problem: `problem.eyebrow`, `problem.card1.title`, etc.
- Preview: `preview.eyebrow`, `preview.tab1`, etc.
- Auth: `auth.subtitle`, `auth.title`, `login.title`, etc.
- Dashboard: `dash.home`, `dash.orientation`, etc.
- Theme: `theme.light`, `theme.dark`
- Language: `lang.choose`

---

## Environment Variables (.env)
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Available Scripts

```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Key Features Implemented

1. **Multi-language Support (FR/EN/AR)**
   - Language switcher in navbar, dashboard, auth pages
   - RTL support for Arabic
   - Browser language detection on first visit
   - All major sections translated

2. **Dark/Light Mode**
   - Theme toggle in navbar, dashboard, auth pages
   - System preference detection
   - Persistent storage

3. **AI Agent**
   - Chat interface with Rafi fox
   - Quiz generation based on Bac stream
   - Profile analysis with strength/weakness identification
   - Challenge creation
   - Field/school recommendations
   - Character questions to build profile

4. **Assessment Flow**
   - Multi-step assessment wizard
   - Progress tracking
   - Score calculation

5. **Dashboard**
   - Protected routes
   - Sidebar navigation
   - Mobile-responsive header
   - Language/theme switchers

---

## Known Issues & Current State

**Completed:**
- ✅ Language switcher on all pages (navbar, dashboard, auth)
- ✅ Translations for Hero, ProductPillars, HowItWorks, ProblemSection
- ✅ useMemo for locale-dependent data to ensure re-rendering
- ✅ Browser language detection
- ✅ Dark/light mode toggle
- ✅ AI agent with quiz, analysis, challenges
- ✅ Logo design (fox + RAFI9I)

**Still In Progress:**
- ⏳ Complete translations for ProductPreview detailed content
- ⏳ Footer translations
- ⏳ Additional pages (resources, pricing, etc.)
- ⏳ More human-friendly language throughout

---

## Important Notes for Next Developer

1. **Locale Re-rendering:** Components that use translations must use `useMemo` with `locale` dependency to ensure they re-render when language changes.

2. **I18n Pattern:** Always use `useI18n()` hook and `t()` function for translatable text. Never hardcode French text in components.

3. **AI Agent:** Currently rule-based (no external API). To integrate real LLM, replace `generateAgentResponse()` function.

4. **Bac Streams:** The 5 main Moroccan Bac streams:
   - SM: Sciences Mathématiques
   - PC: Physique-Chimie
   - SVT: Sciences de la Vie et de la Terre
   - Eco: Sciences Économiques & Gestion
   - Lettres: Lettres & Sciences Humaines

5. **State Management:** Zustand used for assessment store, React Context for theme/i18n.

6. **Component Pattern:** Most marketing components follow pattern:
   - "use client" directive
   - useI18n() hook for translations
   - useMemo for locale-dependent data
   - SectionHeading for titles
   - FeatureCard for content cards

---

## File Dependencies

**Critical Files:**
- `src/lib/i18n.tsx` - All translations
- `src/lib/theme.tsx` - Theme management
- `src/lib/rafi-agent.ts` - AI logic
- `src/app/layout.tsx` - Root layout with providers
- `src/components/navigation/PublicNavbar.tsx` - Main navigation
- `src/components/navigation/LanguageSwitcher.tsx` - Language toggle
- `src/components/navigation/ThemeToggle.tsx` - Theme toggle

**When Editing:**
- Adding new translations → Edit `src/lib/i18n.tsx`
- Adding new component → Use "use client" + useI18n() + useMemo pattern
- Modifying AI behavior → Edit `src/lib/rafi-agent.ts`
- Changing layout → Edit `src/app/layout.tsx`

---

## Contact & Support

- Project: Rafi9i
- Target: Moroccan high school students
- Focus: Academic orientation, soft skills, career guidance
