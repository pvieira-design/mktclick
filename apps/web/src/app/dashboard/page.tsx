"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/base/buttons/button";
import { RequestCard, RequestCardSkeleton } from "@/components/request-card";
import { RequestFilters } from "@/components/request-filters";
import { NewRequestDrawer } from "@/components/request/new-request-drawer";
import { trpc } from "@/utils/trpc";
import { Plus } from "@untitledui/icons";

interface RequestListResponse {
  items: Array<{
    id: string;
    title: string;
    contentType: string;
    status: string;
    origin: string;
    priority: string;
    deadline: Date | null;
    createdAt: Date;
    createdBy: { name: string | null };
  }>;
  total: number;
  hasMore: boolean;
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<ComponentProps<typeof RequestFilters>['filters']>({});
  const [page, setPage] = useState(1);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const limit = 20;

  const { data, isLoading, error } = useQuery<RequestListResponse>(
    (trpc.request.list.queryOptions as any)({
      ...filters,
      page,
      limit,
    })
  );

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Requests</h1>
          <p className="text-tertiary">
            Gerencie solicitações de conteúdo e acompanhe o progresso.
          </p>
        </div>
        <Button iconLeading={Plus} onClick={() => setIsNewDrawerOpen(true)}>
          Novo Request
        </Button>
      </div>
      
      <RequestFilters filters={filters} onChange={handleFilterChange} />
      
      {isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      )}
      
      {error && <div>Erro ao carregar requests</div>}
      
      {data && data.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tertiary">Nenhum request encontrado</p>
          <p className="text-sm text-quaternary">
            Crie seu primeiro request clicando no botao acima
          </p>
        </div>
      )}
      
      {data && data.items.length > 0 && (
        <div className="grid gap-4">
          {data.items.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
      
      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-tertiary">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} requests
          </p>
          <div className="flex gap-2">
            <Button
              color="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              color="secondary"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              isDisabled={!data.hasMore}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      <NewRequestDrawer
        open={isNewDrawerOpen}
        onOpenChange={setIsNewDrawerOpen}
      />
    </div>
  );
}
