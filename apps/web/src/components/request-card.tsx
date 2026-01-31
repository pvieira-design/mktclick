import Link from "next/link";
import { BadgeWithDot } from "@/components/base/badges/badges";
import type { BadgeColors } from "@/components/base/badges/badge-types";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    contentTypeId?: string;
    contentType?: { name: string } | string | null;
    status: string;
    originId?: string;
    origin?: { name: string } | string | null;
    priority: string;
    deadline: Date | null;
    createdAt: Date;
    createdBy: { name: string | null } | null;
  };
}

const statusConfig: Record<string, { label: string; color: BadgeColors }> = {
  DRAFT: { label: "Rascunho", color: "gray" },
  PENDING: { label: "Pendente", color: "warning" },
  IN_REVIEW: { label: "Em Revisao", color: "blue" },
  APPROVED: { label: "Aprovado", color: "success" },
  REJECTED: { label: "Rejeitado", color: "error" },
  CORRECTED: { label: "Corrigido", color: "brand" },
  CANCELLED: { label: "Cancelado", color: "gray" },
};

const contentTypeLabels: Record<string, string> = {
  VIDEO_UGC: "Video UGC",
  VIDEO_INSTITUCIONAL: "Video Institucional",
  CARROSSEL: "Carrossel",
  POST_UNICO: "Post Unico",
  STORIES: "Stories",
  REELS: "Reels",
};

const originLabels: Record<string, string> = {
  OSLO: "Oslo",
  INTERNO: "Interno",
  INFLUENCER: "Influencer",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export function RequestCardSkeleton() {
  return (
    <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <Skeleton className="h-5 w-2/5 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      <div className="flex items-center gap-2 px-5 pb-4">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      <div className="flex items-center justify-between border-t border-secondary px-5 py-3">
        <Skeleton className="h-3.5 w-48 rounded-md" />
        <Skeleton className="h-3.5 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function RequestCard({ request }: RequestCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const getContentTypeName = () => {
    if (typeof request.contentType === "object" && request.contentType?.name) {
      return request.contentType.name;
    }
    if (typeof request.contentType === "string") {
      return contentTypeLabels[request.contentType] || request.contentType;
    }
    return "Tipo nao definido";
  };

  const getOriginName = () => {
    if (typeof request.origin === "object" && request.origin?.name) {
      return request.origin.name;
    }
    if (typeof request.origin === "string") {
      return originLabels[request.origin] || request.origin;
    }
    return "Origem nao definida";
  };

  const status = statusConfig[request.status] || {
    label: request.status,
    color: "gray" as BadgeColors,
  };

  return (
    <Link
      href={`/requests/${request.id}` as any}
      className="block rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary transition-all hover:shadow-md hover:ring-border-primary"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <h3 className="text-md font-semibold text-primary leading-tight">
          {request.title}
        </h3>
        <BadgeWithDot type="pill-color" size="sm" color={status.color}>
          {status.label}
        </BadgeWithDot>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 pb-4 text-sm text-tertiary">
        <span className="font-medium text-secondary">
          {getContentTypeName()}
        </span>
        <span className="text-quaternary">|</span>
        <span>{getOriginName()}</span>
        <span className="text-quaternary">|</span>
        <span
          className={
            request.priority === "URGENT"
              ? "font-medium text-error-primary"
              : ""
          }
        >
          {priorityLabels[request.priority] || request.priority}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-secondary px-5 py-3">
        <p className="text-xs text-tertiary">
          Criado por{" "}
          <span className="font-medium text-secondary">
            {request.createdBy?.name || "Desconhecido"}
          </span>{" "}
          em {formatDate(request.createdAt)}
        </p>
        {request.deadline && (
          <p className="text-xs font-medium text-tertiary">
            Prazo: {formatDate(request.deadline)}
          </p>
        )}
      </div>
    </Link>
  );
}
