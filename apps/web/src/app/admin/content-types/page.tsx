"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Edit, Plus, Power, Search } from "lucide-react";
import { toast } from "sonner";

export default function ContentTypesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Conteúdo</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos de conteúdo disponíveis no sistema.
          </p>
        </div>
        <Link href="/admin/content-types/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo de Conteúdo
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={(value) => {
            if (value) {
              setStatusFilter(value as "all" | "active" | "inactive");
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cor</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ícone</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-6 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[60px]" /></td>
                    <td className="p-4 text-right"><Skeleton className="ml-auto h-8 w-[80px]" /></td>
                  </tr>
                ))
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 text-muted-foreground">{item.slug}</td>
                    <td className="p-4">
                      <div 
                        className="h-6 w-6 rounded border shadow-sm" 
                        style={{ backgroundColor: item.color || '#cccccc' }} 
                        title={item.color || 'No color'}
                      />
                    </td>
                    <td className="p-4 text-muted-foreground">{item.icon || '-'}</td>
                    <td className="p-4">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleActive(item.id)}
                          disabled={toggleActiveMutation.isPending}
                          title={item.isActive ? "Desativar" : "Ativar"}
                        >
                          <Power className={`h-4 w-4 ${item.isActive ? "text-green-600" : "text-muted-foreground"}`} />
                        </Button>
                        <Link 
                          href={`/admin/content-types/${item.id}/edit`}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    Nenhum tipo de conteúdo encontrado.
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
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} tipos
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={!data.hasMore}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
