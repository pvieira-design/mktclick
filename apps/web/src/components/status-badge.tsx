import { BadgeWithDot } from "@/components/base/badges/badges";
import type { BadgeColors } from "@/components/base/badges/badge-types";

export type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CORRECTED"
  | "CANCELLED";

interface StatusBadgeProps {
  status: RequestStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  RequestStatus,
  { label: string; color: BadgeColors }
> = {
  DRAFT: { label: "Rascunho", color: "gray" },
  PENDING: { label: "Pendente", color: "warning" },
  IN_REVIEW: { label: "Em Revisao", color: "blue" },
  APPROVED: { label: "Aprovado", color: "success" },
  REJECTED: { label: "Rejeitado", color: "error" },
  CORRECTED: { label: "Corrigido", color: "brand" },
  CANCELLED: { label: "Cancelado", color: "gray" },
};

export function StatusBadge({
  status,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

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
