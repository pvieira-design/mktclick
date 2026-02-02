"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import {
  SearchMd,
  Image01,
  VideoRecorder,
  FileQuestion02,
  XClose,
  Folder,
  ChevronRight,
} from "@untitledui/icons";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useR2Upload } from "@/hooks/use-r2-upload";

interface MediaLinkDialogProps {
  adId: string;
  adName: string;
  open: boolean;
  onClose: () => void;
  onLinked: () => void;
}

type LinkMediaInput = {
  adId: string;
  adName: string;
  fileId: string;
  propagate: boolean;
};

type Tab = "library" | "upload";

function getFileTypeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image01;
  if (mimeType.startsWith("video/")) return VideoRecorder;
  return FileQuestion02;
}

export function MediaLinkDialog({
  adId,
  adName,
  open,
  onClose,
  onLinked,
}: MediaLinkDialogProps) {
  const queryClient = useQueryClient();
  const { uploadFileWithMetadata } = useFileUpload();
  const { uploadToR2, isVideoFile } = useR2Upload();

  const [tab, setTab] = useState<Tab>("library");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [propagate, setPropagate] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const isSearching = !!search;

  const { data: foldersData } = useQuery({
    ...trpc.fileFolder.list.queryOptions(
      isSearching ? undefined : { parentId: currentFolderId ?? null }
    ),
    enabled: open && tab === "library",
  });

  const { data: breadcrumbsData } = useQuery({
    ...trpc.fileFolder.getBreadcrumbs.queryOptions({ folderId: currentFolderId! }),
    enabled: open && tab === "library" && !!currentFolderId,
  });

  const folders = (foldersData?.items ?? []) as Array<{
    id: string;
    name: string;
    _count: { children: number; files: number };
  }>;
  const breadcrumbs = breadcrumbsData ?? [];

  const { data: libraryData, isLoading: isLoadingLibrary } = useQuery({
    ...trpc.file.list.queryOptions({
      search: search || undefined,
      folderId: isSearching ? undefined : currentFolderId,
      page,
      limit: 12,
    }),
    enabled: open && tab === "library",
  });

  const { data: linkedCount } = useQuery({
    ...trpc.ads.getLinkedAdsCount.queryOptions({ adName }),
    enabled: open,
  });

  const linkMutation = useMutation({
    mutationFn: async (linkInput: LinkMediaInput) => {
      const opts = trpc.ads.linkMedia.mutationOptions();
      const mutFn = opts.mutationFn as (
        vars: LinkMediaInput
      ) => Promise<{ linked: number; adPrefix: string }>;
      return mutFn(linkInput);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [["ads"]] });
      toast.success(
        result.linked > 1
          ? `Mídia vinculada a ${result.linked} anúncios com prefixo ${result.adPrefix}`
          : "Mídia vinculada ao anúncio"
      );
      onLinked();
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao vincular mídia: ${error.message}`);
    },
  });

  const handleLink = useCallback(() => {
    if (!selectedFileId) return;
    linkMutation.mutate({
      adId,
      adName,
      fileId: selectedFileId,
      propagate,
    });
  }, [adId, adName, selectedFileId, propagate, linkMutation]);

  const handleUpload = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const uploadResult = isVideoFile(file)
          ? await uploadToR2(file)
          : await uploadFileWithMetadata(file);

        if (uploadResult?.id) {
          linkMutation.mutate({
            adId,
            adName,
            fileId: uploadResult.id,
            propagate,
          });
        }
      } catch {
        toast.error("Erro ao enviar arquivo");
      } finally {
        setIsUploading(false);
      }
    },
    [adId, adName, propagate, isVideoFile, uploadToR2, uploadFileWithMetadata, linkMutation]
  );

  const showPropagation = (linkedCount?.count ?? 0) > 1;
  const items = (libraryData?.items ?? []) as Array<{
    id: string;
    name: string;
    url: string;
    mimeType: string;
    thumbnailUrl: string | null;
  }>;

  return (
    <ModalOverlay isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()} isDismissable>
      <Modal className="max-w-xl">
        <Dialog className="flex-col items-stretch">
          <div className="w-full rounded-2xl bg-primary shadow-xl ring-1 ring-secondary ring-inset">
            <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-primary">Vincular mídia ao anúncio</h2>
                <p className="text-xs text-tertiary truncate">{adName}</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 text-quaternary hover:bg-secondary hover:text-primary cursor-pointer transition-colors"
              >
                <XClose className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: "calc(85vh - 4rem)" }}>
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-secondary pb-0">
                  <button
                    onClick={() => setTab("library")}
                    className={`px-3 py-2 text-sm font-medium cursor-pointer border-b-2 transition-colors ${
                      tab === "library"
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-tertiary hover:text-primary"
                    }`}
                  >
                    Biblioteca
                  </button>
                  <button
                    onClick={() => setTab("upload")}
                    className={`px-3 py-2 text-sm font-medium cursor-pointer border-b-2 transition-colors ${
                      tab === "upload"
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-tertiary hover:text-primary"
                    }`}
                  >
                    Enviar arquivo
                  </button>
                </div>

                {showPropagation && (
                  <div className="flex items-start gap-2 rounded-lg border border-secondary bg-secondary/30 p-3">
                    <Checkbox
                      isSelected={propagate}
                      onChange={() => setPropagate((p) => !p)}
                      aria-label="Propagar para anúncios com mesmo prefixo"
                    />
                    <div className="text-sm">
                      <p className="text-primary">
                        Aplicar a todos os {linkedCount?.count} anúncios com prefixo{" "}
                        <span className="font-semibold">{linkedCount?.prefix}</span>
                      </p>
                      <p className="text-xs text-tertiary">
                        Desmarque para vincular apenas a este anúncio
                      </p>
                    </div>
                  </div>
                )}

                {tab === "library" && (
                  <div className="space-y-3">
                    <div className="w-full">
                      <Input
                        aria-label="Buscar na biblioteca"
                        icon={SearchMd}
                        placeholder="Buscar arquivo..."
                        value={search}
                        onChange={(value) => {
                          setSearch(value);
                          setPage(1);
                        }}
                      />
                    </div>

                    {!isSearching && currentFolderId && (
                      <div className="flex items-center gap-1 text-xs overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => { setCurrentFolderId(null); setPage(1); }}
                          className="text-tertiary hover:text-primary transition-colors whitespace-nowrap"
                        >
                          Biblioteca
                        </button>
                        {breadcrumbs.map((crumb) => (
                          <span key={crumb.id} className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 text-quaternary flex-shrink-0" />
                            <button
                              type="button"
                              onClick={() => { setCurrentFolderId(crumb.id); setPage(1); }}
                              className={`whitespace-nowrap ${
                                crumb.id === currentFolderId
                                  ? "text-primary font-medium"
                                  : "text-tertiary hover:text-primary transition-colors"
                              }`}
                            >
                              {crumb.name}
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {isLoadingLibrary ? (
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="aspect-square rounded-lg" />
                        ))}
                      </div>
                    ) : !isSearching && folders.length === 0 && items.length === 0 ? (
                      <div className="text-center py-8 text-sm text-tertiary">
                        Nenhum arquivo encontrado
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {!isSearching && folders.map((folder) => (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => { setCurrentFolderId(folder.id); setPage(1); }}
                            className="aspect-square rounded-lg overflow-hidden bg-secondary flex flex-col items-center justify-center gap-1.5 ring-2 ring-transparent hover:ring-border-primary transition-all cursor-pointer"
                          >
                            <Folder className="h-8 w-8 text-quaternary" />
                            <span className="text-xs font-medium text-primary truncate max-w-[90%] px-1">{folder.name}</span>
                            <span className="text-[10px] text-tertiary">
                              {folder._count.files} arquivo{folder._count.files !== 1 ? "s" : ""}
                            </span>
                          </button>
                        ))}
                        {items.map((file) => {
                          const Icon = getFileTypeIcon(file.mimeType);
                          const isImg = file.mimeType.startsWith("image/");
                          const isVid = file.mimeType.startsWith("video/");
                          const isSelected = selectedFileId === file.id;

                          return (
                            <button
                              key={file.id}
                              onClick={() => setSelectedFileId(file.id)}
                              className={`relative aspect-square rounded-lg overflow-hidden bg-secondary flex items-center justify-center cursor-pointer ring-2 transition-all ${
                                isSelected
                                  ? "ring-brand-primary"
                                  : "ring-transparent hover:ring-border-primary"
                              }`}
                            >
                              {isImg ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : isVid && file.thumbnailUrl ? (
                                <img
                                  src={file.thumbnailUrl}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Icon className="h-8 w-8 text-quaternary" />
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                  <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center">
                                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <path d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {libraryData && libraryData.total > 12 && (
                      <div className="flex items-center justify-between text-xs text-tertiary">
                        <span>
                          {((page - 1) * 12) + 1}–{Math.min(page * 12, libraryData.total)} de {libraryData.total}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-2 py-1 rounded border border-secondary disabled:opacity-50 cursor-pointer"
                          >
                            Anterior
                          </button>
                          <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!libraryData.hasMore}
                            className="px-2 py-1 rounded border border-secondary disabled:opacity-50 cursor-pointer"
                          >
                            Próximo
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button color="secondary" onClick={onClose}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleLink}
                        isDisabled={!selectedFileId || linkMutation.isPending}
                      >
                        {linkMutation.isPending ? "Vinculando..." : "Vincular"}
                      </Button>
                    </div>
                  </div>
                )}

                {tab === "upload" && (
                  <div className="space-y-3">
                    <FileUpload.Root>
                      <FileUpload.DropZone
                        hint="Imagens (máx. 50MB) | Vídeos (máx. 500MB)"
                        accept="image/*,video/*"
                        maxSize={500 * 1024 * 1024}
                        onDropFiles={handleUpload}
                        onSizeLimitExceed={() =>
                          toast.error("Arquivo muito grande. Máximo: 500MB para vídeos")
                        }
                      />
                    </FileUpload.Root>

                    {isUploading && (
                      <div className="text-center text-sm text-tertiary py-4">
                        Enviando e vinculando...
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button color="secondary" onClick={onClose}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
