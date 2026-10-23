/**
 * Rafi9i — not-found (Educational Edition)
 * Branded 404 with 3D Rafi in his thinking pose looking at his tablet.
 * The visible copy lives in a client component so it follows the UI locale.
 */
import PublicShell from "@/components/navigation/PublicShell";
import NotFoundContent from "@/components/marketing/NotFoundContent";

export default function NotFound() {
  return (
    <PublicShell>
      <NotFoundContent />
    </PublicShell>
  );
}
