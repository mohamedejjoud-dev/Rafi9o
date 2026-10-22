/**
 * Rafi9i — Upgrade button WITHOUT real payment (Developer 2)
 * Leads to a "Bientôt disponible" state — payment infra is out of MVP scope.
 */
"use client";

import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function UpgradeButton({
  className = "",
  label = "Passer à Premium",
}: {
  className?: string;
  label?: string;
}) {
  const { toast } = useToast();

  return (
    <Button
      className={`gap-2 ${className}`}
      onClick={() =>
        toast({
          title: "Bientôt disponible 👑",
          description:
            "Le paiement en ligne n'est pas encore actif dans ce MVP. Profite de l'Aperçu gratuit de 3 jours !",
        })
      }
    >
      <Crown className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
