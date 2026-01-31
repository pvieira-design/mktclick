"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { AdCard, AdCardSkeleton } from "@/components/ads/ad-card";
import { AdFilters, type AdsFilters } from "@/components/ads/ad-filters";
import { AdDetailModal } from "@/components/ads/ad-detail-modal";
import { MediaLinkDialog } from "@/components/ads/media-link-dialog";
import { Button } from "@/components/base/buttons/button";

const today = new Date().toISOString().split("T")[0]!;
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;

interface SelectedAd {
  adId: string;
  campaignName: string;
  adsetName: string;
}

interface MediaLinkTarget {
  adId: string;
  adName: string;
}

export default function AdsPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AdsFilters & { page: number; pageSize: number }>({
    dateFrom: sevenDaysAgo,
    dateTo: today,
    accountId: undefined,
    campaignName: undefined,
    adsetName: undefined,
    adNameSearch: undefined,
    page: 1,
    pageSize: 24,
  });

  const [selectedAd, setSelectedAd] = useState<SelectedAd | null>(null);
  const [mediaLinkTarget, setMediaLinkTarget] = useState<MediaLinkTarget | null>(null);

  const { data, isLoading, isError, refetch } = useQuery(
    trpc.ads.list.queryOptions({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      accountId: filters.accountId,
      campaignName: filters.campaignName,
      adsetName: filters.adsetName,
      adNameSearch: filters.adNameSearch,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  );

  const { data: filterOptions, isLoading: isLoadingOptions } = useQuery(
    trpc.ads.filterOptions.queryOptions({
      accountId: filters.accountId,
      campaignName: filters.campaignName,
    })
  );

  const handleFiltersChange = useCallback((update: Partial<AdsFilters>) => {
    setFilters((prev) => ({ ...prev, ...update, page: 1 }));
  }, []);

  const handleCardClick = useCallback((item: { adId: string; campaignName: string; adsetName: string }) => {
    setSelectedAd({
      adId: item.adId,
      campaignName: item.campaignName,
      adsetName: item.adsetName,
    });
  }, []);

  const handleLinkMedia = useCallback((adId: string, adName: string) => {
    setMediaLinkTarget({ adId, adName });
  }, []);

  const handleMediaLinked = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [["ads"]] });
    setMediaLinkTarget(null);
  }, [queryClient]);

  const unlinkMutation = useMutation({
    mutationFn: async (adId: string) => {
      const opts = trpc.ads.unlinkMedia.mutationOptions();
      const mutFn = opts.mutationFn as (vars: { adId: string }) => Promise<{ success: boolean }>;
      return mutFn({ adId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["ads"]] });
      toast.success("Mídia desvinculada do anúncio");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao desvincular mídia: ${error.message}`);
    },
  });

  const handleUnlinkMedia = useCallback((adId: string) => {
    unlinkMutation.mutate(adId);
  }, [unlinkMutation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Anúncios
        </h1>
        <p className="text-tertiary">
          Visualize e gerencie os anúncios do Facebook Ads.
        </p>
      </div>

      <AdFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
        isLoadingOptions={isLoadingOptions}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <AdCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 border border-dashed border-secondary rounded-lg">
          <p className="text-tertiary">
            Não foi possível carregar os anúncios
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-brand-primary hover:underline cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-secondary rounded-lg">
          <p className="text-tertiary">
            Nenhum anúncio encontrado para o período e filtros selecionados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.items.map((item) => (
            <AdCard
              key={`${item.adId}-${item.campaignName}-${item.adsetName}`}
              ad={item}
              onClick={() => handleCardClick(item)}
            />
          ))}
        </div>
      )}

      {data && data.total > filters.pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-tertiary">
            Mostrando{" "}
            {(filters.page - 1) * filters.pageSize + 1} a{" "}
            {Math.min(filters.page * filters.pageSize, data.total)} de{" "}
            {data.total} anúncios
          </p>
          <div className="flex gap-2">
            <Button
              color="secondary"
              size="sm"
              onClick={() =>
                setFilters((f) => ({ ...f, page: f.page - 1 }))
              }
              isDisabled={filters.page === 1}
            >
              Anterior
            </Button>
            <Button
              color="secondary"
              size="sm"
              onClick={() =>
                setFilters((f) => ({ ...f, page: f.page + 1 }))
              }
              isDisabled={!data.hasMore}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      <AdDetailModal
        adId={selectedAd?.adId ?? null}
        campaignName={selectedAd?.campaignName ?? ""}
        adsetName={selectedAd?.adsetName ?? ""}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        open={!!selectedAd}
        onClose={() => setSelectedAd(null)}
        onLinkMedia={handleLinkMedia}
        onUnlinkMedia={handleUnlinkMedia}
      />

      {mediaLinkTarget && (
        <MediaLinkDialog
          adId={mediaLinkTarget.adId}
          adName={mediaLinkTarget.adName}
          open={!!mediaLinkTarget}
          onClose={() => setMediaLinkTarget(null)}
          onLinked={handleMediaLinked}
        />
      )}
    </div>
  );
}
