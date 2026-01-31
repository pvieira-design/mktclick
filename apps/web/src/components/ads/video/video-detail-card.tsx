"use client";

import { VIDEO_PHASE_STATUS_CONFIG, TEMA_LABELS, ESTILO_LABELS, FORMATO_LABELS } from "../ad-constants";

interface VideoDetailCardProps {
  video: any;
  index: number;
  project: any;
  onRefresh: () => void;
}

export function VideoDetailCard({ video, index, project, onRefresh }: VideoDetailCardProps) {
  const statusConfig = VIDEO_PHASE_STATUS_CONFIG[video.phaseStatus] || VIDEO_PHASE_STATUS_CONFIG.PENDENTE;

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${statusConfig?.borderColor || "border-border-secondary"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary">
            {index + 1}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-primary">
              {video.nomeDescritivo}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-tertiary">
                {TEMA_LABELS[video.tema] || video.tema}
              </span>
              <span className="text-xs text-quaternary">·</span>
              <span className="text-xs text-tertiary">
                {ESTILO_LABELS[video.estilo] || video.estilo}
              </span>
              <span className="text-xs text-quaternary">·</span>
              <span className="text-xs text-tertiary">
                {FORMATO_LABELS[video.formato] || video.formato}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.bgColor || ""} ${statusConfig?.color || ""}`}
        >
          {statusConfig?.label || video.phaseStatus}
        </span>
      </div>

      {video.criador && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-quaternary">Criador:</span>
          <span className="text-xs font-medium text-primary">
            {video.criador.name}
          </span>
        </div>
      )}

      {video.deliverables && video.deliverables.length > 0 && (
        <div className="mt-3 pt-3 border-t border-secondary">
          <span className="text-xs text-quaternary">
            {video.deliverables.length} hook{video.deliverables.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
