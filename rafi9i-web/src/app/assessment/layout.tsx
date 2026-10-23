/**
 * Rafi9i — noindex layout for private segments (Developer 1)
 * Server-only layout that keeps authenticated routes out of search
 * indexes, with the shared focused-flow top bar (brand, back, language).
 */
import type { Metadata } from "next";
import AppTopBar from "@/components/navigation/AppTopBar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppTopBar showBack={false} />
      {children}
    </>
  );
}
