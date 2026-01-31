import { BadgeWithDot } from "@/components/base/badges/badges";
import type { BadgeColors } from "@/components/base/badges/badge-types";

export type AdProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

interface AdStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  AdProjectStatus,
  { label: string; color: BadgeColors }
> = {
  DRAFT: { label: "Rascunho", color: "gray" },
  ACTIVE: { label: "Ativo", color: "blue" },
  COMPLETED: { label: "Concluido", color: "success" },
  CANCELLED: { label: "Cancelado", color: "error" },
};

export function AdStatusBadge({
  status,
  size = "sm",
  className,
}: AdStatusBadgeProps) {
  const config =
    statusConfig[status as AdProjectStatus] ||
    { label: status, color: "gray" as BadgeColors };

  return (
    <BadgeWithDot
      type="pill-color"
      size={size}
      color={config.color}
      className={className}
    >
      {config.label}
    </BadgeWithDot>
  );
}
