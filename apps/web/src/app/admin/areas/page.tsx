"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NewAreaDrawer } from "@/components/area/new-area-drawer";
import { toast } from "sonner";
import { Plus, Edit01, Power01, Users01 } from "@untitledui/icons";

interface Area {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count: {
    members: number;
  };
}

export default function AreasListPage() {
  const queryClient = useQueryClient();
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  
  const { data, isLoading } = useQuery(
    trpc.area.list.queryOptions()
  );

  const toggleActiveMutation = useMutation({
    ...(trpc.area.toggleActive.mutationOptions as any)(),
    onSuccess: () => {
       toast.success("Status da área atualizado");
      queryClient.invalidateQueries({ queryKey: [["area", "list"]] });
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
     { id: "members", label: "Membros" },
     { id: "status", label: "Status" },
     { id: "actions", label: "Ações" },
   ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-primary">Áreas</h1>
           <p className="text-tertiary">
             Gerencie áreas de trabalho e equipes do sistema.
           </p>
        </div>
        <Button iconLeading={Plus} onClick={() => setIsNewDrawerOpen(true)}>
          Nova Área
        </Button>
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
             Nenhuma área encontrada. Crie uma para começar.
           </div>
        ) : (
           <Table size="sm" aria-label="Áreas">
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
              {(area: Area) => (
                <Table.Row key={area.id} id={area.id}>
                  <Table.Cell className="font-medium text-primary">
                    {area.name}
                  </Table.Cell>
                  <Table.Cell>
                    {area.slug}
                  </Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {area.description || "-"}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="gray" type="pill-color" size="sm">
                      {area._count.members}
                    </Badge>
                  </Table.Cell>
                   <Table.Cell>
                     <Badge color={area.isActive ? "success" : "gray"} type="pill-color" size="sm">
                       {area.isActive ? "Ativo" : "Inativo"}
                     </Badge>
                   </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/areas/${area.id}/members` as any}>
                        <Button 
                          color="tertiary"
                          size="sm"
                          iconLeading={Users01}
                        />
                      </Link>
                      <Button 
                        color="tertiary"
                        size="sm"
                        iconLeading={Power01}
                        onClick={() => handleToggleActive(area.id)}
                        isDisabled={toggleActiveMutation.isPending}
                        className={area.isActive ? "text-fg-success-primary" : ""}
                      />
                      <Link href={`/admin/areas/${area.id}/edit` as any}>
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

      <NewAreaDrawer
        open={isNewDrawerOpen}
        onOpenChange={setIsNewDrawerOpen}
      />
    </div>
  );
}
