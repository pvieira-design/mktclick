"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { TEMPO_LABELS, TAMANHO_LABELS } from "../ad-constants";
import { trpc } from "@/utils/trpc";

interface DeliverableFormProps {
  videoId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function DeliverableForm({
  videoId,
  onClose,
  onRefresh,
}: DeliverableFormProps) {
  const queryClient = useQueryClient();
  const [tempo, setTempo] = useState("T30S");
  const [tamanho, setTamanho] = useState("S9X16");
  const [mostraProduto, setMostraProduto] = useState(false);

  const createMutation = useMutation({
    ...trpc.adDeliverable.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Hook adicionado");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onClose();
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar hook"),
  });

  return (
    <div className="rounded-lg border border-brand-primary bg-primary p-4 space-y-3">
      <h4 className="text-sm font-semibold text-primary">Novo Hook</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-secondary block mb-1">
            Duracao
          </label>
          <select
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            className="w-full rounded-lg border border-border-secondary bg-primary px-3 py-2 text-sm text-primary"
          >
            {Object.entries(TEMPO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-secondary block mb-1">
            Tamanho
          </label>
          <select
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
            className="w-full rounded-lg border border-border-secondary bg-primary px-3 py-2 text-sm text-primary"
          >
            {Object.entries(TAMANHO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={mostraProduto}
          onChange={() => setMostraProduto(!mostraProduto)}
          className="h-4 w-4 rounded"
        />
        <span className="text-tertiary">Mostra Produto</span>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button size="sm" color="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          color="primary"
          onClick={() =>
            createMutation.mutate({
              videoId,
              tempo: tempo as any,
              tamanho: tamanho as any,
              mostraProduto,
              fileId: undefined as any,
            })
          }
          isDisabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Salvando..." : "Salvar Hook"}
        </Button>
      </div>
    </div>
  );
}
