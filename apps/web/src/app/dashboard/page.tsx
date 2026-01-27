"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { RequestCard } from "@/components/request-card";
import { RequestFilters } from "@/components/request-filters";
import { trpc } from "@/utils/trpc";

export default function DashboardPage() {
  const [filters, setFilters] = useState<ComponentProps<typeof RequestFilters>['filters']>({});
  const [page, setPage] = useState(1);
  const limit = 20;

  // Cast to any to bypass potential type inference issues with tRPC in this environment
  const { data, isLoading, error } = (trpc.request.list.useQuery as any)({
    ...filters,
    page,
    limit,
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Requests</h1>
        <Link href={"/requests/new" as any} className={buttonVariants()}>
          Novo Request
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
          {data.items.map((request: any) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
      
      {data && data.total > limit && (
        <div className="flex justify-center gap-4 items-center">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.ceil(data.total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={!data.hasMore}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
