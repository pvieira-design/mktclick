"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit01, Power01 } from "@untitledui/icons";

interface Origin {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

export default function OriginsListPage() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery(
    trpc.origin.list.queryOptions()
  );

  const toggleActiveMutation = useMutation({
    ...(trpc.origin.toggleActive.mutationOptions as any)(),
    onSuccess: () => {
       toast.success("Status da origem atualizado");
       queryClient.invalidateQueries({ queryKey: [["origin", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleToggleActive = (id: string) => {
    (toggleActiveMutation.mutate as any)({ id });
  };

   const columns = [
     { id: "name", label: "Nome" },
     { id: "slug", label: "Slug" },
     { id: "description", label: "Descrição" },
     { id: "status", label: "Status" },
     { id: "actions", label: "Ações" },
   ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold tracking-tight text-primary">Origens</h1>
           <p className="text-tertiary">
             Gerencie as origens de produção do sistema.
           </p>
         </div>
         <Link href={"/admin/origins/new" as any}>
           <Button iconLeading={Plus}>Nova Origem</Button>
         </Link>
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
             Nenhuma origem encontrada. Crie uma para começar.
           </div>
        ) : (
           <Table size="sm" aria-label="Origens">
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
              {(origin: Origin) => (
                <Table.Row key={origin.id} id={origin.id}>
                  <Table.Cell className="font-medium text-primary">
                    {origin.name}
                  </Table.Cell>
                  <Table.Cell>
                    {origin.slug}
                  </Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {origin.description || "-"}
                  </Table.Cell>
                   <Table.Cell>
                     <Badge color={origin.isActive ? "success" : "gray"} type="pill-color" size="sm">
                       {origin.isActive ? "Ativo" : "Inativo"}
                     </Badge>
                   </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button 
                        color="tertiary"
                        size="sm"
                        iconLeading={Power01}
                        onClick={() => handleToggleActive(origin.id)}
                        isDisabled={toggleActiveMutation.isPending}
                        className={origin.isActive ? "text-fg-success-primary" : ""}
                      />
                      <Link href={`/admin/origins/${origin.id}/edit` as any}>
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
    </div>
  );
}
