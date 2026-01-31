"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { trpc } from "@/utils/trpc";

interface NomenclaturaEditorProps {
  deliverable: any;
  onRefresh: () => void;
}

export function NomenclaturaEditor({
  deliverable,
  onRefresh,
}: NomenclaturaEditorProps) {
  const queryClient = useQueryClient();
  const [editedValue, setEditedValue] = useState(
    deliverable.nomenclaturaEditada || ""
  );

  const updateMutation = useMutation({
    ...trpc.adDeliverable.updateNomenclatura.mutationOptions(),
    onSuccess: () => {
      toast.success("Nomenclatura atualizada");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar"),
  });

  return (
    <div className="space-y-2">
      <div>
        <label className="text-xs font-medium text-secondary block mb-1">
          Nomenclatura Gerada
        </label>
        <p className="text-xs font-mono text-tertiary bg-secondary rounded-lg p-2 break-all">
          {deliverable.nomenclaturaGerada || "Nao gerada"}
        </p>
      </div>

      <div>
        <Input
          label="Nomenclatura Editada (opcional)"
          value={editedValue}
          onChange={(v: string) => setEditedValue(v)}
          placeholder="Se vazio, usa a gerada"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          color="primary"
          onClick={() =>
            updateMutation.mutate({
              id: deliverable.id,
              nomenclaturaEditada: editedValue || undefined,
            })
          }
          isDisabled={updateMutation.isPending}
        >
          Salvar
        </Button>
        <Button
          size="sm"
          color="secondary"
          onClick={() => {
            setEditedValue("");
            updateMutation.mutate({
              id: deliverable.id,
              nomenclaturaEditada: undefined,
            });
          }}
          isDisabled={updateMutation.isPending}
        >
          Resetar para Gerada
        </Button>
      </div>
    </div>
  );
}
