"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { useFileUpload } from "@/hooks/use-file-upload";
import { LibraryPickerModal } from "./library-picker-modal";
import { toast } from "sonner";
import {
  Plus,
  Trash01,
  Image01,
  File06,
  VideoRecorder,
  MusicNote01,
  FileQuestion02,
} from "@untitledui/icons";

interface FileAttachmentSectionProps {
  selectedFileIds: string[];
  onSelectedFileIdsChange: (ids: string[]) => void;
  disabled?: boolean;
}

interface FileItem {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  isArchived?: boolean;
}

function getFileTypeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image01;
  if (mimeType.startsWith("video/")) return VideoRecorder;
  if (mimeType.startsWith("audio/")) return MusicNote01;
  if (mimeType.includes("pdf")) return File06;
  return FileQuestion02;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function FileAttachmentSection({
  selectedFileIds,
  onSelectedFileIdsChange,
  disabled = false,
}: FileAttachmentSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { progress: number; file: File }>>(new Map());
  const { uploadFileWithMetadata } = useFileUpload();

  const { data: selectedFilesData } = useQuery({
    ...trpc.file.list.queryOptions({
      limit: 100,
    }),
    enabled: selectedFileIds.length > 0,
    select: (data) => data.items.filter((f: FileItem) => selectedFileIds.includes(f.id)),
  });

  const handleFilesDropped = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const tempId = `temp-${Date.now()}-${file.name}`;
      
      setUploadingFiles((prev) => new Map(prev).set(tempId, { progress: 0, file }));
      
      try {
        const result = await uploadFileWithMetadata(file, (progress: number) => {
          setUploadingFiles((prev) => {
            const newMap = new Map(prev);
            const item = newMap.get(tempId);
            if (item) {
              newMap.set(tempId, { ...item, progress });
            }
            return newMap;
          });
        });
        
        if (result?.id) {
          onSelectedFileIdsChange([...selectedFileIds, result.id]);
        }
        
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
      } catch {
        toast.error(`Erro ao fazer upload de ${file.name}`);
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onSelectedFileIdsChange(selectedFileIds.filter((id) => id !== fileId));
  };

  const handlePickerSelect = (fileIds: string[]) => {
    const newIds = fileIds.filter((id) => !selectedFileIds.includes(id));
    onSelectedFileIdsChange([...selectedFileIds, ...newIds]);
    setIsPickerOpen(false);
  };

  const selectedFiles = selectedFilesData || [];

  return (
    <div className="space-y-4">
      <FileUpload.Root>
        <FileUpload.DropZone
          hint="PNG, JPG, PDF, MP4 (máx. 50MB)"
          accept="image/*,video/*,audio/*,application/pdf"
          maxSize={50 * 1024 * 1024}
          onDropFiles={handleFilesDropped}
          isDisabled={disabled}
          onSizeLimitExceed={() => toast.error("Arquivo muito grande. Máximo: 50MB")}
        />

        {uploadingFiles.size > 0 && (
          <FileUpload.List>
            {Array.from(uploadingFiles.entries()).map(([tempId, { progress, file }]) => (
              <FileUpload.ListItemProgressBar
                key={tempId}
                name={file.name}
                size={file.size}
                progress={progress}
                onDelete={() => {
                  setUploadingFiles((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(tempId);
                    return newMap;
                  });
                }}
              />
            ))}
          </FileUpload.List>
        )}
      </FileUpload.Root>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          color="secondary"
          size="sm"
          iconLeading={Plus}
          onClick={() => setIsPickerOpen(true)}
          isDisabled={disabled}
        >
          Selecionar da Biblioteca
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-tertiary">{selectedFiles.length} arquivo(s) selecionado(s)</p>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file: FileItem) => {
              const Icon = getFileTypeIcon(file.mimeType);
              const isImage = file.mimeType.startsWith("image/");

              return (
                <div
                  key={file.id}
                  className="group relative flex items-center gap-2 rounded-lg border border-secondary bg-primary p-2 pr-8"
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded bg-secondary flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-5 w-5 text-quaternary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary max-w-[150px]">{file.name}</p>
                    <p className="text-xs text-tertiary">{formatFileSize(file.size)}</p>
                  </div>
                  {file.isArchived && (
                    <Badge color="gray" type="pill-color" size="sm">
                      Arquivado
                    </Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={disabled}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-tertiary hover:text-error-primary transition-colors disabled:opacity-50"
                    aria-label={`Remover ${file.name}`}
                  >
                    <Trash01 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isPickerOpen && (
        <LibraryPickerModal
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          selectedIds={selectedFileIds}
          onSelect={handlePickerSelect}
        />
      )}
    </div>
  );
}
