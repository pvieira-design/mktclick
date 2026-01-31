"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SearchMd } from "@untitledui/icons";

type AdProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

const STATUS_LABELS: Record<AdProjectStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  COMPLETED: "Concluido",
  CANCELLED: "Cancelado",
};

interface AdProjectFiltersProps {
  filters: {
    status?: string;
    search?: string;
  };
  onChange: (filters: AdProjectFiltersProps["filters"]) => void;
}

export function AdProjectFilters({ filters, onChange }: AdProjectFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onChange({ ...filters, search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onChange]);

  const handleStatusChange = (value: string | number | null) => {
    if (!value) return;
    const valueStr = String(value);
    onChange({
      ...filters,
      status: valueStr === "ALL" ? undefined : valueStr,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 max-w-sm">
        <Input
          icon={SearchMd}
          placeholder="Buscar por titulo..."
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          size="md"
        />
      </div>
      <Select
        aria-label="Filtrar por status"
        selectedKey={filters.status || "ALL"}
        onSelectionChange={handleStatusChange}
        placeholder="Todos os status"
        className="w-[180px]"
      >
        <Select.Item id="ALL" label="Todos" />
        <Select.Item id="DRAFT" label="Rascunho" />
        <Select.Item id="ACTIVE" label="Ativo" />
        <Select.Item id="COMPLETED" label="Concluido" />
        <Select.Item id="CANCELLED" label="Cancelado" />
      </Select>
    </div>
  );
}
