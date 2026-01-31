"use client";

import { VIDEO_PHASE_STATUS_CONFIG } from "../ad-constants";

interface VideoStatusTrackerProps {
  phaseStatus: string;
  phase: number;
}

export function VideoStatusTracker({ phaseStatus }: VideoStatusTrackerProps) {
  const config = VIDEO_PHASE_STATUS_CONFIG[phaseStatus] || VIDEO_PHASE_STATUS_CONFIG.PENDENTE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config?.bgColor || ""} ${config?.color || ""}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          phaseStatus === "PRONTO" || phaseStatus === "ENTREGUE" || phaseStatus === "PUBLICADO" || phaseStatus === "APROVADO"
            ? "bg-success-primary"
            : phaseStatus === "PENDENTE"
              ? "bg-quaternary"
              : "bg-brand-primary"
        }`}
      />
      {config?.label || phaseStatus}
    </span>
  );
}
