"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { TextArea } from "@/components/base/textarea/textarea";
import { trpc } from "@/utils/trpc";
import { PHASE_CONFIG } from "../ad-constants";

interface VideoRegressionDialogProps {
  video: any;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function VideoRegressionDialog({
  video,
  isOpen,
  onClose,
  onRefresh,
}: VideoRegressionDialogProps) {
  const queryClient = useQueryClient();
  const [targetPhase, setTargetPhase] = useState<number>(2);
  const [reason, setReason] = useState("");

  const regressMutation = useMutation({
    ...trpc.adVideo.regress.mutationOptions(),
    onSuccess: () => {
      toast.success("Video enviado de volta");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onClose();
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao regredir video"),
  });

  if (!isOpen) return null;

  const currentPhase = video.currentPhase;
  const availablePhases = Array.from(
    { length: currentPhase - 2 },
    (_, i) => i + 2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-primary p-6 shadow-xl ring-1 ring-border-secondary">
        <h3 className="text-lg font-semibold text-primary">
          Enviar Video de Volta
        </h3>
        <p className="text-sm text-tertiary mt-1">
          Video: {video.nomeDescritivo}
        </p>
        <p className="text-sm text-tertiary">
          Fase atual: {currentPhase} ({PHASE_CONFIG[currentPhase]?.label})
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary block mb-2">
              Enviar para qual fase?
            </label>
            <div className="space-y-2">
              {availablePhases.map((phase) => (
                <label
                  key={phase}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="targetPhase"
                    value={phase}
                    checked={targetPhase === phase}
                    onChange={() => setTargetPhase(phase)}
                    className="h-4 w-4 text-brand-primary"
                  />
                  <span className="text-sm text-primary">
                    Fase {phase} - {PHASE_CONFIG[phase]?.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <TextArea
              label="Motivo (obrigatorio)"
              value={reason}
              onChange={(v: string) => setReason(v)}
              rows={3}
              placeholder="Descreva o motivo da regressao (min 10 caracteres)..."
            />
          </div>

          <div className="rounded-lg bg-warning-secondary p-3">
            <p className="text-xs text-warning-primary">
              O video voltara para a fase selecionada com status PENDENTE. O
              projeto nao avancara ate este video voltar a PRONTO.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button size="sm" color="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            color="primary-destructive"
            onClick={() =>
              regressMutation.mutate({
                id: video.id,
                targetPhase,
                reason,
              })
            }
            isDisabled={reason.length < 10 || regressMutation.isPending}
          >
            Enviar de Volta
          </Button>
        </div>
      </div>
    </div>
  );
}
