"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit01, Trash01, SearchMd } from "@untitledui/icons";
import { TagDrawer } from "@/components/tag/tag-drawer";
import type { BadgeColors } from "@/components/base/badges/badge-types";

type TagGroup = "FILE" | "REQUEST";

const TAG_GROUP_LABELS: Record<TagGroup, string> = {
  FILE: "Arquivos",
  REQUEST: "Requests",
};

interface FileTag {
  id: string;
  name: string;
  color: string;
  group: TagGroup;
  createdAt: string;
  _count: {
    files: number;
  };
}

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    color: string;
    group: TagGroup;
  } | null>(null);

  const { data, isLoading } = useQuery(trpc.fileTag.list.queryOptions());

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter((tag) => tag.name.toLowerCase().includes(term));
  }, [data?.items, search]);

  const deleteMutation = useMutation({
    ...(trpc.fileTag.delete.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tag excluída");
      queryClient.invalidateQueries({ queryKey: [["fileTag", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tag?")) {
      (deleteMutation.mutate as any)({ id });
    }
  };

  const openCreateDrawer = () => {
    setEditingTag(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (tag: FileTag) => {
    setEditingTag({ id: tag.id, name: tag.name, color: tag.color, group: tag.group });
    setIsDrawerOpen(true);
  };

  const columns = [
    { id: "name", label: "Nome" },
    { id: "group", label: "Grupo" },
    { id: "usage", label: "Uso" },
    { id: "createdAt", label: "Criada em" },
    { id: "actions", label: "Ações" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Gerenciar Tags
          </h1>
          <p className="text-tertiary">
            Crie e gerencie tags para organizar arquivos na biblioteca.
          </p>
        </div>
        <Button iconLeading={Plus} onClick={openCreateDrawer}>
          Nova Tag
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={SearchMd}
            placeholder="Buscar por nome da tag..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <TableCard.Root size="sm">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-tertiary">
            {search.trim()
              ? "Nenhuma tag encontrada para essa busca."
              : "Nenhuma tag encontrada. Crie uma para começar."}
          </div>
        ) : (
          <Table size="sm" aria-label="Tags">
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
            <Table.Body items={filteredItems}>
              {(tag: FileTag) => (
                <Table.Row key={tag.id} id={tag.id}>
                  <Table.Cell>
                    <Badge
                      color={(tag.color || "gray") as BadgeColors}
                      type="pill-color"
                      size="sm"
                    >
                      {tag.name}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-tertiary">
                    {TAG_GROUP_LABELS[tag.group] ?? tag.group}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={tag._count.files > 0 ? "brand" : "gray"}
                      type="pill-color"
                      size="sm"
                    >
                      {tag._count.files} arquivo
                      {tag._count.files !== 1 ? "s" : ""}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-tertiary">
                    {new Date(tag.createdAt).toLocaleDateString("pt-BR")}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button
                        color="tertiary"
                        size="sm"
                        iconLeading={Edit01}
                        onClick={() => openEditDrawer(tag)}
                      />
                      <Button
                        color="tertiary"
                        size="sm"
                        iconLeading={Trash01}
                        onClick={() => handleDelete(tag.id)}
                        isDisabled={
                          deleteMutation.isPending || tag._count.files > 0
                        }
                        className={
                          tag._count.files === 0 ? "text-fg-error-primary" : ""
                        }
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      <TagDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        editingTag={editingTag}
      />
    </div>
  );
}
