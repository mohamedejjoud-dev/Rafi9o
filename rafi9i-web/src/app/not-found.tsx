/**
 * Rafi9i — not-found (Educational Edition)
 * Branded 404 with 3D Rafi in his thinking pose looking at his tablet.
 */
import Link from "next/link";
import PublicShell from "@/components/navigation/PublicShell";
import RafiFox from "@/components/mascot/RafiFox";
import { PrimaryButton, SecondaryButton } from "@/components/shared/Buttons";

export default function NotFound() {
  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <div className="rf-float">
          <RafiFox mood="thinking" size={170} />
        </div>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-semibold text-orange-800">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          Erreur 404 · Page introuvable
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Rafi cherche encore cette page…
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
          Cette adresse n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude : Rafi t&apos;attend pour poursuivre ton parcours d&apos;orientation.
        </p>
        <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
          <PrimaryButton href="/" size="lg">
            Retour à l&apos;accueil
          </PrimaryButton>
          <SecondaryButton href="/orientation" size="lg">
            Explorer l&apos;orientation
          </SecondaryButton>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Tu possèdes déjà un compte ?{" "}
          <Link href="/auth/login" className="font-semibold text-orange-600 underline decoration-orange-300 hover:text-orange-700">
            Connecte-toi ici
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
