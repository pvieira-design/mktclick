"use client";

import { useEffect, useState } from "react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useContentTypes, useAreas } from "@/hooks/use-metadata";
import { SearchMd, FilterLines, XClose, X } from "@untitledui/icons";

type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

const STATUS_LABELS: Record<RequestStatus, string> = {
  DRAFT: "Rascunho",
  PENDING: "Pendente",
  IN_REVIEW: "Em Revisão",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
};

interface DateRange {
  start: DateValue;
  end: DateValue;
}

interface RequestFiltersProps {
  filters: {
    status?: RequestStatus;
    contentType?: string;
    areaId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onChange: (filters: RequestFiltersProps["filters"]) => void;
}

export function RequestFilters({ filters, onChange }: RequestFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const { data: contentTypes } = useContentTypes();
  const { data: areas } = useAreas();

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onChange({ ...filters, search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onChange]);

  const activeFilterCount = [
    filters.status,
    filters.contentType,
    filters.areaId,
    filters.dateFrom,
  ].filter(Boolean).length;

  const localDateRange: DateRange | null =
    localFilters.dateFrom && localFilters.dateTo
      ? {
          start: parseDate(localFilters.dateFrom),
          end: parseDate(localFilters.dateTo),
        }
      : null;

  const handleApply = () => {
    onChange({ ...localFilters, search: filters.search });
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared = { search: filters.search };
    onChange(cleared);
    setLocalFilters({});
    setIsOpen(false);
  };

  const handleLocalStatusChange = (value: string | number | null) => {
    if (!value) return;
    const valueStr = String(value);
    setLocalFilters({
      ...localFilters,
      status: valueStr === "ALL" ? undefined : (valueStr as RequestStatus),
    });
  };

  const handleLocalContentTypeChange = (value: string | number | null) => {
    if (!value) return;
    const valueStr = String(value);
    setLocalFilters({
      ...localFilters,
      contentType: valueStr === "ALL" ? undefined : valueStr,
    });
  };

  const handleLocalAreaChange = (value: string | number | null) => {
    if (!value) return;
    const valueStr = String(value);
    setLocalFilters({
      ...localFilters,
      areaId: valueStr === "ALL" ? undefined : valueStr,
    });
  };

  const handleLocalDateRangeChange = (
    range: { start: DateValue; end: DateValue } | null
  ) => {
    if (!range) {
      setLocalFilters({ ...localFilters, dateFrom: undefined, dateTo: undefined });
      return;
    }

    const startDate = range.start.toDate(getLocalTimeZone());
    const endDate = range.end.toDate(getLocalTimeZone());

    setLocalFilters({
      ...localFilters,
      dateFrom: startDate.toISOString().split("T")[0],
      dateTo: endDate.toISOString().split("T")[0],
    });
  };

  const removeFilter = (key: "status" | "contentType" | "areaId" | "date") => {
    if (key === "date") {
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined });
    } else {
      onChange({ ...filters, [key]: undefined });
    }
  };

  const contentTypeName = filters.contentType
    ? contentTypes.find((ct) => ct.id === filters.contentType)?.name
    : null;

  const areaName = filters.areaId
    ? areas.find((a) => a.id === filters.areaId)?.name
    : null;

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            icon={SearchMd}
            placeholder="Buscar por título..."
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
            size="md"
          />
        </div>

        <div className="relative">
          <Button
            color="secondary"
            iconLeading={FilterLines}
            onClick={() => setIsOpen(true)}
          >
            Filtros
          </Button>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-solid text-white text-xs font-semibold px-1">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-tertiary font-medium">Filtros ativos:</span>

          {filters.status && (
            <button
              type="button"
              onClick={() => removeFilter("status")}
              className="inline-flex items-center gap-1 rounded-full bg-utility-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-primary ring-1 ring-inset ring-brand-primary/20 hover:bg-utility-brand-100 transition-colors cursor-pointer"
            >
              {STATUS_LABELS[filters.status]}
              <XClose className="h-3 w-3" />
            </button>
          )}

          {filters.contentType && contentTypeName && (
            <button
              type="button"
              onClick={() => removeFilter("contentType")}
              className="inline-flex items-center gap-1 rounded-full bg-utility-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-primary ring-1 ring-inset ring-brand-primary/20 hover:bg-utility-brand-100 transition-colors cursor-pointer"
            >
              {contentTypeName}
              <XClose className="h-3 w-3" />
            </button>
          )}

          {filters.areaId && areaName && (
            <button
              type="button"
              onClick={() => removeFilter("areaId")}
              className="inline-flex items-center gap-1 rounded-full bg-utility-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-primary ring-1 ring-inset ring-brand-primary/20 hover:bg-utility-brand-100 transition-colors cursor-pointer"
            >
              {areaName}
              <XClose className="h-3 w-3" />
            </button>
          )}

          {filters.dateFrom && filters.dateTo && (
            <button
              type="button"
              onClick={() => removeFilter("date")}
              className="inline-flex items-center gap-1 rounded-full bg-utility-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-primary ring-1 ring-inset ring-brand-primary/20 hover:bg-utility-brand-100 transition-colors cursor-pointer"
            >
              {filters.dateFrom} → {filters.dateTo}
              <XClose className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <SlideoutMenu isOpen={isOpen} onOpenChange={setIsOpen}>
        {({ close }) => (
          <>
            <div className="relative z-1 flex items-start justify-between w-full px-4 pt-6 md:px-6">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={close}
                  className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                  aria-label="Fechar"
                >
                  <FeaturedIcon icon={X} theme="light" color="gray" size="md" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    Filtros
                  </h2>
                  <p className="text-sm text-tertiary mt-1">
                    Refine a lista de requests.
                  </p>
                </div>
              </div>
            </div>

            <SlideoutMenu.Content>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Select
                    label="Status"
                    aria-label="Filtrar por status"
                    selectedKey={localFilters.status || "ALL"}
                    onSelectionChange={handleLocalStatusChange}
                    placeholder="Todos os status"
                  >
                    <Select.Item id="ALL" label="Todos" />
                    <Select.Item id="DRAFT" label="Rascunho" />
                    <Select.Item id="PENDING" label="Pendente" />
                    <Select.Item id="IN_REVIEW" label="Em Revisão" />
                    <Select.Item id="APPROVED" label="Aprovado" />
                    <Select.Item id="REJECTED" label="Rejeitado" />
                    <Select.Item id="CANCELLED" label="Cancelado" />
                  </Select>
                </div>

                <div className="space-y-2">
                  <Select
                    label="Tipo de Conteúdo"
                    aria-label="Filtrar por tipo de conteúdo"
                    selectedKey={localFilters.contentType || "ALL"}
                    onSelectionChange={handleLocalContentTypeChange}
                    placeholder="Todos os tipos"
                  >
                    <Select.Item id="ALL" label="Todos" />
                    {contentTypes.map((type) => (
                      <Select.Item key={type.id} id={type.id} label={type.name} />
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Select
                    label="Área"
                    aria-label="Filtrar por área"
                    selectedKey={localFilters.areaId || "ALL"}
                    onSelectionChange={handleLocalAreaChange}
                    placeholder="Todas as áreas"
                  >
                    <Select.Item id="ALL" label="Todas" />
                    {areas.map((area) => (
                      <Select.Item key={area.id} id={area.id} label={area.name} />
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">
                    Período
                  </label>
                  <DateRangePicker
                    value={localDateRange}
                    onChange={handleLocalDateRangeChange}
                    onApply={() => {}}
                    onCancel={() => handleLocalDateRangeChange(null)}
                  />
                </div>
              </div>
            </SlideoutMenu.Content>

            <SlideoutMenu.Footer className="flex items-center justify-between gap-3">
              <Button type="button" color="tertiary" onClick={handleClear}>
                Limpar Filtros
              </Button>
              <div className="flex items-center gap-3">
                <Button type="button" color="secondary" onClick={close}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  color="primary"
                  onClick={handleApply}
                  iconLeading={FilterLines}
                >
                  Aplicar
                </Button>
              </div>
            </SlideoutMenu.Footer>
          </>
        )}
      </SlideoutMenu>
    </>
  );
}
