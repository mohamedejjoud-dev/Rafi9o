/**
 * Rafi9i — PublicShell (Developer 1)
 * Shared layout for every public page: skip link, sticky navbar,
 * stretchable main (sticky-footer pattern), navy footer. Public pages
 * wrap their content in <PublicShell> so Developer 2's authenticated
 * routes keep their own chrome untouched.
 */
import type { ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import SkipLink from "./SkipLink";
import RafiFab from "@/components/agent/RafiFab";

export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <PublicNavbar />
      <main id="contenu-principal" className="flex-1">
        {children}
      </main>
      <PublicFooter />
      <RafiFab />
    </div>
  );
}
