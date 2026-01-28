"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/base/buttons/button";
import { RequestCard } from "@/components/request-card";
import { RequestFilters } from "@/components/request-filters";
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Requests</h1>
        <Link href="/requests/new">
          <Button iconLeading={Plus}>
            Novo Request
          </Button>
        </Link>
      </div>
      
      <RequestFilters filters={filters} onChange={handleFilterChange} />
      
      {isLoading && <div>Carregando...</div>}
      
      {error && <div>Erro ao carregar requests</div>}
      
      {data && data.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum request encontrado</p>
          <p className="text-sm text-muted-foreground">
            Crie seu primeiro request clicando no botão acima
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
        <div className="flex justify-center gap-4 items-center">
          <Button
            color="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            isDisabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-tertiary">
            Página {page} de {Math.ceil(data.total / limit)}
          </span>
          <Button
            color="secondary"
            onClick={() => setPage(p => p + 1)}
            isDisabled={!data.hasMore}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
