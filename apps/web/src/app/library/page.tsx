"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@untitledui/icons";

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  description: string | null;
  url: string;
  size: number;
  mimeType: string;
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
    };
  }>;
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

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [archivedFilter, setArchivedFilter] = useState<string>("active");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: tagsData } = useQuery(trpc.fileTag.list.queryOptions());

  const { data, isLoading } = useQuery(
    trpc.file.list.queryOptions({
      search: search || undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      tagId: tagFilter !== "all" ? tagFilter : undefined,
      isArchived: archivedFilter === "all" ? undefined : archivedFilter === "archived",
      page,
      limit,
    })
  );

  const renderFileCard = (file: FileItem) => {
    const Icon = getFileTypeIcon(file.mimeType);
    const isImage = file.mimeType.startsWith("image/");

    return (
      <div
        key={file.id}
        className="group relative flex flex-col overflow-hidden rounded-lg border border-secondary bg-primary hover:border-brand-primary transition-colors"
      >
        <div className="relative aspect-square bg-secondary flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover"
            />
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

    return (
      <div
        key={file.id}
        className="flex items-center gap-4 p-4 border-b border-secondary hover:bg-secondary/50 transition-colors"
      >
        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={file.url}
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Biblioteca</h1>
          <p className="text-tertiary">
            Gerencie arquivos e referências visuais.
          </p>
        </div>
        <Button iconLeading={Plus}>
          Upload
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
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
      ) : (data?.items ?? []).length === 0 ? (
        <div className="text-center py-12 border border-dashed border-secondary rounded-lg">
          <p className="text-tertiary">Nenhum arquivo encontrado</p>
          <p className="text-sm text-tertiary mt-1">
            Faça upload de arquivos para começar
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" data-testid="file-grid">
          {(data?.items as FileItem[]).map(renderFileCard)}
        </div>
      ) : (
        <div className="border border-secondary rounded-lg overflow-hidden" data-testid="file-list">
          {(data?.items as FileItem[]).map(renderFileRow)}
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
    </div>
  );
}
