# Rafi9i — Design System (public frontend, Developer 1)

Shared components and tokens usable by **every developer** on the frontend. The authenticated
product pages (Developer 2) already follow this visual language; these primitives make it
explicit and reusable.

## 1. Design tokens

Defined centrally in `src/app/globals.css` (Tailwind v4 `@theme`).

### Colors

| Token family | Usage | Example utilities |
|---|---|---|
| `orange-*` (VEROX fox orange, `#F88541` at 500) | **Primary brand** — CTAs, active states, icon chips | `bg-orange-500`, `text-orange-700` |
| `amber-*` | Warm accents, demo badges | `bg-amber-50`, `text-amber-800` |
| `navy-*` | **Structure** — dark bands, footer, headings, navy surfaces (`#17324D` at 800) | `bg-navy-900`, `text-navy-800` |
| `fox-*` | **Mascot & highlights** — same ramp as `orange-*` (`#F88541` at 500) | `from-fox-400`, `text-fox-700` |
| `pine-*` | Success / free tier (`#2E8B57` at 500) | `text-pine-700`, `bg-pine-50` |

> Changing the brand: edit the `@theme` blocks in `globals.css`. Logo/mascot artwork comes from the
> VEROX sheet — regenerate with `node scripts/gen-logo.mjs`.

### Typography

- **Fraunces** (serif, via `next/font`) — `h1`/`h2` automatically; `font-serif` utility.
- **Nunito Sans** (body, via `next/font`) — default `font-sans`.

### Motion primitives (CSS classes)

| Class | Effect | Reduced motion |
|---|---|---|
| `.rf-float` | gentle vertical float (mascot idle) | disabled |
| `.rf-walk` | walking bounce (FoxPath) | disabled |
| `.rf-sparkle` | sparkle pulse | disabled |
| `.rf-slide` | smooth horizontal slide (FoxPath position) | disabled |
| `.rf-zellige` | subtle Moroccan lattice for navy bands | n/a (static) |

All animations respect `prefers-reduced-motion: reduce`.

## 2. Shared components (`src/components/shared/`)

| Component | Props | Notes |
|---|---|---|
| `PageContainer` | `children`, `className` | 72rem max width, responsive gutters. Wrap every page section. |
| `SectionHeading` | `eyebrow?`, `title`, `description?`, `align?`, `as?` | Consistent intro rhythm; `as="h1"` for page titles. |
| `PrimaryButton` / `SecondaryButton` | `href?` (renders `Link`), `size?: sm|md|lg`, `type?`, `onClick?` | Self-contained (no shadcn dependency). Primary = terracotta gradient; secondary = white/navy outline. |
| `FeatureCard` | `icon: LucideIcon`, `title`, `children` | Hover lift included (`.rafi-card-hover`). |
| `ResourceCard` (public) | `resource: PublicResource` | Static, no external links. Dashboard uses Developer 2's interactive card. |
| `PricingCard` | `name`, `price: string|null`, `description`, `features`, `cta`, `highlighted?`, `badge?` | `price=null` → honest "Bientôt disponible". Never invent prices. |
| `StatusBadge` | `variant?: demo|free|premium|soon|neutral`, `children?` | Static labels for public demo content. |
| `EmptyState` | `icon?`, `title`, `children`, `action?` | Friendly dashed panel. |
| `LoadingSkeleton` | `lines?` | Pulse placeholder. |

> `ErrorState`, `DemoBadge`, `PageLoader` remain Developer 2's components in the same folder —
> reuse them in authenticated flows.

## 3. Mascot (`src/components/mascot/`)

### `RafiFox` — the illustration itself
```tsx
<RafiFox mood="encouraging" stage="welcome" size={96} decorative />
```
- `mood`: `neutral | encouraging | thinking | celebrating | concerned` (drives the face).
- `stage`: `welcome | assessment | thinking | result | progress | achievement` (drives accessories:
  waving paw on `welcome`, sparkles on `achievement`/`celebrating`).
- `decorative`: hides from assistive tech when adjacent text already conveys meaning.

### `FoxGuide` — the guide experience (official contract)
```tsx
<FoxGuide stage="assessment" progress={60}
  message="Encore quelques questions pour mieux te connaître."
  mood="encouraging" compact={false} />
```
- `stage` also accepts Developer 2's product stages: `auth | onboarding | results | trial | dashboard`
  (superset for drop-in compatibility).
- `mood` optional — sensible default per stage.
- `progress` optional (0–100, clamped) — renders a small progress bar in the bubble.
- `compact` — inline/small contexts.
- Import path `@/components/fox/FoxGuide` re-exports this component (legacy path kept stable).

### `FoxPath` — the walking journey
```tsx
<FoxPath progress={60} message="Bien joué ! Encore deux étapes." />
```
- Clamps 0–100; milestones: Inscription → Profil académique → Intérêts → Préférences → Soft
  skills → Résultat; at 100% Rafi celebrates.
- Self-contained block: never overlays forms or navigation.
- Reduced-motion safe; mobile shows only the current label.

### `FoxMessage` / `FoxPlaceholder`
- `FoxMessage`: the speech bubble (progress bar optional).
- `FoxPlaceholder`: polished fallback if the illustration ever fails to render.

## 4. Navigation shell

- `PublicShell` — skip link + `PublicNavbar` + main + `PublicFooter`; sticky footer guaranteed.
- `PublicNavbar` — sticky, session-aware CTA (reads Developer 2's localStorage session, no API
  call), active link underline, accessible mobile menu via `MobileNavigation` (shadcn Sheet:
  Escape closes, closes on link select, `aria-expanded`, focus handled).
- `PublicFooter` — navy band, link groups from `lib/navigation.ts`, honest MVP/disclaimer line.

## 5. SEO toolkit

- `lib/metadata.ts` → `buildMetadata({ title, description, path })`: canonical + OG + Twitter.
- `components/seo/JsonLd` → emits JSON-LD; data from `lib/structured-data.ts` (Organization,
  WebSite, BreadcrumbList, FAQPage — **visible content only, no fake ratings/prices**).
- `components/seo/Breadcrumbs` → visual trail + matching BreadcrumbList JSON-LD.
- `app/sitemap.ts` + `app/robots.ts` → generated at build; private segments disallowed.
- Private segments (`/auth`, `/assessment`, `/results`, `/trial`) additionally carry noindex
  server layouts; `/dashboard` is covered by robots (its layout is client-side).

## 6. Conventions

- Spacing rhythm: sections `py-16 sm:py-20`; cards `p-5`–`p-7`; grids `gap-5`.
- Radius: cards `1.25rem` (`.rafi-card`), buttons `rounded-xl`, chips `rounded-full`.
- Focus: visible ring (`focus-visible:outline-2 outline-orange-600`) on every interactive element.
- Touch targets ≥ 44px on mobile (`h-11` minimum).
- Demo content is **always** badged (`StatusBadge variant="demo"`) and never linked externally.
