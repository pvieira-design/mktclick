"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { NewCreatorDrawer } from "@/components/creator/new-creator-drawer";
import { Plus, Edit01, Power01, SearchMd, FilterLines } from "@untitledui/icons";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/base/avatar/avatar";

interface Creator {
  id: string;
  name: string;
  imageUrl: string | null;
  type: "UGC_CREATOR" | "EMBAIXADOR" | "ATLETA" | "INFLUENCIADOR" | "ATOR_MODELO";
  email: string | null;
  phone: string | null;
  instagram: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  isActive: boolean;
  responsible: {
    id: string;
    name: string;
  };
}

const typeLabels: Record<string, string> = {
  UGC_CREATOR: "UGC Creator",
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

function getContractStatus(startDate: string | null, endDate: string | null): { label: string; color: "success" | "gray" | "error" } {
  const now = new Date();
  
  if (!startDate && !endDate) {
    return { label: "Sem contrato", color: "gray" };
  }
  
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && now < start) {
    return { label: "Futuro", color: "gray" };
  }
  
  if (end && now > end) {
    return { label: "Expirado", color: "error" };
  }
  
  return { label: "Ativo", color: "success" };
}

export default function CriadoresPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const limit = 20;

  const { data, isLoading } = useQuery(
    trpc.creator.list.queryOptions({
      search: search || undefined,
      type: typeFilter !== "all" ? typeFilter as any : undefined,
      page,
      limit,
    })
  );

  const toggleActiveMutation = useMutation({
    ...(trpc.creator.toggleActive.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Status atualizado");
      queryClient.invalidateQueries({ queryKey: [["creator", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleToggleActive = (id: string) => {
    (toggleActiveMutation.mutate as any)({ id });
  };

  const columns = [
    { id: "name", label: "Nome" },
    { id: "type", label: "Tipo" },
    { id: "responsible", label: "Responsável" },
    { id: "contact", label: "Contato" },
    { id: "contract", label: "Contrato" },
    { id: "status", label: "Status" },
    ...(isAdmin ? [{ id: "actions", label: "Ações" }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Criadores</h1>
          <p className="text-tertiary">
            Gerencie criadores de conteúdo, embaixadores e talentos.
          </p>
        </div>
        {isAdmin && (
          <Button iconLeading={Plus} onClick={() => setIsNewDrawerOpen(true)}>
            Novo Criador
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={SearchMd}
            placeholder="Buscar por nome..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
        <Select 
          aria-label="Filtrar por tipo"
          selectedKey={typeFilter} 
          onSelectionChange={(key) => {
            if (key) {
              setTypeFilter(key as string);
              setPage(1);
            }
          }}
          placeholder="Filtrar por tipo"
          placeholderIcon={FilterLines}
          className="w-[180px]"
        >
          <Select.Item id="all" label="Todos os Tipos" />
          <Select.Item id="UGC_CREATOR" label="UGC Creator" />
          <Select.Item id="EMBAIXADOR" label="Embaixador" />
          <Select.Item id="ATLETA" label="Atleta" />
          <Select.Item id="INFLUENCIADOR" label="Influenciador" />
          <Select.Item id="ATOR_MODELO" label="Ator/Modelo" />
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
            Nenhum criador encontrado.
          </div>
        ) : (
          <Table size="sm" aria-label="Criadores">
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
              {(creator: Creator) => {
                const contractStatus = getContractStatus(creator.contractStartDate, creator.contractEndDate);
                return (
                  <Table.Row key={creator.id} id={creator.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={creator.imageUrl || undefined}
                          initials={creator.name.charAt(0).toUpperCase()}
                          size="sm"
                        />
                        <span className="font-medium text-primary">{creator.name}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={typeColors[creator.type]} type="pill-color" size="sm">
                        {typeLabels[creator.type]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {creator.responsible?.name || "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {creator.instagram ? (
                        <span>@{creator.instagram.replace("@", "")}</span>
                      ) : creator.email ? (
                        <span>{creator.email}</span>
                      ) : (
                        "-"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={contractStatus.color} type="pill-color" size="sm">
                        {contractStatus.label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={creator.isActive ? "success" : "gray"} type="pill-color" size="sm">
                        {creator.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </Table.Cell>
                    {isAdmin && (
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button 
                            color="tertiary"
                            size="sm"
                            iconLeading={Power01}
                            onClick={() => handleToggleActive(creator.id)}
                            isDisabled={toggleActiveMutation.isPending}
                            className={creator.isActive ? "text-fg-success-primary" : ""}
                          />
                          <Link href={`/criadores/${creator.id}/edit` as any}>
                            <Button 
                              color="tertiary"
                              size="sm"
                              iconLeading={Edit01}
                            />
                          </Link>
                        </div>
                      </Table.Cell>
                    )}
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-tertiary">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} criadores
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

      <NewCreatorDrawer
        open={isNewDrawerOpen}
        onOpenChange={setIsNewDrawerOpen}
      />
    </div>
  );
}
