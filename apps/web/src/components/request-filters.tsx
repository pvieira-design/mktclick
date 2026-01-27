"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type ContentType =
  | "VIDEO_UGC"
  | "VIDEO_INSTITUCIONAL"
  | "CARROSSEL"
  | "POST_UNICO"
  | "STORIES"
  | "REELS";

interface RequestFiltersProps {
  filters: {
    status?: RequestStatus;
    contentType?: ContentType;
    search?: string;
  };
  onChange: (filters: RequestFiltersProps["filters"]) => void;
}

export function RequestFilters({ filters, onChange }: RequestFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onChange({ ...filters, search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onChange]);

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    const newStatus = value === "ALL" ? undefined : (value as RequestStatus);
    onChange({ ...filters, status: newStatus });
  };

  const handleContentTypeChange = (value: string | null) => {
    if (!value) return;
    const newType = value === "ALL" ? undefined : (value as ContentType);
    onChange({ ...filters, contentType: newType });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Buscar por título..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="w-full md:w-1/3">
        <Select
          value={filters.status || "ALL"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="IN_REVIEW">Em Revisão</SelectItem>
            <SelectItem value="APPROVED">Aprovado</SelectItem>
            <SelectItem value="REJECTED">Rejeitado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-1/3">
        <Select
          value={filters.contentType || "ALL"}
          onValueChange={handleContentTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="VIDEO_UGC">Vídeo UGC</SelectItem>
            <SelectItem value="VIDEO_INSTITUCIONAL">
              Vídeo Institucional
            </SelectItem>
            <SelectItem value="CARROSSEL">Carrossel</SelectItem>
            <SelectItem value="POST_UNICO">Post Único</SelectItem>
            <SelectItem value="STORIES">Stories</SelectItem>
            <SelectItem value="REELS">Reels</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
