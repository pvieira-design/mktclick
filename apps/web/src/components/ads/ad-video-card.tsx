import { Badge } from "@/components/base/badges/badges";
import type { BadgeColors } from "@/components/base/badges/badge-types";
import { TEMA_LABELS, ESTILO_LABELS, FORMATO_LABELS } from "@/components/ads/ad-constants";

interface AdVideoCardProps {
  video: {
    id: string;
    nomeDescritivo: string;
    tema: string;
    estilo: string;
    formato: string;
    phaseStatus: string;
    currentPhase: number;
    criador?: { name: string; imageUrl: string | null; code: string | null } | null;
  };
  index: number;
}

const PHASE_STATUS_CONFIG: Record<string, { label: string; color: BadgeColors }> = {
  PENDENTE: { label: "Pendente", color: "gray" },
  EM_ANDAMENTO: { label: "Em Andamento", color: "blue" },
  PRONTO: { label: "Pronto", color: "success" },
  ELENCO: { label: "Elenco", color: "brand" },
  PRE_PROD: { label: "Pre-Producao", color: "orange" },
  EM_PRODUCAO: { label: "Em Producao", color: "blue" },
  ENTREGUE: { label: "Entregue", color: "success" },
  EM_REVISAO: { label: "Em Revisao", color: "warning" },
  VALIDANDO: { label: "Validando", color: "brand" },
  APROVADO: { label: "Aprovado", color: "success" },
  NOMENCLATURA: { label: "Nomenclatura", color: "blue" },
  PUBLICADO: { label: "Publicado", color: "success" },
  REJEITADO: { label: "Rejeitado", color: "error" },
};

export function AdVideoCard({ video, index }: AdVideoCardProps) {
  const statusConfig = PHASE_STATUS_CONFIG[video.phaseStatus] || {
    label: video.phaseStatus,
    color: "gray" as BadgeColors,
  };

  return (
    <div className="rounded-lg bg-primary ring-1 ring-border-secondary p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-quaternary">#{index + 1}</span>
            <h4 className="text-sm font-semibold text-primary truncate">
              {video.nomeDescritivo}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-tertiary">
            <span>{TEMA_LABELS[video.tema] || video.tema}</span>
            <span className="text-quaternary">|</span>
            <span>{ESTILO_LABELS[video.estilo] || video.estilo}</span>
            <span className="text-quaternary">|</span>
            <span>{FORMATO_LABELS[video.formato] || video.formato}</span>
          </div>
          {video.criador && (
            <p className="text-xs text-quaternary mt-1">
              Criador: {video.criador.name}
            </p>
          )}
        </div>
        <Badge type="pill-color" size="sm" color={statusConfig.color}>
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
}
