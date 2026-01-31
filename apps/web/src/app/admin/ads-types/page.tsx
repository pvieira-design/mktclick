"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdsTypesPage() {
  const { data: adTypes, isLoading } = useQuery(
    trpc.adProject.listTypes.queryOptions()
  );

  const columns = [
    { id: "name", label: "Nome" },
    { id: "slug", label: "Slug" },
    { id: "color", label: "Cor" },
    { id: "status", label: "Status" },
    { id: "projects", label: "Projetos" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Ads Types</h1>
        <p className="text-tertiary">
          Tipos de anuncio configurados no sistema.
        </p>
      </div>

      <TableCard.Root size="sm">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !adTypes || adTypes.length === 0 ? (
          <div className="p-8 text-center text-tertiary">
            Nenhum tipo de anuncio configurado.
          </div>
        ) : (
          <Table size="sm" aria-label="Tipos de Anuncio">
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
            <Table.Body items={adTypes}>
              {(item) => (
                <Table.Row key={item.id} id={item.id}>
                  <Table.Cell className="font-medium text-primary">
                    {item.name}
                  </Table.Cell>
                  <Table.Cell className="text-tertiary">
                    {item.slug}
                  </Table.Cell>
                  <Table.Cell>
                    <div
                      className="size-6 rounded-md ring-1 ring-secondary shadow-xs"
                      style={{ backgroundColor: item.color || "#cccccc" }}
                      title={item.color || "No color"}
                    />
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
                  <Table.Cell className="text-tertiary">
                    {item._count.projects} {item._count.projects === 1 ? "projeto" : "projetos"}
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
