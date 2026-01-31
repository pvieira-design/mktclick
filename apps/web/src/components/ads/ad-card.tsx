import { Image01, VideoRecorder } from "@untitledui/icons";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("pt-BR");
}

export interface AdCardData {
  adId: string;
  adName: string;
  campaignName: string;
  adsetName: string;
  accountId: string;
  spend: number;
  impressions: number;
  linkClicks: number;
  registrations: number;
  deals: number;
  consultingPayments: number;
  productPayments: number;
  consultingRevenue: number;
  productRevenue: number;
  revenue: number;
  firstDate: string;
  lastDate: string;
  roas: number;
  cpl: number;
  media: {
    url: string;
    thumbnailUrl: string | null;
    mimeType: string;
    fileName: string;
  } | null;
}

interface AdCardProps {
  ad: AdCardData;
  onClick?: () => void;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-tertiary">{label}</span>
      <span className="text-sm font-medium text-primary">{value}</span>
    </div>
  );
}

export function AdCard({ ad, onClick }: AdCardProps) {
  const isImage = ad.media?.mimeType.startsWith("image/");
  const isVideo = ad.media?.mimeType.startsWith("video/");

  return (
    <div
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary transition-all hover:shadow-md hover:ring-border-primary cursor-pointer"
    >
      <div className="relative aspect-video bg-secondary flex items-center justify-center overflow-hidden">
        {ad.media && isImage ? (
          <img
            src={ad.media.url}
            alt={ad.adName}
            className="h-full w-full object-cover"
          />
        ) : ad.media && isVideo ? (
          ad.media.thumbnailUrl ? (
            <img
              src={ad.media.thumbnailUrl}
              alt={ad.adName}
              className="h-full w-full object-cover"
            />
          ) : (
            <VideoRecorder className="h-10 w-10 text-quaternary" />
          )
        ) : (
          <Image01 className="h-10 w-10 text-quaternary" />
        )}
      </div>

      <div className="px-4 pt-3 pb-2">
        <p className="text-sm font-medium text-primary truncate" title={ad.adName}>
          {ad.adName}
        </p>
        <p className="text-xs text-tertiary truncate" title={ad.campaignName}>
          {ad.campaignName}
        </p>
      </div>

      <div className="border-t border-secondary px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Metric label="Investimento" value={formatCurrency(ad.spend)} />
          <Metric label="Receita" value={formatCurrency(ad.revenue)} />
          <Metric label="ROAS" value={ad.roas.toFixed(2)} />
          <Metric label="CPL" value={formatCurrency(ad.cpl)} />
          <Metric label="Registros" value={ad.registrations.toLocaleString("pt-BR")} />
          <Metric label="Deals" value={ad.deals.toLocaleString("pt-BR")} />
          <Metric label="Consultas" value={ad.consultingPayments.toLocaleString("pt-BR")} />
          <Metric label="Orçamentos" value={ad.productPayments.toLocaleString("pt-BR")} />
          <Metric label="Impressões" value={formatCompact(ad.impressions)} />
          <Metric label="Cliques" value={formatCompact(ad.linkClicks)} />
        </div>
      </div>
    </div>
  );
}

export function AdCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
      <Skeleton className="aspect-video w-full" />

      <div className="px-4 pt-3 pb-2 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>

      <div className="border-t border-secondary px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
