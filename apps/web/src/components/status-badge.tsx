import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RequestStatus = "DRAFT" | "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";

interface StatusBadgeProps {
  status: RequestStatus;
  size?: "sm" | "default";
  className?: string;
}

export function StatusBadge({ status, size = "default", className }: StatusBadgeProps) {
  const config = {
    DRAFT: {
      variant: "secondary" as const,
      label: "Rascunho",
      className: "bg-slate-100 text-slate-600 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-400",
    },
    PENDING: {
      variant: "secondary" as const,
      label: "Pendente",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-900/80",
    },
    IN_REVIEW: {
      variant: "secondary" as const,
      label: "Em Revisão",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-900/80",
    },
    APPROVED: {
      variant: "secondary" as const,
      label: "Aprovado",
      className: "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-900/80",
    },
    REJECTED: {
      variant: "destructive" as const,
      label: "Rejeitado",
      className: "",
    },
    CANCELLED: {
      variant: "outline" as const,
      label: "Cancelado",
      className: "text-muted-foreground border-dashed",
    },
  };

  const statusConfig = config[status];

  return (
    <Badge
      variant={statusConfig.variant}
      className={cn(
        "whitespace-nowrap font-medium transition-colors",
        size === "sm" ? "text-xs px-2 py-0.5 h-5" : "text-sm px-3 py-1 h-6",
        statusConfig.className,
        className
      )}
    >
      {statusConfig.label}
    </Badge>
  );
}
