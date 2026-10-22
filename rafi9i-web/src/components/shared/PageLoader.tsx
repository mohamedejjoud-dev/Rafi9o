/**
 * Rafi9i — Page loader with Rafi thinking (Developer 2)
 */
"use client";

import { Loader2 } from "lucide-react";
import FoxGuide from "@/components/fox/FoxGuide";

export default function PageLoader({ message = "Rafi prépare quelque chose…" }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6" role="status" aria-live="polite">
      <FoxGuide stage="dashboard" mood="thinking" message={message} compact />
      <Loader2 className="h-5 w-5 animate-spin text-orange-600" aria-hidden />
    </div>
  );
}
