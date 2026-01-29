"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SearchMd,
  Check,
  Image01,
  File06,
  VideoRecorder,
  MusicNote01,
  FileQuestion02,
} from "@untitledui/icons";

interface LibraryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

interface FileItem {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  isArchived: boolean;
  tags: Array<{ tag: { id: string; name: string } }>;
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

export function LibraryPickerModal({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: LibraryPickerModalProps) {
  const [search, setSearch] = useState("");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    ...trpc.file.list.queryOptions({
      search: search || undefined,
      isArchived: false,
      page,
      limit,
    }),
    enabled: open,
  });

  const handleToggleSelect = (fileId: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleConfirm = () => {
    onSelect(localSelectedIds);
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds);
    onOpenChange(false);
  };

  const newSelectionCount = localSelectedIds.filter((id) => !selectedIds.includes(id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar da Biblioteca</DialogTitle>
          <DialogDescription>
            Escolha arquivos da biblioteca para anexar ao request.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-shrink-0 pb-4">
          <Input
            icon={SearchMd}
            placeholder="Buscar arquivos..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : (data?.items ?? []).length === 0 ? (
            <div className="flex items-center justify-center h-full text-tertiary">
              Nenhum arquivo encontrado
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {(data?.items as FileItem[]).map((file) => {
                  const Icon = getFileTypeIcon(file.mimeType);
                  const isImage = file.mimeType.startsWith("image/");
                  const isSelected = localSelectedIds.includes(file.id);
                  const wasAlreadySelected = selectedIds.includes(file.id);

                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleToggleSelect(file.id)}
                      className={`
                        relative flex flex-col overflow-hidden rounded-lg border-2 transition-all
                        ${isSelected ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-secondary hover:border-tertiary"}
                        ${wasAlreadySelected ? "opacity-60" : ""}
                      `}
                    >
                      <div className="relative aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                        {isImage ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon className="h-8 w-8 text-quaternary" />
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                            <div className="rounded-full bg-brand-primary p-1">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-left">
                        <p className="text-xs font-medium text-primary truncate">{file.name}</p>
                        <p className="text-xs text-tertiary">{formatFileSize(file.size)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {data && data.total > limit && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary">
                  <p className="text-xs text-tertiary">
                    Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      color="secondary"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      isDisabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      color="secondary"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      isDisabled={!data.hasMore}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-secondary">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-tertiary">
              {newSelectionCount > 0
                ? `${newSelectionCount} arquivo(s) novo(s) selecionado(s)`
                : "Nenhum arquivo selecionado"}
            </span>
            <div className="flex gap-2">
              <Button type="button" color="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirm}>
                Confirmar ({localSelectedIds.length})
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
