"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
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
  Download01,
} from "@untitledui/icons";

interface RequestFile {
  file: {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    isArchived: boolean;
    tags: Array<{ tag: { id: string; name: string } }>;
  };
}

interface RequestFilesSectionProps {
  requestId: string;
  files: RequestFile[];
  canEdit?: boolean;
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

export function RequestFilesSection({
  requestId,
  files,
  canEdit = false,
}: RequestFilesSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const queryClient = useQueryClient();

  const existingFileIds = files.map((rf) => rf.file.id);

  const handleAddFiles = (fileIds: string[]) => {
    const newIds = fileIds.filter((id) => !existingFileIds.includes(id));
    if (newIds.length === 0) {
      toast.info("Nenhum arquivo novo selecionado");
      setIsPickerOpen(false);
      return;
    }
    toast.success(`${newIds.length} arquivo(s) adicionado(s)`);
    queryClient.invalidateQueries({ queryKey: [["request"]] });
    setIsPickerOpen(false);
  };

  if (files.length === 0 && !canEdit) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Referências Visuais</h3>
        {canEdit && (
          <Button
            type="button"
            color="secondary"
            size="sm"
            iconLeading={Plus}
            onClick={() => setIsPickerOpen(true)}
          >
            Adicionar
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-sm text-tertiary py-4 text-center border border-dashed border-secondary rounded-lg">
          Nenhuma referência visual anexada
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map(({ file }) => {
            const Icon = getFileTypeIcon(file.mimeType);
            const isImage = file.mimeType.startsWith("image/");

            return (
              <div
                key={file.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-secondary bg-primary hover:border-tertiary transition-colors"
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square bg-secondary flex items-center justify-center overflow-hidden"
                >
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-quaternary" />
                  )}
                  {file.isArchived && (
                    <div className="absolute top-2 right-2">
                      <Badge color="gray" type="pill-color" size="sm">
                        Arquivado
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Download01 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
                <div className="p-2">
                  <p className="text-xs font-medium text-primary truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-tertiary">{formatFileSize(file.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isPickerOpen && (
        <LibraryPickerModal
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          selectedIds={existingFileIds}
          onSelect={handleAddFiles}
        />
      )}
    </div>
  );
}
