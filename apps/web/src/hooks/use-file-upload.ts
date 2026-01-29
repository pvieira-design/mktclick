"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UploadResult {
  url: string;
  pathname: string;
  id?: string;
  file?: {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
  };
}

export function useFileUpload() {
  const uploadMutation = useMutation<UploadResult, Error, { filename: string; contentType: string; data: string }>({
    mutationFn: async (input) => {
      const options = trpc.upload.upload.mutationOptions();
      return (options.mutationFn as any)(input);
    },
    onError: (error: Error) => {
      toast.error(`Erro no upload: ${error.message}`);
    },
  });

  const deleteMutation = useMutation<{ success: boolean }, Error, { url: string }>({
    mutationFn: async (input) => {
      const options = trpc.upload.delete.mutationOptions();
      return (options.mutationFn as any)(input);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao deletar arquivo: ${error.message}`);
    },
  });

  const uploadFile = useCallback(
    async (_fieldName: string, file: File): Promise<string> => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Arquivo muito grande. Máximo: 10MB`);
        throw new Error("File too large");
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(`Tipo de arquivo não permitido: ${file.type}`);
        throw new Error("Invalid file type");
      }

      const base64 = await fileToBase64(file);
      
      const result = await uploadMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        data: base64,
      });

      toast.success("Arquivo enviado com sucesso!");
      return result.url;
    },
    [uploadMutation]
  );

  const uploadFileWithMetadata = useCallback(
    async (file: File, onProgress?: (progress: number) => void): Promise<UploadResult | null> => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`Arquivo muito grande. Máximo: 50MB`);
        return null;
      }

      onProgress?.(10);
      const base64 = await fileToBase64(file);
      onProgress?.(30);
      
      const result = await uploadMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        data: base64,
      });

      onProgress?.(100);
      return result;
    },
    [uploadMutation]
  );

  const deleteFile = useCallback(
    async (url: string): Promise<void> => {
      await deleteMutation.mutateAsync({ url });
      toast.success("Arquivo removido!");
    },
    [deleteMutation]
  );

  return {
    uploadFile,
    uploadFileWithMetadata,
    deleteFile,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
