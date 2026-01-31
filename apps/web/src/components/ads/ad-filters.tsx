"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { SearchMd } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";

interface FilterAccount {
  id: number;
  label: string;
}

export interface AdsFilters {
  dateFrom: string;
  dateTo: string;
  accountId: number | undefined;
  campaignName: string | undefined;
  adsetName: string | undefined;
  adNameSearch: string | undefined;
}

interface AdFiltersProps {
  filters: AdsFilters;
  onFiltersChange: (update: Partial<AdsFilters>) => void;
  filterOptions:
    | {
        accounts: FilterAccount[];
        campaigns: string[];
        adsets: string[];
        dateRange: { minDate: string | null; maxDate: string | null };
      }
    | undefined;
  isLoadingOptions: boolean;
}

export function AdFilters({
  filters,
  onFiltersChange,
  filterOptions,
  isLoadingOptions,
}: AdFiltersProps) {
  const [searchLocal, setSearchLocal] = useState(filters.adNameSearch ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchLocal || undefined;
      if (value !== filters.adNameSearch) {
        onFiltersChange({ adNameSearch: value });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchLocal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSearchLocal(filters.adNameSearch ?? "");
  }, [filters.adNameSearch]);

  const dateRangeValue = useMemo(() => {
    if (!filters.dateFrom || !filters.dateTo) return null;
    return {
      start: parseDate(filters.dateFrom),
      end: parseDate(filters.dateTo),
    };
  }, [filters.dateFrom, filters.dateTo]);

  const handleDateRangeChange = useCallback(
    (range: { start: DateValue; end: DateValue } | null) => {
      if (!range) {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0]!;
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]!;
        onFiltersChange({ dateFrom: weekAgo, dateTo: todayStr });
        return;
      }
      const startDate = range.start.toDate(getLocalTimeZone());
      const endDate = range.end.toDate(getLocalTimeZone());
      onFiltersChange({
        dateFrom: startDate.toISOString().split("T")[0],
        dateTo: endDate.toISOString().split("T")[0],
      });
    },
    [onFiltersChange]
  );

  const handleClear = useCallback(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]!;
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]!;
    setSearchLocal("");
    onFiltersChange({
      dateFrom: weekAgo,
      dateTo: todayStr,
      accountId: undefined,
      campaignName: undefined,
      adsetName: undefined,
      adNameSearch: undefined,
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.accountId !== undefined ||
    filters.campaignName !== undefined ||
    filters.adsetName !== undefined ||
    !!filters.adNameSearch;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-secondary">Período</label>
        <DateRangePicker
          value={dateRangeValue}
          onChange={handleDateRangeChange}
          onApply={() => {}}
          onCancel={() => handleDateRangeChange(null)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-secondary">Conta</label>
        <Select
          selectedKey={
            filters.accountId !== undefined
              ? String(filters.accountId)
              : "all"
          }
          onSelectionChange={(key) => {
            if (key) {
              const value = key === "all" ? undefined : Number(key);
              onFiltersChange({
                accountId: value,
                campaignName: undefined,
                adsetName: undefined,
              });
            }
          }}
          placeholder="Todas as contas"
          className="w-[180px]"
          aria-label="Conta"
          isDisabled={isLoadingOptions}
        >
          <Select.Item id="all" label="Todas as contas" />
          {(filterOptions?.accounts ?? []).map((acc) => (
            <Select.Item
              key={String(acc.id)}
              id={String(acc.id)}
              label={acc.label}
            />
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-secondary">Campanha</label>
        <Select
          selectedKey={filters.campaignName ?? "all"}
          onSelectionChange={(key) => {
            if (key) {
              const value = key === "all" ? undefined : (key as string);
              onFiltersChange({
                campaignName: value,
                adsetName: undefined,
              });
            }
          }}
          placeholder="Todas as campanhas"
          className="w-[220px]"
          aria-label="Campanha"
          isDisabled={
            isLoadingOptions ||
            (filterOptions?.campaigns ?? []).length === 0
          }
        >
          <Select.Item id="all" label="Todas as campanhas" />
          {(filterOptions?.campaigns ?? []).map((name) => (
            <Select.Item key={name} id={name} label={name} />
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-secondary">
          Conjunto de Anúncios
        </label>
        <Select
          selectedKey={filters.adsetName ?? "all"}
          onSelectionChange={(key) => {
            if (key) {
              const value = key === "all" ? undefined : (key as string);
              onFiltersChange({ adsetName: value });
            }
          }}
          placeholder="Todos os conjuntos"
          className="w-[220px]"
          aria-label="Conjunto de Anúncios"
          isDisabled={
            isLoadingOptions ||
            (filterOptions?.adsets ?? []).length === 0
          }
        >
          <Select.Item id="all" label="Todos os conjuntos" />
          {(filterOptions?.adsets ?? []).map((name) => (
            <Select.Item key={name} id={name} label={name} />
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-secondary">Busca</label>
        <div className="w-[200px]">
          <Input
            aria-label="Buscar anúncio"
            icon={SearchMd}
            placeholder="Buscar anúncio..."
            value={searchLocal}
            onChange={(value) => setSearchLocal(value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="h-10 px-3 text-sm text-brand-primary hover:underline cursor-pointer"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
