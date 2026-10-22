/**
 * Rafi9i — Public site constants (Developer 1)
 * Single source of truth for site identity. Branding can be changed here.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rafi9i.co.uk";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const SITE_NAME = "Rafi9i";

export const SITE_TAGLINE = "Ton parcours commence par mieux te connaître.";

export const SITE_DESCRIPTION =
  "Rafi9i aide les lycéens et étudiants du Maroc à choisir leur orientation, développer leurs soft skills et réussir les concours d'excellence — évaluation gratuite, plan personnalisé et ressources avec Rafi AI comme conseiller intelligent.";

/** Default social-sharing image (1200×630). */
export const OG_DEFAULT_IMAGE = "/images/og-default.png";

/** Frontend demo flag (public pages always ship their own static demo data). */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Legal / disclaimer copy reused across public pages. */
export const DISCLAIMER_SHORT =
  "Les recommandations de Rafi9i sont indicatives : elles ne constituent ni une garantie d'admission, ni un diagnostic, ni un conseil officiel.";
