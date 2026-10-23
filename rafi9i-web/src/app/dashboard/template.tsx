/**
 * Rafi9i — Dashboard template (the dashboard layout persists between its pages): re-mounts on navigation, so pages fade/slide in.
 */
import PageTransition from "@/components/motion/PageTransition";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
