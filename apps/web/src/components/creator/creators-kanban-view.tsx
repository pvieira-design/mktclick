"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface Creator {
  id: string;
  name: string;
  imageUrl: string | null;
  type: "UGC_CREATOR" | "EMBAIXADOR" | "ATLETA" | "INFLUENCIADOR" | "ATOR_MODELO";
  email: string | null;
  phone: string | null;
  instagram: string | null;
  isActive: boolean;
  responsible: {
    id: string;
    name: string;
  };
}

const typeLabels: Record<string, string> = {
  UGC_CREATOR: "UGC",
  EMBAIXADOR: "Embaixador",
  ATLETA: "Atleta",
  INFLUENCIADOR: "Influenciador",
  ATOR_MODELO: "Ator/Modelo",
};

const typeColors: Record<string, "brand" | "gray" | "error" | "warning" | "success"> = {
  UGC_CREATOR: "brand",
  EMBAIXADOR: "success",
  ATLETA: "warning",
  INFLUENCIADOR: "gray",
  ATOR_MODELO: "error",
};

const KANBAN_COLUMNS = [
  { id: "sem_telefone", label: "Sem telefone" },
  { id: "entrada", label: "Entrada" },
  { id: "primeira_consulta", label: "Primeira consulta" },
  { id: "pagamento_orcamento", label: "Pagamento orçamento" },
  { id: "envio_anvisa", label: "Envio Anvisa" },
  { id: "envio_documentos", label: "Envio documentos" },
  { id: "envio_rastreio", label: "Envio rastreio" },
  { id: "produto_entregue", label: "Produto entregue" },
] as const;

interface CreatorsKanbanViewProps {
  onEditCreator: (id: string) => void;
}

function normalizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  if (!clean.startsWith("55")) clean = "55" + clean;
  return clean;
}

export function CreatorsKanbanView({ onEditCreator }: CreatorsKanbanViewProps) {
  // Fetch all active creators (high limit to get all)
  const { data: creatorsData, isLoading: loadingCreators } = useQuery(
    trpc.creator.list.queryOptions({ limit: 200, isActive: true })
  );

  const creators = creatorsData?.items ?? [];

  // Get phones for batch lookup
  const phonesToQuery = useMemo(
    () => creators.filter((c) => c.phone).map((c) => c.phone!),
    [creators]
  );

  const { data: stageMap, isLoading: loadingStages } = useQuery({
    ...trpc.creator.getBatchLeadStages.queryOptions({ phones: phonesToQuery }),
    enabled: phonesToQuery.length > 0,
  });

  // Group creators by column
  const columns = useMemo(() => {
    const grouped: Record<string, Creator[]> = {};
    for (const col of KANBAN_COLUMNS) {
      grouped[col.id] = [];
    }

    for (const creator of creators) {
      if (!creator.phone) {
        grouped["sem_telefone"]!.push(creator);
        continue;
      }

      const normalized = normalizePhone(creator.phone);
      const stage = stageMap?.[normalized] ?? "entrada";
      if (grouped[stage]) {
        grouped[stage]!.push(creator);
      } else {
        grouped["entrada"]!.push(creator);
      }
    }

    return grouped;
  }, [creators, stageMap]);

  const isLoading = loadingCreators || (phonesToQuery.length > 0 && loadingStages);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-64">
            <Skeleton className="h-8 w-full mb-3 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
      {KANBAN_COLUMNS.map((col) => {
        const items = columns[col.id] ?? [];
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-60 flex flex-col"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-secondary">
              <span className="text-xs font-semibold text-secondary truncate">
                {col.label}
              </span>
              <span className="text-xs text-quaternary font-medium ml-2">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 min-h-32">
              {items.map((creator) => (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => onEditCreator(creator.id)}
                  className="w-full text-left rounded-lg border border-secondary bg-primary p-3 hover:ring-2 hover:ring-brand-solid/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={creator.imageUrl || undefined}
                      initials={creator.name.charAt(0).toUpperCase()}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {creator.name}
                      </p>
                      <p className="text-xs text-tertiary truncate">
                        {creator.instagram
                          ? `@${creator.instagram.replace("@", "")}`
                          : creator.phone || creator.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge
                      color={typeColors[creator.type]}
                      type="pill-color"
                      size="sm"
                    >
                      {typeLabels[creator.type]}
                    </Badge>
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-secondary">
                  <span className="text-xs text-quaternary">Nenhum criador</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
