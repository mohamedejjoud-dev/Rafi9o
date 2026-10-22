# Rafi9i — Developer 1 deliverable: public frontend, design system & Rafi mascot

This archive contains **Developer 1's work only**: the public marketing website, the shared
design system, the original Rafi fox mascot experience, the SEO/GEO foundations and the
integration glue that unifies it with Developer 2's product frontend.

All of it was built and browser-verified inside the unified Rafi9i web project
(Next.js 16 App Router + React 19 + Tailwind CSS 4 + TypeScript).

---

## 1. Contents (file manifest)

```
src/
├── app/
│   ├── page.tsx                       # Landing (10 sections, replaces Dev 2's temp entry)
│   ├── layout.tsx                     # ⚠️ UNIFIED — see §3 (metadata, fonts kept)
│   ├── globals.css                    # ⚠️ UNIFIED — see §3 (token layer added)
│   ├── sitemap.ts / robots.ts         # Generated sitemap + robots rules
│   ├── not-found.tsx / error.tsx      # Branded 404 + error boundary
│   ├── orientation/page.tsx           # Public orientation page
│   ├── soft-skills/page.tsx           # Public soft-skills page
│   ├── resources/page.tsx             # Public resources page (+ client filters)
│   ├── pricing/page.tsx               # Plans + visible FAQ + FAQPage JSON-LD
│   ├── about/page.tsx                 # Mission, is/is-not, AI vs scoring, MVP scope
│   ├── legal/privacy/page.tsx         # Privacy (MVP working draft)
│   ├── legal/terms/page.tsx           # Terms (MVP working draft)
│   └── auth|assessment|results|trial/layout.tsx   # noindex guards for private segments
├── components/
│   ├── mascot/                        # RafiFox, FoxGuide, FoxMessage, FoxPlaceholder, FoxPath
│   ├── navigation/                    # PublicShell, PublicNavbar, MobileNavigation, PublicFooter
│   ├── marketing/                     # Hero … FinalCTA (9 sections) + ResourcesExplorer
│   ├── seo/                           # JsonLd, Breadcrumbs
│   └── shared/                        # PageContainer, SectionHeading, Buttons, FeatureCard,
│                                      # ResourceCard (public), PricingCard, StatusBadge,
│                                      # EmptyState, LoadingSkeleton
├── lib/
│   ├── constants.ts                   # SITE_URL, name, description, contact, disclaimer
│   ├── navigation.ts                  # Public nav + footer link model
│   ├── metadata.ts                    # buildMetadata(): canonical + OG + Twitter
│   ├── structured-data.ts             # Organization, WebSite, BreadcrumbList, FAQPage
│   └── demo-content.ts                # Static demo resources (badged, no external links)
└── components/fox/FoxGuide.tsx        # ⚠️ INTEGRATION GLUE — re-export shim (see §3)

public/
└── images/                           # VEROX logo assets + og-default.png (1200×630)

docs/design-system.md                  # Full design-system documentation (props, tokens, usage)
scripts/gen-logo.mjs                   # Regenerates logo, favicon and OG PNGs from the VEROX sheet
.env.example                           # Frontend-safe env template
```

## 2. Quick start (inside the unified project)

```bash
bun install
cp .env.example .env     # then adjust if needed
bun run dev              # http://localhost:3000
```

Public routes: `/`, `/orientation`, `/soft-skills`, `/resources`, `/pricing`, `/about`,
`/legal/privacy`, `/legal/terms`. Generated: `/sitemap.xml`, `/robots.txt`.

## 3. Integration glue (already applied in the unified project)

These are the **only** files shared with Developer 2 that were touched, and why:

| File | Change |
|---|---|
| `src/app/layout.tsx` | Added full Metadata API (metadataBase, title template, OG/Twitter with the generated image). Fonts and Toaster untouched. |
| `src/app/globals.css` | Appended the Developer 1 token layer (navy/fox/pine ramps), zellige lattice, skip-link, motion primitives with reduced-motion guards. Existing terracotta system untouched. |
| `src/components/fox/FoxGuide.tsx` | Replaced the temporary mock with a one-line re-export of the official mascot — all 16 Developer 2 call sites compile unchanged. |
| `.env` / `.env.example` | Added `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_DEMO_MODE`. |
| `public/robots.txt` | **Deleted** (scaffold leftover) — it conflicted with the generated `app/robots.ts`. |
| `package.json` | Package renamed `rafi9i-web`; unused scaffold deps pruned (`prisma`, `next-auth`, `z-ai-web-dev-sdk`). |

If you extract this archive into a checkout that already contains Developer 2's work, these
unified files simply overwrite their older versions — that is intentional.

## 4. Mascot contract (for Developer 2)

```tsx
import FoxGuide from "@/components/fox/FoxGuide";   // legacy path — still works
// or: import FoxGuide from "@/components/mascot/FoxGuide";

<FoxGuide stage="assessment" progress={60}
  message="Encore quelques questions pour mieux te connaître."
  mood="encouraging" compact={false} />
```

- Stages: `welcome | assessment | thinking | result | progress | achievement` **plus** the
  product stages `auth | onboarding | results | trial | dashboard` (drop-in superset).
- Moods: `neutral | encouraging | thinking | celebrating` **plus** legacy `concerned`.
- `FoxPath` for the walking journey, `FoxPlaceholder` as the fallback, `RafiFox` for raw
  illustration needs. Full documentation: `docs/design-system.md`.

## 5. Agreed decisions

- **Demo route**: "Voir la démo" leads to `/#apercu-produit` — a static, server-rendered
  preview on the landing. Developer 2's `/results/premium` and `/dashboard` are auth-gated and
  therefore cannot serve anonymous demos; the static preview works even with the API down
  (spec §28). Public pages make **zero** API calls.
- **Noindex**: robots.ts disallows `/auth`, `/assessment`, `/results`, `/trial`, `/dashboard`,
  `/admin`, `/api`; server noindex layouts additionally guard the first four segments
  (`/dashboard`'s layout is client-side — robots covers it).
- **Honesty constraints**: no invented prices ("Bientôt disponible" instead), no invented
  statistics, no fake partnerships/ratings; all demo content badged "Démo"; disclaimers on
  orientation/soft-skills pages; payment-not-active notes on pricing.

## 6. Verification performed (in the unified project)

- ESLint: **0 errors** (warnings are the pre-existing documented hydration pattern).
- Browser E2E: all 8 public routes render; resources filters (8→3→2→8), pricing FAQ toggles,
  demo anchor scrolls below the sticky header; mobile 390×844 hero/menu/footer; mobile menu
  closes after navigation; skip link + keyboard focus visible; 404 branded; `/auth/login`
  renders with the new mascot through the shim; auth redirects intact.
- Generated routes verified: `/sitemap.xml`, `/robots.txt` (after removing the conflicting
  scaffold `public/robots.txt`).
- Zero console/page errors across the whole pass.
