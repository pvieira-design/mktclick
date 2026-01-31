"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { TEMPO_LABELS, TAMANHO_LABELS } from "../ad-constants";
import { NomenclaturaCopy } from "../nomenclatura/nomenclatura-copy";
import { trpc } from "@/utils/trpc";
import { Trash01 } from "@untitledui/icons";

interface DeliverableCardProps {
  deliverable: any;
  canEdit: boolean;
  onRefresh: () => void;
}

export function DeliverableCard({
  deliverable,
  canEdit,
  onRefresh,
}: DeliverableCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...trpc.adDeliverable.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("Hook removido");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao remover"),
  });

  const hasAdNumber = !!deliverable.adNumber;
  const nomenclatura =
    deliverable.nomenclaturaEditada || deliverable.nomenclaturaGerada;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
      <span className="text-xs font-bold text-brand-primary shrink-0">
        HK{deliverable.hookNumber}
      </span>

      {hasAdNumber && (
        <span className="text-xs font-mono font-bold text-primary shrink-0">
          AD{String(deliverable.adNumber).padStart(4, "0")}
        </span>
      )}

      <span className="text-xs text-tertiary">
        {TEMPO_LABELS[deliverable.tempo] || deliverable.tempo}
      </span>
      <span className="text-xs text-quaternary">·</span>
      <span className="text-xs text-tertiary">
        {TAMANHO_LABELS[deliverable.tamanho] || deliverable.tamanho}
      </span>

      {deliverable.file && (
        <span className="text-xs text-tertiary truncate max-w-[120px]">
          {deliverable.file.name}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1">
        {nomenclatura && <NomenclaturaCopy deliverable={deliverable} />}

        {canEdit && !hasAdNumber && (
          <Button
            size="sm"
            color="tertiary-destructive"
            iconLeading={Trash01}
            onClick={() => deleteMutation.mutate({ id: deliverable.id })}
            isDisabled={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
