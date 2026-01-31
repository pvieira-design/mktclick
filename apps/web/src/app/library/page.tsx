"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useGooglePicker } from "@/hooks/use-google-picker";
import { useR2Upload } from "@/hooks/use-r2-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UploadProgressToast } from "@/components/ui/upload-progress-toast";
import { VideoThumbnailSelector } from "@/components/application/video-thumbnail-selector";
import { 
  Plus, 
  SearchMd, 
  FilterLines, 
  Grid01, 
  List,
  Image01,
  File06,
  VideoRecorder,
  MusicNote01,
  FileQuestion02,
  Download01,
  Edit05,
  Tag01,
  Trash01,
  XClose,
  Type01,
  User01,
  Folder,
  FolderPlus,
  ChevronRight,
  ArrowRight,
} from "@untitledui/icons";

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  description: string | null;
  url: string;
  size: number;
  mimeType: string;
  thumbnailUrl: string | null;
  isArchived: boolean;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  creator?: {
    id: string;
    name: string;
    type: string;
  } | null;
  origin?: {
    id: string;
    name: string;
  } | null;
}

interface FolderItem {
  id: string;
  name: string;
  _count: {
    children: number;
    files: number;
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileTypeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image01;
  if (mimeType.startsWith("video/")) return VideoRecorder;
  if (mimeType.startsWith("audio/")) return MusicNote01;
  if (mimeType.includes("pdf")) return File06;
  return FileQuestion02;
}

function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Imagem";
  if (mimeType.startsWith("video/")) return "Vídeo";
  if (mimeType.startsWith("audio/")) return "Áudio";
  if (mimeType.includes("pdf")) return "PDF";
  return "Arquivo";
}

type DriveFileImport = { 
  fileId: string; 
  fileName: string; 
  mimeType: string; 
  accessToken: string;
};

type ImportResult = { 
  results: Array<{ 
    success: boolean; 
    fileName: string; 
    fileId?: string; 
    error?: string;
  }>; 
  totalSuccess: number; 
  totalFailed: number;
};

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const { uploadFileWithMetadata } = useFileUpload();
  const { uploadToR2, isVideoFile } = useR2Upload();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [archivedFilter, setArchivedFilter] = useState<string>("active");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isImportingFromDrive, setIsImportingFromDrive] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [editFile, setEditFile] = useState<FileItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editCreatorId, setEditCreatorId] = useState<string>("");
  const [editOriginId, setEditOriginId] = useState<string>("");
  const [editThumbnailUrl, setEditThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkTagsOpen, setIsBulkTagsOpen] = useState(false);
  const [isBulkCreatorOpen, setIsBulkCreatorOpen] = useState(false);
  const [isBulkRenameOpen, setIsBulkRenameOpen] = useState(false);
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false);
  const [bulkTagIds, setBulkTagIds] = useState<string[]>([]);
  const [bulkCreatorId, setBulkCreatorId] = useState<string>("");
  const [renamePrefix, setRenamePrefix] = useState("");
  const [renameSuffix, setRenameSuffix] = useState("");

  // Folder state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editFolder, setEditFolder] = useState<FolderItem | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<FolderItem | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverBreadcrumb, setDragOverBreadcrumb] = useState<string | null>(null);
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);
  const [movePickerFolderId, setMovePickerFolderId] = useState<string | null>(null);

  const isSearching = !!search || typeFilter !== "all" || tagFilter !== "all";

  const limit = 20;

  const { data: tagsData } = useQuery(trpc.fileTag.list.queryOptions());
  const { data: creatorsData } = useQuery(trpc.creator.list.queryOptions({ isActive: true, limit: 100 }));
  const { data: originsData } = useQuery(trpc.origin.list.queryOptions());

  // Folder queries
  const { data: foldersData } = useQuery(
    trpc.fileFolder.list.queryOptions(
      isSearching ? undefined : { parentId: currentFolderId ?? null }
    )
  );

  const { data: breadcrumbsData } = useQuery({
    ...trpc.fileFolder.getBreadcrumbs.queryOptions({ folderId: currentFolderId! }),
    enabled: !!currentFolderId,
  });

  // Move picker queries
  const { data: movePickerFolders } = useQuery({
    ...trpc.fileFolder.list.queryOptions({ parentId: movePickerFolderId ?? null }),
    enabled: isBulkMoveOpen,
  });

  const { data: movePickerBreadcrumbs } = useQuery({
    ...trpc.fileFolder.getBreadcrumbs.queryOptions({ folderId: movePickerFolderId! }),
    enabled: isBulkMoveOpen && !!movePickerFolderId,
  });

  const folders = (foldersData?.items ?? []) as FolderItem[];
  const breadcrumbs = breadcrumbsData ?? [];

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const { data, isLoading } = useQuery(
    trpc.file.list.queryOptions({
      search: search || undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      tagId: tagFilter !== "all" ? tagFilter : undefined,
      isArchived: archivedFilter === "all" ? undefined : archivedFilter === "archived",
      folderId: isSearching ? undefined : currentFolderId,
      page,
      limit,
    })
  );

  const items = (data?.items ?? []) as FileItem[];
  const isAllSelected = items.length > 0 && items.every((f) => selectedIds.has(f.id));
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected;
  const hasSelection = selectedIds.size > 0;

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      setSelectedIds(new Set(items.map((f) => f.id)));
    }
  }, [isAllSelected, clearSelection, items]);

  useEffect(() => {
    clearSelection();
  }, [search, typeFilter, tagFilter, archivedFilter, page, clearSelection]);

  // Reset page when navigating folders
  useEffect(() => {
    setPage(1);
  }, [currentFolderId]);

  type FileUpdateInput = { id: string; name?: string; thumbnailUrl?: string | null; tagIds?: string[]; creatorId?: string | null; originId?: string | null };

  const updateFileMutation = useMutation({
    mutationFn: async (input: FileUpdateInput) => {
      const options = trpc.file.update.mutationOptions();
      const fn = options.mutationFn as unknown as (input: FileUpdateInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      toast.success("Arquivo atualizado!");
      setEditFile(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  type BulkTagsInput = { ids: string[]; tagIds: string[] };
  const bulkUpdateTagsMutation = useMutation({
    mutationFn: async (input: BulkTagsInput) => {
      const options = trpc.file.bulkUpdateTags.mutationOptions();
      const fn = options.mutationFn as unknown as (input: BulkTagsInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      toast.success(`Tags atualizadas para ${selectedIds.size} arquivo(s)!`);
      clearSelection();
      setIsBulkTagsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar tags: ${error.message}`);
    },
  });

  type BulkCreatorInput = { ids: string[]; creatorId: string | null };
  const bulkUpdateCreatorMutation = useMutation({
    mutationFn: async (input: BulkCreatorInput) => {
      const options = trpc.file.bulkUpdateCreator.mutationOptions();
      const fn = options.mutationFn as unknown as (input: BulkCreatorInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      toast.success(`Creator atualizado para ${selectedIds.size} arquivo(s)!`);
      clearSelection();
      setIsBulkCreatorOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar creator: ${error.message}`);
    },
  });

  type BulkArchiveInput = { ids: string[] };
  const bulkArchiveMutation = useMutation({
    mutationFn: async (input: BulkArchiveInput) => {
      const options = trpc.file.bulkArchive.mutationOptions();
      const fn = options.mutationFn as unknown as (input: BulkArchiveInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      toast.success(`${selectedIds.size} arquivo(s) arquivado(s)!`);
      clearSelection();
      setIsBulkArchiveOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao arquivar: ${error.message}`);
    },
  });

  type BulkRenameInput = { ids: string[]; prefix: string; suffix: string };
  const bulkRenameMutation = useMutation({
    mutationFn: async (input: BulkRenameInput) => {
      const options = trpc.file.bulkRename.mutationOptions();
      const fn = options.mutationFn as unknown as (input: BulkRenameInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      toast.success(`${selectedIds.size} arquivo(s) renomeado(s)!`);
      clearSelection();
      setIsBulkRenameOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao renomear: ${error.message}`);
    },
  });

  // Folder mutations
  type CreateFolderInput = { name: string; parentId?: string | null };
  const createFolderMutation = useMutation({
    mutationFn: async (input: CreateFolderInput) => {
      const options = trpc.fileFolder.create.mutationOptions();
      const fn = options.mutationFn as unknown as (input: CreateFolderInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["fileFolder"]] });
      toast.success("Pasta criada!");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar pasta: ${error.message}`);
    },
  });

  type RenameFolderInput = { id: string; name: string };
  const renameFolderMutation = useMutation({
    mutationFn: async (input: RenameFolderInput) => {
      const options = trpc.fileFolder.rename.mutationOptions();
      const fn = options.mutationFn as unknown as (input: RenameFolderInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["fileFolder"]] });
      toast.success("Pasta renomeada!");
      setEditFolder(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao renomear pasta: ${error.message}`);
    },
  });

  type DeleteFolderInput = { id: string };
  const deleteFolderMutation = useMutation({
    mutationFn: async (input: DeleteFolderInput) => {
      const options = trpc.fileFolder.delete.mutationOptions();
      const fn = options.mutationFn as unknown as (input: DeleteFolderInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["fileFolder"]] });
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      toast.success("Pasta excluída! Os arquivos foram movidos para a pasta pai.");
      setDeleteFolderConfirm(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir pasta: ${error.message}`);
    },
  });

  type MoveFilesInput = { fileIds: string[]; folderId: string | null };
  const moveFilesMutation = useMutation({
    mutationFn: async (input: MoveFilesInput) => {
      const options = trpc.fileFolder.moveFiles.mutationOptions();
      const fn = options.mutationFn as unknown as (input: MoveFilesInput) => Promise<unknown>;
      return fn(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      queryClient.invalidateQueries({ queryKey: [["fileFolder"]] });
      toast.success("Arquivos movidos!");
      clearSelection();
      setIsBulkMoveOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao mover arquivos: ${error.message}`);
    },
  });

  const openEditDialog = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(file.name);
    setEditTagIds(file.tags.map((t) => t.tag.id));
    setEditCreatorId(file.creator?.id ?? "");
    setEditOriginId(file.origin?.id ?? "");
    setEditThumbnailUrl(file.thumbnailUrl);
    setEditFile(file);
  };

  const handleSaveEdit = () => {
    if (!editFile) return;
    updateFileMutation.mutate({
      id: editFile.id,
      name: editName || undefined,
      thumbnailUrl: editThumbnailUrl !== editFile.thumbnailUrl ? editThumbnailUrl : undefined,
      tagIds: editTagIds,
      creatorId: editCreatorId || null,
      originId: editOriginId || null,
    });
  };

  const handleThumbnailCaptured = async (blob: Blob) => {
    setIsThumbnailUploading(true);
    try {
      const formData = new FormData();
      const file = new File([blob], "thumbnail.png", { type: "image/png" });
      formData.append("file", file);
      const res = await fetch("/api/upload-thumbnail", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const { url } = await res.json();
      setEditThumbnailUrl(url);
      toast.success("Thumbnail capturada!");
    } catch (err) {
      toast.error(`Erro ao enviar thumbnail: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const importFromDriveMutation = useMutation({
    mutationFn: async (files: DriveFileImport[]) => {
      const options = trpc.googleDrive.importMultiple.mutationOptions();
      const fn = options.mutationFn as unknown as (input: { files: DriveFileImport[] }) => Promise<ImportResult>;
      return fn({ files });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
      if (data.totalSuccess > 0) {
        toast.success(`${data.totalSuccess} arquivo(s) importado(s) com sucesso!`);
      }
      if (data.totalFailed > 0) {
        toast.error(`${data.totalFailed} arquivo(s) falharam na importação.`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
  });

  const { openPicker, isLoading: isPickerLoading, isConfigured: isGoogleConfigured } = useGooglePicker({
    multiSelect: true,
    onFilesSelected: async (files, accessToken) => {
      setIsImportingFromDrive(true);
      try {
        await importFromDriveMutation.mutateAsync(
          files.map((file) => ({
            fileId: file.id,
            fileName: file.name,
            mimeType: file.mimeType,
            accessToken,
          }))
        );
      } finally {
        setIsImportingFromDrive(false);
      }
    },
    onError: (error) => {
      toast.error(`Erro no Google Drive: ${error.message}`);
    },
  });

  const uploadStateRef = useRef({
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    currentProgress: 0,
    currentFileName: "",
  });

  const updateUploadToast = () => {
    const state = uploadStateRef.current;
    toast.custom(
      () => (
        <UploadProgressToast
          totalFiles={state.totalFiles}
          completedFiles={state.completedFiles}
          failedFiles={state.failedFiles}
          currentProgress={state.currentProgress}
          currentFileName={state.currentFileName}
        />
      ),
      { id: "upload-progress", duration: Infinity }
    );
  };

  const handleFilesDropped = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploadOpen(false);

    uploadStateRef.current = {
      totalFiles: fileArray.length,
      completedFiles: 0,
      failedFiles: 0,
      currentProgress: 0,
      currentFileName: fileArray[0].name,
    };
    updateUploadToast();

    const uploadedFileIds: string[] = [];

    for (const file of fileArray) {
      uploadStateRef.current.currentFileName = file.name;
      uploadStateRef.current.currentProgress = 0;
      updateUploadToast();

      const useR2 = isVideoFile(file);

      try {
        const updateProgress = (progress: number) => {
          uploadStateRef.current.currentProgress = progress;
          updateUploadToast();
        };

        let result: { id?: string } | undefined;
        if (useR2) {
          result = await uploadToR2(file, updateProgress) as { id?: string } | undefined;
        } else {
          result = await uploadFileWithMetadata(file, updateProgress) as { id?: string } | undefined;
        }

        if (result?.id) {
          uploadedFileIds.push(result.id);
        }

        uploadStateRef.current.completedFiles++;
        uploadStateRef.current.currentProgress = 100;
        updateUploadToast();
      } catch {
        uploadStateRef.current.failedFiles++;
        updateUploadToast();
      }
    }

    toast.dismiss("upload-progress");

    const { completedFiles, failedFiles, totalFiles } = uploadStateRef.current;
    const isSingular = totalFiles === 1;

    if (failedFiles === 0) {
      toast.success(
        isSingular
          ? "Arquivo enviado com sucesso!"
          : `${completedFiles} arquivos enviados com sucesso!`
      );
    } else if (completedFiles === 0) {
      toast.error(
        isSingular
          ? "Falha no upload do arquivo"
          : `Falha no upload de ${failedFiles} arquivos`
      );
    } else {
      toast.error(`${completedFiles} enviado${completedFiles > 1 ? "s" : ""}, ${failedFiles} ${failedFiles > 1 ? "falharam" : "falhou"}`);
    }

    // Move uploaded files to current folder
    if (currentFolderId && uploadedFileIds.length > 0) {
      moveFilesMutation.mutate({ fileIds: uploadedFileIds, folderId: currentFolderId });
    } else {
      queryClient.invalidateQueries({ queryKey: [["file"]] });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, fileIds: string[]) => {
    e.dataTransfer.setData("application/json", JSON.stringify(fileIds));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    setDragOverBreadcrumb(null);
    try {
      const fileIds = JSON.parse(e.dataTransfer.getData("application/json")) as string[];
      if (fileIds.length > 0) {
        moveFilesMutation.mutate({ fileIds, folderId });
      }
    } catch {
      // ignore invalid drag data
    }
  };

  const handleDropOnBreadcrumb = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverBreadcrumb(null);
    setDragOverFolderId(null);
    try {
      const fileIds = JSON.parse(e.dataTransfer.getData("application/json")) as string[];
      if (fileIds.length > 0) {
        moveFilesMutation.mutate({ fileIds, folderId });
      }
    } catch {
      // ignore invalid drag data
    }
  };

  const selectedIdsInOrder = items.filter((f) => selectedIds.has(f.id)).map((f) => f.id);

  const renderFolderCard = (folder: FolderItem) => {
    const isDropTarget = dragOverFolderId === folder.id;
    return (
      <div
        key={folder.id}
        className={`group relative flex flex-col overflow-hidden rounded-lg border bg-primary transition-colors cursor-pointer ${
          isDropTarget ? "border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/5" : "border-secondary hover:border-brand-primary"
        }`}
        onClick={() => setCurrentFolderId(folder.id)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverFolderId(folder.id);
        }}
        onDragLeave={() => setDragOverFolderId(null)}
        onDrop={(e) => handleDropOnFolder(e, folder.id)}
      >
        <div className="relative aspect-square bg-secondary/50 flex flex-col items-center justify-center gap-2">
          <Folder className="h-12 w-12 text-brand-primary" />
          <span className="text-xs text-tertiary">
            {folder._count.files} arquivo{folder._count.files !== 1 ? "s" : ""}
            {folder._count.children > 0 && `, ${folder._count.children} pasta${folder._count.children !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <h3 className="font-medium text-primary truncate flex-1" title={folder.name}>
            {folder.name}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditFolderName(folder.name);
                setEditFolder(folder);
              }}
              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
            >
              <Edit05 className="h-3.5 w-3.5 text-tertiary" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteFolderConfirm(folder);
              }}
              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash01 className="h-3.5 w-3.5 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFolderRow = (folder: FolderItem) => {
    const isDropTarget = dragOverFolderId === folder.id;
    return (
      <div
        key={folder.id}
        className={`flex items-center gap-4 p-4 border-b border-secondary transition-colors cursor-pointer ${
          isDropTarget ? "bg-brand-primary/5 border-brand-primary" : "hover:bg-secondary/50"
        }`}
        onClick={() => setCurrentFolderId(folder.id)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverFolderId(folder.id);
        }}
        onDragLeave={() => setDragOverFolderId(null)}
        onDrop={(e) => handleDropOnFolder(e, folder.id)}
      >
        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-brand-primary/10 flex items-center justify-center">
          <Folder className="h-6 w-6 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-primary truncate">{folder.name}</h3>
          <div className="flex items-center gap-4 text-xs text-tertiary">
            <span>{folder._count.files} arquivo{folder._count.files !== 1 ? "s" : ""}</span>
            {folder._count.children > 0 && (
              <span>{folder._count.children} pasta{folder._count.children !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditFolderName(folder.name);
              setEditFolder(folder);
            }}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
          >
            <Edit05 className="h-4 w-4 text-tertiary" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteFolderConfirm(folder);
            }}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash01 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  const renderFileCard = (file: FileItem) => {
    const Icon = getFileTypeIcon(file.mimeType);
    const isImage = file.mimeType.startsWith("image/");
    const isVideo = file.mimeType.startsWith("video/");
    const isSelected = selectedIds.has(file.id);

    return (
      <div
        key={file.id}
        className={`group relative flex flex-col overflow-hidden rounded-lg border bg-primary transition-colors cursor-pointer ${
          isSelected ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-secondary hover:border-brand-primary"
        }`}
        onClick={() => setPreviewFile(file)}
        draggable
        onDragStart={(e) => {
          const ids = selectedIds.has(file.id) ? Array.from(selectedIds) : [file.id];
          handleDragStart(e, ids);
        }}
      >
        <div className="relative aspect-square bg-secondary flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : isVideo ? (
            <div className="relative h-full w-full flex items-center justify-center">
              {file.thumbnailUrl ? (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon className="h-12 w-12 text-quaternary" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/80 flex items-center justify-center">
                  <svg className="h-5 w-5 text-primary ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <Icon className="h-12 w-12 text-quaternary" />
          )}
          {file.isArchived && (
            <div className="absolute top-2 right-2">
              <Badge color="gray" type="pill-color" size="sm">
                Arquivado
              </Badge>
            </div>
          )}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-2 left-2 z-10 h-8 w-8 rounded-md bg-primary/80 backdrop-blur-sm flex items-center justify-center transition-opacity ${
              hasSelection || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Checkbox
              isSelected={isSelected}
              onChange={() => toggleSelection(file.id)}
              aria-label={`Selecionar ${file.name}`}
            />
          </div>
          {!hasSelection && (
            <button
              onClick={(e) => openEditDialog(file, e)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-md bg-primary/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary cursor-pointer"
            >
              <Edit05 className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 p-3">
          <h3 className="font-medium text-primary truncate" title={file.name}>
            {file.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-tertiary">
            <span>{getFileTypeLabel(file.mimeType)}</span>
            <span>{formatFileSize(file.size)}</span>
          </div>
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {file.tags.slice(0, 2).map(({ tag }) => (
              <Badge key={tag.id} color="gray" type="pill-color" size="sm">
                {tag.name}
              </Badge>
            ))}
            {file.tags.length > 2 && (
              <Badge color="gray" type="pill-color" size="sm">
                +{file.tags.length - 2}
              </Badge>
            )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFileRow = (file: FileItem) => {
    const Icon = getFileTypeIcon(file.mimeType);
    const isImage = file.mimeType.startsWith("image/");
    const isVideo = file.mimeType.startsWith("video/");
    const isSelected = selectedIds.has(file.id);

    return (
      <div
        key={file.id}
        className={`flex items-center gap-4 p-4 border-b border-secondary transition-colors cursor-pointer ${
          isSelected ? "bg-brand-primary/5" : "hover:bg-secondary/50"
        }`}
        onClick={() => setPreviewFile(file)}
        draggable
        onDragStart={(e) => {
          const ids = selectedIds.has(file.id) ? Array.from(selectedIds) : [file.id];
          handleDragStart(e, ids);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <Checkbox
            isSelected={isSelected}
            onChange={() => toggleSelection(file.id)}
            aria-label={`Selecionar ${file.name}`}
          />
        </div>
        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : isVideo && file.thumbnailUrl ? (
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-6 w-6 text-quaternary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-primary truncate">{file.name}</h3>
            {file.isArchived && (
              <Badge color="gray" type="pill-color" size="sm">
                Arquivado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-tertiary">
            <span>{getFileTypeLabel(file.mimeType)}</span>
            <span>{formatFileSize(file.size)}</span>
            <span>{file.uploadedBy?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file.tags.slice(0, 3).map(({ tag }) => (
            <Badge key={tag.id} color="gray" type="pill-color" size="sm">
              {tag.name}
            </Badge>
          ))}
        </div>
        <button
          onClick={(e) => openEditDialog(file, e)}
          className="flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
        >
          <Edit05 className="h-4 w-4 text-tertiary" />
        </button>
      </div>
    );
  };

  const movePickerFolderItems = (movePickerFolders?.items ?? []) as FolderItem[];
  const movePickerBreadcrumbItems = movePickerBreadcrumbs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Biblioteca</h1>
          <p className="text-tertiary">
            Gerencie arquivos e referências visuais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isGoogleConfigured && (
            <Button 
              color="secondary" 
              iconLeading={Download01} 
              onClick={openPicker}
              isDisabled={isPickerLoading || isImportingFromDrive}
            >
              {isImportingFromDrive ? "Importando..." : "Importar do Drive"}
            </Button>
          )}
          <Button
            color="secondary"
            iconLeading={FolderPlus}
            onClick={() => {
              setNewFolderName("");
              setIsCreateFolderOpen(true);
            }}
          >
            Nova Pasta
          </Button>
          <Button iconLeading={Plus} onClick={() => setIsUploadOpen(true)}>
            Upload
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {(currentFolderId || breadcrumbs.length > 0) && (
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
              dragOverBreadcrumb === "root" ? "bg-brand-primary/10 text-brand-primary" : "text-tertiary hover:text-primary hover:bg-secondary"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverBreadcrumb("root");
            }}
            onDragLeave={() => setDragOverBreadcrumb(null)}
            onDrop={(e) => handleDropOnBreadcrumb(e, null)}
          >
            Biblioteca
          </button>
          {breadcrumbs.map((crumb) => (
            <div key={crumb.id} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-quaternary" />
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  dragOverBreadcrumb === crumb.id
                    ? "bg-brand-primary/10 text-brand-primary"
                    : crumb.id === currentFolderId
                      ? "text-primary font-medium"
                      : "text-tertiary hover:text-primary hover:bg-secondary"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverBreadcrumb(crumb.id);
                }}
                onDragLeave={() => setDragOverBreadcrumb(null)}
                onDrop={(e) => handleDropOnBreadcrumb(e, crumb.id)}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            isSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onChange={toggleSelectAll}
            aria-label="Selecionar todos"
          />
        </div>

        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            aria-label="Buscar arquivos"
            icon={SearchMd}
            placeholder="Buscar por nome..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            data-testid="search-input"
          />
        </div>
        
        <Select
          selectedKey={typeFilter}
          onSelectionChange={(key) => {
            if (key) {
              setTypeFilter(key as string);
              setPage(1);
            }
          }}
          placeholder="Tipo"
          placeholderIcon={FilterLines}
          className="w-[140px]"
          aria-label="Filtrar por tipo"
        >
          <Select.Item id="all" label="Todos" />
          <Select.Item id="image" label="Imagem" />
          <Select.Item id="video" label="Vídeo" />
          <Select.Item id="audio" label="Áudio" />
          <Select.Item id="application/pdf" label="PDF" />
        </Select>

        <Select
          selectedKey={tagFilter}
          onSelectionChange={(key) => {
            if (key) {
              setTagFilter(key as string);
              setPage(1);
            }
          }}
          placeholder="Tag"
          placeholderIcon={FilterLines}
          className="w-[140px]"
          aria-label="Filtrar por tag"
        >
          <Select.Item id="all" label="Todas" />
          {(tagsData?.items ?? []).map((tag) => (
            <Select.Item key={tag.id} id={tag.id} label={tag.name} />
          ))}
        </Select>

        <Select
          selectedKey={archivedFilter}
          onSelectionChange={(key) => {
            if (key) {
              setArchivedFilter(key as string);
              setPage(1);
            }
          }}
          placeholder="Status"
          className="w-[140px]"
          aria-label="Filtrar por status"
        >
          <Select.Item id="active" label="Ativos" />
          <Select.Item id="archived" label="Arquivados" />
          <Select.Item id="all" label="Todos" />
        </Select>

        <div className="flex items-center rounded-md border border-secondary" data-testid="view-toggle">
          <Button
            color={viewMode === "grid" ? "secondary" : "tertiary"}
            size="sm"
            iconLeading={Grid01}
            onClick={() => setViewMode("grid")}
            className="rounded-r-none border-0"
          />
          <Button
            color={viewMode === "list" ? "secondary" : "tertiary"}
            size="sm"
            iconLeading={List}
            onClick={() => setViewMode("list")}
            className="rounded-l-none border-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-0"}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className={viewMode === "grid" ? "aspect-square rounded-lg" : "h-16 w-full"}
            />
          ))}
        </div>
      ) : !isSearching && folders.length === 0 && items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-secondary rounded-lg">
          <p className="text-tertiary">
            {currentFolderId ? "Esta pasta está vazia" : "Nenhum arquivo encontrado"}
          </p>
          <p className="text-sm text-tertiary mt-1">
            {currentFolderId ? "Faça upload ou mova arquivos para esta pasta" : "Faça upload de arquivos para começar"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" data-testid="file-grid">
          {!isSearching && folders.map(renderFolderCard)}
          {items.map(renderFileCard)}
        </div>
      ) : (
        <div className="border border-secondary rounded-lg overflow-hidden" data-testid="file-list">
          {!isSearching && folders.map(renderFolderRow)}
          {items.map(renderFileRow)}
        </div>
      )}

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-tertiary">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} arquivos
          </p>
          <div className="flex gap-2">
            <Button
              color="secondary"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              isDisabled={page === 1}
            >
              Anterior
            </Button>
            <Button
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

      {/* Floating Bulk Action Toolbar */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-1 rounded-full bg-gray-900 px-2 py-1.5 shadow-2xl border border-white/10">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <span className="text-sm font-medium text-white whitespace-nowrap">
                  {selectedIds.size} selecionado(s)
                </span>
                <button
                  onClick={clearSelection}
                  className="rounded-full p-0.5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <XClose className="h-3.5 w-3.5 text-white/70 hover:text-white" />
                </button>
              </div>

              <div className="h-6 w-px bg-white/20 mx-1" />

              <button
                onClick={() => {
                  setBulkTagIds([]);
                  setIsBulkTagsOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Tag01 className="h-4 w-4" />
                <span>Tags</span>
              </button>

              <button
                onClick={() => {
                  setBulkCreatorId("");
                  setIsBulkCreatorOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <User01 className="h-4 w-4" />
                <span>Creator</span>
              </button>

              <button
                onClick={() => {
                  setRenamePrefix("");
                  setRenameSuffix("");
                  setIsBulkRenameOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Type01 className="h-4 w-4" />
                <span>Renomear</span>
              </button>

              <button
                onClick={() => {
                  setMoveTargetFolderId(null);
                  setMovePickerFolderId(null);
                  setIsBulkMoveOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Mover</span>
              </button>

              <div className="h-6 w-px bg-white/20 mx-1" />

              <button
                onClick={() => setIsBulkArchiveOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <Trash01 className="h-4 w-4" />
                <span>Arquivar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="truncate pr-8">{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="flex flex-col gap-4 min-h-0 flex-1">
              <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg overflow-hidden bg-secondary">
                {previewFile.mimeType.startsWith("video/") ? (
                  <video
                    key={previewFile.id}
                    src={previewFile.url}
                    controls
                    preload="metadata"
                    className="max-w-full max-h-[65vh] rounded-lg bg-black"
                  />
                ) : previewFile.mimeType.startsWith("image/") ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[65vh] object-contain"
                  />
                ) : previewFile.mimeType.startsWith("audio/") ? (
                  <div className="p-8 flex items-center justify-center w-full">
                    <audio src={previewFile.url} controls className="w-full" />
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center gap-4">
                    <File06 className="h-16 w-16 text-quaternary" />
                    <p className="text-tertiary">Preview não disponível para este tipo de arquivo</p>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center justify-between text-sm text-tertiary">
                <div className="flex items-center gap-3">
                  <span>{getFileTypeLabel(previewFile.mimeType)}</span>
                  <span>{formatFileSize(previewFile.size)}</span>
                  {previewFile.uploadedBy?.name && (
                    <span>por {previewFile.uploadedBy.name}</span>
                  )}
                </div>
                <a
                  href={previewFile.url}
                  download={previewFile.originalName || previewFile.name}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button color="secondary" size="sm" iconLeading={Download01}>
                    Download
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single Edit Dialog */}
      <Dialog open={!!editFile} onOpenChange={(open) => !open && setEditFile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Arquivo</DialogTitle>
          </DialogHeader>
          {editFile && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Nome</label>
                <Input
                  aria-label="Nome"
                  value={editName}
                  onChange={(value) => setEditName(value)}
                />
              </div>

              {editFile.mimeType.startsWith("video/") && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Thumbnail</label>
                  <VideoThumbnailSelector
                    videoUrl={editFile.url}
                    currentThumbnailUrl={editThumbnailUrl}
                    onThumbnailCaptured={handleThumbnailCaptured}
                    isUploading={isThumbnailUploading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {(tagsData?.items ?? []).map((tag) => {
                    const isTagSelected = editTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setEditTagIds((prev) =>
                            isTagSelected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          )
                        }
                        className="cursor-pointer"
                      >
                        <Badge
                          color={isTagSelected ? "brand" : "gray"}
                          type="pill-color"
                          size="md"
                        >
                          {tag.name}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Creator</label>
                <Select
                  selectedKey={editCreatorId || "none"}
                  onSelectionChange={(key) => setEditCreatorId(key === "none" ? "" : (key as string))}
                  placeholder="Selecionar creator"
                  className="w-full"
                  aria-label="Creator"
                >
                  <Select.Item id="none" label="Nenhum" />
                  {(creatorsData?.items ?? []).map((creator) => (
                    <Select.Item key={creator.id} id={creator.id} label={creator.name} />
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Origem</label>
                <Select
                  selectedKey={editOriginId || "none"}
                  onSelectionChange={(key) => setEditOriginId(key === "none" ? "" : (key as string))}
                  placeholder="Selecionar origem"
                  className="w-full"
                  aria-label="Origem"
                >
                  <Select.Item id="none" label="Nenhuma" />
                  {(originsData?.items ?? []).map((origin) => (
                    <Select.Item key={origin.id} id={origin.id} label={origin.name} />
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button color="secondary" onClick={() => setEditFile(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} isDisabled={updateFileMutation.isPending}>
                  {updateFileMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Tags Dialog */}
      <Dialog open={isBulkTagsOpen} onOpenChange={setIsBulkTagsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-tertiary">
              Aplicar para {selectedIds.size} arquivo(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {(tagsData?.items ?? []).map((tag) => {
                const isTagSelected = bulkTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setBulkTagIds((prev) =>
                        isTagSelected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Badge
                      color={isTagSelected ? "brand" : "gray"}
                      type="pill-color"
                      size="md"
                    >
                      {tag.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setIsBulkTagsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  bulkUpdateTagsMutation.mutate({
                    ids: Array.from(selectedIds),
                    tagIds: bulkTagIds,
                  })
                }
                isDisabled={bulkUpdateTagsMutation.isPending}
              >
                {bulkUpdateTagsMutation.isPending ? "Salvando..." : "Aplicar Tags"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Creator Dialog */}
      <Dialog open={isBulkCreatorOpen} onOpenChange={setIsBulkCreatorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Creator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-tertiary">
              Aplicar para {selectedIds.size} arquivo(s)
            </p>
            <Select
              selectedKey={bulkCreatorId || "none"}
              onSelectionChange={(key) => setBulkCreatorId(key === "none" ? "" : (key as string))}
              placeholder="Selecionar creator"
              className="w-full"
              aria-label="Creator"
            >
              <Select.Item id="none" label="Nenhum" />
              {(creatorsData?.items ?? []).map((creator) => (
                <Select.Item key={creator.id} id={creator.id} label={creator.name} />
              ))}
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setIsBulkCreatorOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  bulkUpdateCreatorMutation.mutate({
                    ids: Array.from(selectedIds),
                    creatorId: bulkCreatorId || null,
                  })
                }
                isDisabled={bulkUpdateCreatorMutation.isPending}
              >
                {bulkUpdateCreatorMutation.isPending ? "Salvando..." : "Aplicar Creator"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Rename Dialog */}
      <Dialog open={isBulkRenameOpen} onOpenChange={setIsBulkRenameOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Renomear em Massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-tertiary">
              Renomear {selectedIds.size} arquivo(s)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Prefixo</label>
                <Input
                  aria-label="Prefixo"
                  value={renamePrefix}
                  onChange={(value) => setRenamePrefix(value)}
                  placeholder="ex: foto_"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Sufixo</label>
                <Input
                  aria-label="Sufixo"
                  value={renameSuffix}
                  onChange={(value) => setRenameSuffix(value)}
                  placeholder="ex: _final"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Preview</label>
              <div className="rounded-lg border border-secondary p-3 space-y-1">
                {selectedIdsInOrder.slice(0, 5).map((_, i) => (
                  <p key={i} className="text-sm text-secondary">
                    {renamePrefix}{i + 1}{renameSuffix}
                  </p>
                ))}
                {selectedIdsInOrder.length > 5 && (
                  <p className="text-sm text-tertiary">
                    ... e mais {selectedIdsInOrder.length - 5} arquivo(s)
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setIsBulkRenameOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  bulkRenameMutation.mutate({
                    ids: selectedIdsInOrder,
                    prefix: renamePrefix,
                    suffix: renameSuffix,
                  })
                }
                isDisabled={bulkRenameMutation.isPending}
              >
                {bulkRenameMutation.isPending ? "Renomeando..." : "Renomear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Archive Confirmation Dialog */}
      <Dialog open={isBulkArchiveOpen} onOpenChange={setIsBulkArchiveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Arquivar Arquivos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-tertiary">
              Tem certeza que deseja arquivar {selectedIds.size} arquivo(s)? Eles poderão ser restaurados depois.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setIsBulkArchiveOpen(false)}>
                Cancelar
              </Button>
              <Button
                color="primary-destructive"
                onClick={() =>
                  bulkArchiveMutation.mutate({
                    ids: Array.from(selectedIds),
                  })
                }
                isDisabled={bulkArchiveMutation.isPending}
              >
                {bulkArchiveMutation.isPending ? "Arquivando..." : "Arquivar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Move Dialog */}
      <Dialog open={isBulkMoveOpen} onOpenChange={setIsBulkMoveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mover Arquivos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-tertiary">
              Mover {selectedIds.size} arquivo(s) para:
            </p>

            {/* Move picker breadcrumbs */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => {
                  setMovePickerFolderId(null);
                  setMoveTargetFolderId(null);
                }}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  movePickerFolderId === null ? "text-primary font-medium" : "text-tertiary hover:text-primary hover:bg-secondary"
                }`}
              >
                Raiz
              </button>
              {movePickerBreadcrumbItems.map((crumb) => (
                <div key={crumb.id} className="flex items-center gap-1">
                  <ChevronRight className="h-4 w-4 text-quaternary" />
                  <button
                    onClick={() => {
                      setMovePickerFolderId(crumb.id);
                      setMoveTargetFolderId(crumb.id);
                    }}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      crumb.id === movePickerFolderId ? "text-primary font-medium" : "text-tertiary hover:text-primary hover:bg-secondary"
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Folder list */}
            <div className="border border-secondary rounded-lg max-h-64 overflow-y-auto">
              {movePickerFolderItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-tertiary">
                  Nenhuma subpasta aqui
                </div>
              ) : (
                movePickerFolderItems.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setMovePickerFolderId(folder.id);
                      setMoveTargetFolderId(folder.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-secondary last:border-b-0 transition-colors cursor-pointer text-left ${
                      moveTargetFolderId === folder.id ? "bg-brand-primary/5" : "hover:bg-secondary/50"
                    }`}
                  >
                    <Folder className="h-5 w-5 text-brand-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{folder.name}</p>
                      <p className="text-xs text-tertiary">
                        {folder._count.files} arquivo{folder._count.files !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-quaternary flex-shrink-0" />
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setIsBulkMoveOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  moveFilesMutation.mutate({
                    fileIds: Array.from(selectedIds),
                    folderId: moveTargetFolderId,
                  });
                }}
                isDisabled={moveFilesMutation.isPending}
              >
                {moveFilesMutation.isPending ? "Movendo..." : `Mover para ${moveTargetFolderId ? "pasta" : "raiz"}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Nome da pasta</label>
              <Input
                aria-label="Nome da pasta"
                value={newFolderName}
                onChange={(value) => setNewFolderName(value)}
                placeholder="ex: Referências"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setIsCreateFolderOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  createFolderMutation.mutate({
                    name: newFolderName,
                    parentId: currentFolderId,
                  })
                }
                isDisabled={!newFolderName.trim() || createFolderMutation.isPending}
              >
                {createFolderMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={!!editFolder} onOpenChange={(open) => !open && setEditFolder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Nome</label>
              <Input
                aria-label="Nome da pasta"
                value={editFolderName}
                onChange={(value) => setEditFolderName(value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setEditFolder(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (editFolder) {
                    renameFolderMutation.mutate({ id: editFolder.id, name: editFolderName });
                  }
                }}
                isDisabled={!editFolderName.trim() || renameFolderMutation.isPending}
              >
                {renameFolderMutation.isPending ? "Renomeando..." : "Renomear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={!!deleteFolderConfirm} onOpenChange={(open) => !open && setDeleteFolderConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-tertiary">
              Tem certeza que deseja excluir a pasta &ldquo;{deleteFolderConfirm?.name}&rdquo;? Os arquivos dentro dela serão movidos para a pasta pai.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="secondary" onClick={() => setDeleteFolderConfirm(null)}>
                Cancelar
              </Button>
              <Button
                color="primary-destructive"
                onClick={() => {
                  if (deleteFolderConfirm) {
                    deleteFolderMutation.mutate({ id: deleteFolderConfirm.id });
                  }
                }}
                isDisabled={deleteFolderMutation.isPending}
              >
                {deleteFolderMutation.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload de Arquivos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FileUpload.Root>
              <FileUpload.DropZone
                hint="Imagens, PDFs (máx. 50MB) | Vídeos (máx. 500MB)"
                accept="image/*,video/*,audio/*,application/pdf"
                maxSize={500 * 1024 * 1024}
                onDropFiles={handleFilesDropped}
                onSizeLimitExceed={() => toast.error("Arquivo muito grande. Máximo: 500MB para vídeos")}
              />
            </FileUpload.Root>

            <div className="flex justify-end">
              <Button color="secondary" onClick={() => setIsUploadOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
