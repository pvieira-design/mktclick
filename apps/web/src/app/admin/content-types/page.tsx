"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { NewContentTypeDrawer } from "@/components/content-type/new-content-type-drawer";
import Link from "next/link";
import { Edit01, FilterLines, Power01, Plus, SearchMd } from "@untitledui/icons";
import { toast } from "sonner";

export default function ContentTypesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const limit = 20;
  
  const { data, isLoading } = useQuery(
    trpc.contentType.list.queryOptions({
      search: search || undefined,
      isActive: statusFilter,
      page,
      limit,
    })
  );
  
  const toggleActiveMutation = useMutation({
    ...(trpc.contentType.toggleActive.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Status atualizado");
      queryClient.invalidateQueries({ queryKey: [["contentType"]] });
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const handleToggleActive = (id: string) => {
    (toggleActiveMutation.mutate as any)({ id });
  };

  const columns = [
    { id: "name", label: "Nome" },
    { id: "slug", label: "Slug" },
    { id: "color", label: "Cor" },
    { id: "icon", label: "Ícone" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Ações" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Tipos de Conteúdo</h1>
          <p className="text-tertiary">
            Gerencie os tipos de conteúdo disponíveis no sistema.
          </p>
        </div>
        <Button iconLeading={Plus} onClick={() => setIsNewDrawerOpen(true)}>
          Novo Tipo de Conteúdo
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={SearchMd}
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
        <Select 
          selectedKey={statusFilter}
          onSelectionChange={(key) => {
            if (key) {
              setStatusFilter(key as "all" | "active" | "inactive");
              setPage(1);
            }
          }}
          placeholder="Filtrar por status"
          placeholderIcon={FilterLines}
          className="w-[180px]"
        >
          <Select.Item id="all" label="Todos" />
          <Select.Item id="active" label="Ativos" />
          <Select.Item id="inactive" label="Inativos" />
        </Select>
      </div>

      <TableCard.Root size="sm">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <div className="p-8 text-center text-tertiary">
            Nenhum tipo de conteúdo encontrado.
          </div>
        ) : (
          <Table size="sm" aria-label="Tipos de Conteúdo">
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Head 
                  key={column.id} 
                  id={column.id} 
                  label={column.label}
                  isRowHeader={column.id === "name"}
                />
              )}
            </Table.Header>
            <Table.Body items={data?.items ?? []}>
              {(item) => (
                <Table.Row key={item.id} id={item.id}>
                  <Table.Cell className="font-medium text-primary">
                    {item.name}
                  </Table.Cell>
                  <Table.Cell>
                    {item.slug}
                  </Table.Cell>
                  <Table.Cell>
                    <div 
                      className="size-6 rounded-md ring-1 ring-secondary shadow-xs" 
                      style={{ backgroundColor: item.color || '#cccccc' }} 
                      title={item.color || 'No color'}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {item.icon || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={item.isActive ? "success" : "gray"} 
                      size="sm"
                      type="pill-color"
                    >
                      {item.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button 
                        color="tertiary"
                        size="sm"
                        iconLeading={Power01}
                        onClick={() => handleToggleActive(item.id)}
                        isDisabled={toggleActiveMutation.isPending}
                        className={item.isActive ? "text-fg-success-primary" : ""}
                      />
                      <Link href={`/admin/content-types/${item.id}/edit`}>
                        <Button 
                          color="tertiary"
                          size="sm"
                          iconLeading={Edit01}
                        />
                      </Link>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-tertiary">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} tipos
          </p>
          <div className="flex gap-2">
            <Button 
              color="secondary" 
              size="sm" 
              onClick={() => setPage(p => p - 1)}
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

      <NewContentTypeDrawer 
        open={isNewDrawerOpen} 
        onOpenChange={setIsNewDrawerOpen} 
      />
    </div>
  );
}
