/**
 * Rafi9i — Root template: re-mounts on navigation, so pages fade/slide in.
 */
import PageTransition from "@/components/motion/PageTransition";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
