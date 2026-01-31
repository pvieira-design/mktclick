import { Badge } from "@/components/base/badges/badges";
import type { BadgeColors } from "@/components/base/badges/badge-types";

interface AdPhaseBadgeProps {
  phase: number;
  totalPhases?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const phaseConfig: Record<number, { label: string; color: BadgeColors }> = {
  1: { label: "Briefing", color: "gray" },
  2: { label: "Roteiro", color: "blue" },
  3: { label: "Elenco", color: "brand" },
  4: { label: "Producao", color: "orange" },
  5: { label: "Revisao", color: "warning" },
  6: { label: "Publicacao", color: "success" },
};

export function AdPhaseBadge({ phase, totalPhases = 6, size = "sm", className }: AdPhaseBadgeProps) {
  const config = phaseConfig[phase] || { label: "Desconhecida", color: "gray" as BadgeColors };

  return (
    <Badge type="pill-color" size={size} color={config.color} className={className}>
      Fase {phase}/{totalPhases}: {config.label}
    </Badge>
  );
}
