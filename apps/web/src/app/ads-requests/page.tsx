"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { AdProjectCard, AdProjectCardSkeleton } from "@/components/ads/ad-project-card";
import { AdProjectFilters } from "@/components/ads/ad-project-filters";
import { trpc } from "@/utils/trpc";
import { Plus } from "@untitledui/icons";

interface AdProjectListResponse {
  items: Array<{
    id: string;
    title: string;
    status: string;
    currentPhase: number;
    priority: string | null;
    deadline: Date | null;
    createdAt: Date;
    adType: { name: string; color: string | null };
    origin: { name: string };
    createdBy: { name: string | null; image: string | null };
    _count: { videos: number };
  }>;
  total: number;
  hasMore: boolean;
}

export default function AdsRequestsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ status?: string; search?: string }>({});
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery<AdProjectListResponse>(
    (trpc.adProject.list.queryOptions as any)({
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Ads Requests</h1>
          <p className="text-tertiary">
            Gerencie projetos de anúncios criativos e acompanhe o progresso.
          </p>
        </div>
        <Button iconLeading={Plus} onClick={() => (router as any).push("/ads-requests/new")}>
          Novo Projeto
        </Button>
      </div>

      <AdProjectFilters filters={filters} onChange={handleFilterChange} />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AdProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-error-primary">Erro ao carregar projetos</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tertiary">Nenhum projeto encontrado</p>
          <p className="text-sm text-quaternary mt-1">
            Crie seu primeiro projeto clicando no botão acima
          </p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((project) => (
            <AdProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-tertiary">
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, data.total)} de{" "}
            {data.total} projetos
          </p>
          <div className="flex gap-2">
            <Button
              color="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              color="secondary"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              isDisabled={!data.hasMore}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
