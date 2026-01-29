"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit01, Trash01, Check, X } from "@untitledui/icons";

interface FileTag {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    files: number;
  };
}

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data, isLoading } = useQuery(trpc.fileTag.list.queryOptions());

  const createMutation = useMutation({
    ...(trpc.fileTag.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tag criada com sucesso");
      queryClient.invalidateQueries({ queryKey: [["fileTag", "list"]] });
      setNewTagName("");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    ...(trpc.fileTag.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tag atualizada");
      queryClient.invalidateQueries({ queryKey: [["fileTag", "list"]] });
      setEditingId(null);
      setEditingName("");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

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

  const handleCreate = () => {
    if (!newTagName.trim()) return;
    (createMutation.mutate as any)({ name: newTagName.trim() });
  };

  const handleUpdate = (id: string) => {
    if (!editingName.trim()) return;
    (updateMutation.mutate as any)({ id, name: editingName.trim() });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tag?")) {
      (deleteMutation.mutate as any)({ id });
    }
  };

  const startEditing = (tag: FileTag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const columns = [
    { id: "name", label: "Nome" },
    { id: "usage", label: "Uso" },
    { id: "createdAt", label: "Criada em" },
    { id: "actions", label: "Ações" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Gerenciar Tags</h1>
        <p className="text-tertiary">
          Crie e gerencie tags para organizar arquivos na biblioteca.
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-secondary mb-1.5">
            Nova Tag
          </label>
          <Input
            placeholder="Nome da tag..."
            value={newTagName}
            onChange={setNewTagName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
        </div>
        <Button
          iconLeading={Plus}
          onClick={handleCreate}
          isDisabled={!newTagName.trim() || createMutation.isPending}
        >
          Criar Tag
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
            Nenhuma tag encontrada. Crie uma para começar.
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
            <Table.Body items={data?.items ?? []}>
              {(tag: FileTag) => (
                <Table.Row key={tag.id} id={tag.id}>
                  <Table.Cell>
                    {editingId === tag.id ? (
                      <Input
                        value={editingName}
                        onChange={setEditingName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(tag.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="max-w-[200px]"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-primary">{tag.name}</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={tag._count.files > 0 ? "brand" : "gray"}
                      type="pill-color"
                      size="sm"
                    >
                      {tag._count.files} arquivo{tag._count.files !== 1 ? "s" : ""}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-tertiary">
                    {new Date(tag.createdAt).toLocaleDateString("pt-BR")}
                  </Table.Cell>
                  <Table.Cell>
                    {editingId === tag.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          color="tertiary"
                          size="sm"
                          iconLeading={Check}
                          onClick={() => handleUpdate(tag.id)}
                          isDisabled={updateMutation.isPending}
                          className="text-fg-success-primary"
                        />
                        <Button
                          color="tertiary"
                          size="sm"
                          iconLeading={X}
                          onClick={cancelEditing}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          color="tertiary"
                          size="sm"
                          iconLeading={Edit01}
                          onClick={() => startEditing(tag)}
                        />
                        <Button
                          color="tertiary"
                          size="sm"
                          iconLeading={Trash01}
                          onClick={() => handleDelete(tag.id)}
                          isDisabled={deleteMutation.isPending || tag._count.files > 0}
                          className={tag._count.files === 0 ? "text-fg-error-primary" : ""}
                        />
                      </div>
                    )}
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
