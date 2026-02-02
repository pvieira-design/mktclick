"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { FileUpload, getReadableFileSize } from "@/components/application/file-upload/file-upload-base";
import { useFileUpload } from "@/hooks/use-file-upload";
import { TEMPO_LABELS, TAMANHO_LABELS } from "../ad-constants";
import { trpc } from "@/utils/trpc";
import { File06, Trash01 } from "@untitledui/icons";

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
  const { uploadFileWithMetadata, isUploading } = useFileUpload();
  const [tempo, setTempo] = useState("T30S");
  const [tamanho, setTamanho] = useState("S9X16");
  const [mostraProduto, setMostraProduto] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; size: number } | null>(null);

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file) return;
      try {
        const result = await uploadFileWithMetadata(file);
        if (result?.id) {
          setUploadedFile({ id: result.id, name: file.name, size: file.size });
        }
      } catch {
        toast.error("Erro ao enviar arquivo");
      }
    },
    [uploadFileWithMetadata]
  );

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

      <div>
        <label className="text-xs font-medium text-secondary block mb-1">
          Arquivo
        </label>
        {uploadedFile ? (
          <div className="flex items-center gap-2 rounded-lg border border-success-primary bg-primary p-2.5">
            <File06 className="h-4 w-4 text-success-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-tertiary">
                {getReadableFileSize(uploadedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUploadedFile(null)}
              className="text-error-primary hover:text-error-secondary cursor-pointer"
            >
              <Trash01 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <FileUpload.Root>
            <FileUpload.DropZone
              hint="Video, imagem ou documento (max. 500MB)"
              accept="video/*,image/*,.pdf,.doc,.docx"
              maxSize={500 * 1024 * 1024}
              isDisabled={isUploading}
              onDropFiles={handleFileUpload}
              onSizeLimitExceed={() =>
                toast.error("Arquivo muito grande. Maximo: 500MB")
              }
            />
          </FileUpload.Root>
        )}
        {isUploading && (
          <p className="text-xs text-tertiary mt-1">Enviando arquivo...</p>
        )}
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
              fileId: uploadedFile!.id,
            })
          }
          isDisabled={createMutation.isPending || !uploadedFile || isUploading}
        >
          {createMutation.isPending ? "Salvando..." : "Salvar Hook"}
        </Button>
      </div>
    </div>
  );
}
