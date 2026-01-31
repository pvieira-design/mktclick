"use client";

import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "@untitledui/icons";
import NextLink from "next/link";

const Link = NextLink as React.ComponentType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean }
>;
import { cx } from "@/lib/utils/cx";

const tabs = [
  { id: "edit", label: "Visão Geral", segment: "edit" },
  { id: "fields", label: "Campos Personalizados", segment: "fields" },
  { id: "workflow", label: "Workflow", segment: "workflow" },
  { id: "settings", label: "Configurações", segment: "settings" },
] as const;

export default function ContentTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;

  const { data: contentType, isLoading } = useQuery(
    trpc.contentType.getById.queryOptions({ id })
  );

  const activeTab = tabs.find((tab) => pathname.endsWith(`/${tab.segment}`))?.id ?? "edit";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/content-types">
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                {contentType?.name}
              </h1>
               <p className="text-tertiary">
                 Gerencie a configuração do tipo de conteúdo.
               </p>
            </>
          )}
        </div>
      </div>

      <nav className="flex gap-3 border-b border-border-secondary">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/content-types/${id}/${tab.segment}`}
              className={cx(
                "-mb-px border-b-2 px-1 pb-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-fg-brand-primary_alt text-brand-secondary"
                  : "border-transparent text-quaternary hover:border-fg-brand-primary_alt hover:text-brand-secondary"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
