/**
 * Rafi9i — Sitemap (Developer 1)
 * Public indexable routes only. Private routes are excluded here AND
 * disallowed in robots.ts.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/orientation", "/soft-skills", "/resources", "/pricing", "/about", "/legal/privacy", "/legal/terms"];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/legal") ? 0.3 : 0.8,
  }));
}
