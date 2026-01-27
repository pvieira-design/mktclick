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
import { useContentTypes } from "@/hooks/use-metadata";

type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

interface RequestFiltersProps {
  filters: {
    status?: RequestStatus;
    contentType?: string;
    search?: string;
  };
  onChange: (filters: RequestFiltersProps["filters"]) => void;
}

export function RequestFilters({ filters, onChange }: RequestFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const { data: contentTypes } = useContentTypes();

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
    const newType = value === "ALL" ? undefined : value;
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
            {contentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
