"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Plus, Edit01, Power01, SearchMd } from "@untitledui/icons";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

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
  const limit = 20;

  const { data, isLoading, isError } = useQuery(
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criadores</h1>
          <p className="text-muted-foreground">
            Gerencie criadores de conteúdo, embaixadores e talentos.
          </p>
        </div>
        {isAdmin && (
          <Link href={"/criadores/new" as any}>
            <Button iconLeading={Plus}>
              Novo Criador
            </Button>
          </Link>
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
          selectedKey={typeFilter} 
          onSelectionChange={(key) => {
            if (key) {
              setTypeFilter(key as string);
              setPage(1);
            }
          }}
          placeholder="Filtrar por tipo"
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

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Responsável</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contato</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contrato</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                {isAdmin && (
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[100px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[80px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[60px]" /></td>
                    {isAdmin && <td className="p-4 text-right"><Skeleton className="ml-auto h-8 w-[80px]" /></td>}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-4 text-center text-red-500">
                    Erro ao carregar criadores.
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((creator: Creator) => {
                  const contractStatus = getContractStatus(creator.contractStartDate, creator.contractEndDate);
                  return (
                    <tr key={creator.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {creator.imageUrl ? (
                            <img 
                              src={creator.imageUrl} 
                              alt={creator.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {creator.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">{creator.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge color={typeColors[creator.type]} type="pill-color" size="sm">
                          {typeLabels[creator.type]}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {creator.responsible?.name || "-"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {creator.instagram ? (
                          <span>@{creator.instagram.replace("@", "")}</span>
                        ) : creator.email ? (
                          <span>{creator.email}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4">
                        <Badge color={contractStatus.color} type="pill-color" size="sm">
                          {contractStatus.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge color={creator.isActive ? "success" : "gray"} type="pill-color" size="sm">
                          {creator.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              color="tertiary" 
                              size="sm"
                              iconLeading={Power01}
                              onClick={() => handleToggleActive(creator.id)}
                              isDisabled={toggleActiveMutation.isPending}
                              title={creator.isActive ? "Desativar" : "Ativar"}
                              className={creator.isActive ? "text-green-600" : "text-muted-foreground"}
                            />
                            <Link href={`/criadores/${creator.id}/edit` as any}>
                              <Button color="tertiary" size="sm" iconLeading={Edit01} />
                            </Link>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-4 text-center text-muted-foreground">
                    Nenhum criador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
