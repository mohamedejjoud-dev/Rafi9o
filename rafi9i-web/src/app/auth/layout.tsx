/**
 * Rafi9i — noindex layout for private segments (Developer 1)
 * Server-only layout that keeps authenticated routes out of search
 * indexes. Renders children untouched (Developer 2's pages stay intact).
 */
import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
