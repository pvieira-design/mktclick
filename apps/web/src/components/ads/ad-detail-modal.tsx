"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Image01, VideoRecorder, XClose, LinkExternal02, Trash01, Users01, CurrencyDollarCircle, FileCheck02, Receipt } from "@untitledui/icons";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import type { FC } from "react";

const ACCOUNT_LABELS: Record<string, string> = {
  "1": "Conta Principal",
  "2": "Impulsionamento",
  "3": "BM Anunciante",
};

function fmtBRL(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `R$ ${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function fmtNum(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("pt-BR");
}

interface AdDetailModalProps {
  adId: string | null;
  campaignName: string;
  adsetName: string;
  dateFrom: string;
  dateTo: string;
  open: boolean;
  onClose: () => void;
  onLinkMedia?: (adId: string, adName: string) => void;
  onUnlinkMedia?: (adId: string) => void;
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "red" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-secondary/40 px-3 py-2.5">
      <span className="text-[11px] font-medium text-tertiary leading-tight">{label}</span>
      <span
        className={`text-sm font-semibold leading-tight ${
          highlight === "green"
            ? "text-success-primary"
            : highlight === "red"
              ? "text-error-primary"
              : "text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CostCard({
  icon,
  label,
  costValue,
  countLabel,
  countValue,
}: {
  icon: FC<{ className?: string }>;
  label: string;
  costValue: string;
  countLabel: string;
  countValue: string;
}) {
  return (
    <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
      <div className="flex flex-col gap-3 px-4 py-4">
        <FeaturedIcon color="gray" theme="modern" icon={icon} size="md" />
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-medium text-tertiary">{label}</h3>
          <p className="text-lg font-semibold text-primary">{costValue}</p>
        </div>
        <span className="text-xs text-quaternary">
          {countValue} {countLabel}
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-quaternary pt-1">
      {children}
    </h3>
  );
}

export function AdDetailModal({
  adId,
  campaignName,
  adsetName,
  dateFrom,
  dateTo,
  open,
  onClose,
  onLinkMedia,
  onUnlinkMedia,
}: AdDetailModalProps) {
  const { data, isLoading } = useQuery({
    ...trpc.ads.getById.queryOptions({
      adId: adId ?? "",
      campaignName,
      adsetName,
      dateFrom,
      dateTo,
    }),
    enabled: open && !!adId,
  });

  const hasMedia = !!data?.media;
  const isImage = data?.media?.file.mimeType.startsWith("image/");

  return (
    <ModalOverlay isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()} isDismissable>
      <Modal className="max-w-2xl">
        <Dialog className="flex-col items-stretch">
          <div className="w-full rounded-2xl bg-primary shadow-xl ring-1 ring-secondary ring-inset">
            <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-1">
              <div className="min-w-0 flex-1">
                {isLoading ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-72 rounded" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-sm font-semibold text-primary truncate">
                      {data?.adName ?? "Anúncio"}
                    </h2>
                    {data && (
                      <p className="text-xs text-tertiary truncate">
                        {data.campaignName} &middot; {data.adsetName}
                      </p>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 text-quaternary hover:bg-secondary hover:text-primary cursor-pointer transition-colors"
              >
                <XClose className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-5 pt-2" style={{ maxHeight: "calc(90vh - 4rem)" }}>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : data ? (
                <div className="space-y-4">
                  {hasMedia ? (
                    <div className="relative flex items-center justify-center rounded-xl bg-secondary overflow-hidden" style={{ maxHeight: 200 }}>
                      {isImage ? (
                        <img
                          src={data.media!.file.url}
                          alt={data.adName}
                          className="max-h-[200px] w-auto object-contain"
                        />
                      ) : data.media!.file.thumbnailUrl ? (
                        <img
                          src={data.media!.file.thumbnailUrl}
                          alt={data.adName}
                          className="max-h-[200px] w-auto object-contain"
                        />
                      ) : (
                        <div className="py-8">
                          <VideoRecorder className="h-10 w-10 text-quaternary" />
                        </div>
                      )}
                      {(onLinkMedia || onUnlinkMedia) && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                          {onLinkMedia && (
                            <button
                              onClick={() => onLinkMedia(data.adId, data.adName)}
                              className="flex items-center gap-1 rounded-md bg-primary/90 px-2 py-1 text-xs font-medium text-secondary hover:text-primary cursor-pointer backdrop-blur-sm ring-1 ring-secondary transition-colors"
                            >
                              <LinkExternal02 className="size-3" />
                              Trocar
                            </button>
                          )}
                          {onUnlinkMedia && (
                            <button
                              onClick={() => onUnlinkMedia(data.adId)}
                              className="flex items-center gap-1 rounded-md bg-primary/90 px-2 py-1 text-xs font-medium text-error-primary hover:bg-error-secondary cursor-pointer backdrop-blur-sm ring-1 ring-secondary transition-colors"
                            >
                              <Trash01 className="size-3" />
                              Excluir
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : onLinkMedia ? (
                    <button
                      onClick={() => onLinkMedia(data.adId, data.adName)}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-secondary px-4 py-2.5 text-xs font-medium text-tertiary hover:bg-secondary/30 hover:text-secondary cursor-pointer w-full transition-colors"
                    >
                      <Image01 className="size-4" />
                      Vincular mídia a este anúncio
                    </button>
                  ) : null}

                  <SectionLabel>Performance</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <Stat label="Investimento" value={fmtBRL(data.spend)} />
                    <Stat label="Receita" value={fmtBRL(data.revenue)} highlight={data.revenue > 0 ? "green" : undefined} />
                    <Stat label="ROAS" value={data.roas.toFixed(2)} highlight={data.roas >= 1 ? "green" : "red"} />
                    <Stat label="CPL" value={fmtBRL(data.cpl)} />
                    <Stat label="CPC" value={fmtBRL(data.cpc)} />
                    <Stat label="CPM" value={fmtBRL(data.cpm)} />
                    <Stat label="CTR" value={`${data.ctr.toFixed(2)}%`} />
                  </div>

                  <SectionLabel>Conversões</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <CostCard
                      icon={Users01}
                      label="CPL Registro"
                      costValue={data.registrations > 0 ? fmtBRL(data.spend / data.registrations) : "—"}
                      countLabel="registros"
                      countValue={fmtNum(data.registrations)}
                    />
                    <CostCard
                      icon={CurrencyDollarCircle}
                      label="Custo Deal"
                      costValue={data.deals > 0 ? fmtBRL(data.spend / data.deals) : "—"}
                      countLabel="deals"
                      countValue={fmtNum(data.deals)}
                    />
                    <CostCard
                      icon={FileCheck02}
                      label="Custo Consulta"
                      costValue={data.consultingPayments > 0 ? fmtBRL(data.spend / data.consultingPayments) : "—"}
                      countLabel="consultas"
                      countValue={fmtNum(data.consultingPayments)}
                    />
                    <CostCard
                      icon={Receipt}
                      label="Custo Orçamento"
                      costValue={data.productPayments > 0 ? fmtBRL(data.spend / data.productPayments) : "—"}
                      countLabel="orçamentos"
                      countValue={fmtNum(data.productPayments)}
                    />
                  </div>

                  <SectionLabel>Engajamento</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <Stat label="Views Vídeo" value={fmtNum(data.videoView)} />
                    <Stat label="Engajamento" value={fmtNum(data.postEngagement)} />
                    <Stat label="Reações" value={fmtNum(data.postReaction)} />
                    <Stat label="Comentários" value={fmtNum(data.comment)} />
                    <Stat label="Curtidas" value={fmtNum(data.like)} />
                    <Stat label="Compartilhar" value={fmtNum(data.post)} />
                    <Stat label="Saves" value={fmtNum(data.onsiteConversionPostSave)} />
                  </div>

                  <SectionLabel>Informações</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <Stat label="Primeiro dia" value={data.firstDate} />
                    <Stat label="Último dia" value={data.lastDate} />
                    <Stat label="Dias ativos" value={String(data.diasAtivos)} />
                    <Stat label="Conta" value={ACCOUNT_LABELS[String(data.accountId)] ?? `Conta ${data.accountId}`} />
                    <Stat label="Impressões" value={fmtNum(data.impressions)} />
                    <Stat label="Cliques" value={fmtNum(data.linkClicks)} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
