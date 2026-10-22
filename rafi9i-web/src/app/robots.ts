/**
 * Rafi9i — Robots (Developer 1)
 * Allow all public content; disallow every authenticated segment of the
 * product (auth, assessment, results, trial, dashboard, admin, api).
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth", "/assessment", "/results", "/trial", "/dashboard", "/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
