/**
 * Rafi9i — Metadata factory (Developer 1)
 * Centralizes canonical URLs, Open Graph and Twitter cards for the
 * public routes. Private routes never call this.
 */
import type { Metadata } from "next";
import { OG_DEFAULT_IMAGE, SITE_NAME, SITE_URL } from "./constants";

export interface BuildMetadataInput {
  /** Page title without the brand suffix. */
  title: string;
  description: string;
  /** Public path starting with "/", e.g. "/orientation". */
  path: string;
  /** Optional custom OG image path. */
  ogImage?: string;
}

export function buildMetadata({ title, description, path, ogImage }: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const image = ogImage ?? OG_DEFAULT_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "fr_MA",
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE_NAME} — orientation et soft skills pour les étudiants au Maroc` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}
