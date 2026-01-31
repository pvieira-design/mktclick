"use client";

import { useEffect, useState } from "react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { useContentTypes } from "@/hooks/use-metadata";
import { SearchMd, FilterLines } from "@untitledui/icons";

type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

interface DateRange {
  start: DateValue;
  end: DateValue;
}

interface RequestFiltersProps {
  filters: {
    status?: RequestStatus;
    contentType?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onChange: (filters: RequestFiltersProps["filters"]) => void;
}

export function RequestFilters({ filters, onChange }: RequestFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const { data: contentTypes } = useContentTypes();

  const dateRange: DateRange | null =
    filters.dateFrom && filters.dateTo
      ? {
          start: parseDate(filters.dateFrom),
          end: parseDate(filters.dateTo),
        }
      : null;

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
    const newStatus = valueStr === "ALL" ? undefined : (valueStr as RequestStatus);
    onChange({ ...filters, status: newStatus });
  };

  const handleContentTypeChange = (value: string | number | null) => {
    if (!value) return;
    const valueStr = String(value);
    const newType = valueStr === "ALL" ? undefined : valueStr;
    onChange({ ...filters, contentType: newType });
  };

  const handleDateRangeChange = (range: { start: DateValue; end: DateValue } | null) => {
    if (!range) {
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined });
      return;
    }

    const startDate = range.start.toDate(getLocalTimeZone());
    const endDate = range.end.toDate(getLocalTimeZone());

    onChange({
      ...filters,
      dateFrom: startDate.toISOString().split("T")[0],
      dateTo: endDate.toISOString().split("T")[0],
    });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex-1 max-w-sm">
        <Input
          icon={SearchMd}
          placeholder="Buscar por título..."
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          size="md"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          aria-label="Filtrar por status"
          selectedKey={filters.status || "ALL"}
          onSelectionChange={handleStatusChange}
          placeholder="Status"
          placeholderIcon={FilterLines}
          className="w-[160px]"
        >
          <Select.Item id="ALL" label="Todos" />
          <Select.Item id="DRAFT" label="Rascunho" />
          <Select.Item id="PENDING" label="Pendente" />
          <Select.Item id="IN_REVIEW" label="Em Revisão" />
          <Select.Item id="APPROVED" label="Aprovado" />
          <Select.Item id="REJECTED" label="Rejeitado" />
          <Select.Item id="CANCELLED" label="Cancelado" />
        </Select>

        <Select
          aria-label="Filtrar por tipo de conteúdo"
          selectedKey={filters.contentType || "ALL"}
          onSelectionChange={handleContentTypeChange}
          placeholder="Tipo"
          placeholderIcon={FilterLines}
          className="w-[160px]"
        >
          <Select.Item id="ALL" label="Todos" />
          {contentTypes.map((type) => (
            <Select.Item key={type.id} id={type.id} label={type.name} />
          ))}
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          onApply={() => {}}
          onCancel={() => handleDateRangeChange(null)}
        />
      </div>
    </div>
  );
}
