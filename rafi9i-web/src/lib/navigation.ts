/**
 * Rafi9i — Public navigation model (Developer 1)
 * Used by the navbar, the mobile menu and the footer so labels stay
 * consistent everywhere.
 */

/** `label` is the French fallback; render `t(labelKey)` for the UI locale. */
export type PublicNavLink = { href: string; label: string; labelKey: string };

/** Primary public navigation (desktop + mobile). */
export const PUBLIC_NAV: PublicNavLink[] = [
  { href: "/orientation", label: "Orientation", labelKey: "nav.orientation" },
  { href: "/soft-skills", label: "Soft skills", labelKey: "nav.softSkills" },
  { href: "/resources", label: "Ressources", labelKey: "nav.resources" },
  { href: "/pricing", label: "Tarifs", labelKey: "nav.pricing" },
  { href: "/about", label: "À propos", labelKey: "nav.about" },
  { href: "/agent", label: "Rafi IA", labelKey: "nav.agent" },
];

/** Entry points to Developer 2's product journey. */
export const PRODUCT_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
} as const;

/** Landing demo anchor — static product preview, works without backend. */
export const DEMO_ANCHOR = "/#apercu-produit";

/** Footer link groups (`titleKey` / `labelKey` are translation keys). */
export const FOOTER_NAV: { title: string; titleKey: string; links: PublicNavLink[] }[] = [
  {
    title: "Produit",
    titleKey: "footer.product",
    links: [
      ...PUBLIC_NAV,
      { href: "/auth/register", label: "Créer un compte", labelKey: "footer.account" },
    ],
  },
  {
    title: "Informations",
    titleKey: "footer.info",
    links: [
      { href: "/legal/privacy", label: "Confidentialité", labelKey: "footer.privacy" },
      { href: "/legal/terms", label: "Conditions d'utilisation", labelKey: "footer.terms" },
      { href: "/about", label: "À propos", labelKey: "nav.about" },
    ],
  },
];
