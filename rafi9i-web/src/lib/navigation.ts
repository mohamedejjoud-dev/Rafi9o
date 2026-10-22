/**
 * Rafi9i — Public navigation model (Developer 1)
 * Used by the navbar, the mobile menu and the footer so labels stay
 * consistent everywhere.
 */

export type PublicNavLink = { href: string; label: string };

/** Primary public navigation (desktop + mobile). */
export const PUBLIC_NAV: PublicNavLink[] = [
  { href: "/orientation", label: "Orientation" },
  { href: "/soft-skills", label: "Soft skills" },
  { href: "/resources", label: "Ressources" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/about", label: "À propos" },
  { href: "/agent", label: "Rafi IA" },
];

/** Entry points to Developer 2's product journey. */
export const PRODUCT_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
} as const;

/** Landing demo anchor — static product preview, works without backend. */
export const DEMO_ANCHOR = "/#apercu-produit";

/** Footer link groups. */
export const FOOTER_NAV: { title: string; links: PublicNavLink[] }[] = [
  {
    title: "Produit",
    links: [
      ...PUBLIC_NAV,
      { href: "/auth/register", label: "Créer un compte" },
    ],
  },
  {
    title: "Informations",
    links: [
      { href: "/legal/privacy", label: "Confidentialité" },
      { href: "/legal/terms", label: "Conditions d'utilisation" },
      { href: "/about", label: "À propos" },
    ],
  },
];
