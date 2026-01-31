"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Plus, Trash01 } from "@untitledui/icons";
import { getLocalTimeZone, parseDate, CalendarDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

const creatorTypeLabels: Record<string, string> = {
  UGC_CREATOR: "UGC Creator",
  EMBAIXADOR: "Embaixador",
  ATLETA: "Atleta",
  INFLUENCIADOR: "Influenciador",
  ATOR_MODELO: "Ator/Modelo",
};

export interface CreatorParticipation {
  id?: string;
  creatorId: string;
  participationDate: Date;
  location?: string;
  valuePaid: number;
  notes?: string;
}

interface CreatorParticipationSectionProps {
  participations: CreatorParticipation[];
  onChange: (participations: CreatorParticipation[]) => void;
  disabled?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function dateToDateValue(date: Date): DateValue {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function dateValueToDate(dateValue: DateValue): Date {
  return dateValue.toDate(getLocalTimeZone());
}

export function CreatorParticipationSection({
  participations,
  onChange,
  disabled = false,
}: CreatorParticipationSectionProps) {
  const { data: creatorsData, isLoading: loadingCreators } = useQuery(
    trpc.creator.list.queryOptions({ limit: 100, isActive: true })
  );

  const creators = creatorsData?.items ?? [];

  const handleAddParticipation = () => {
    const newParticipation: CreatorParticipation = {
      creatorId: "",
      participationDate: new Date(),
      location: "",
      valuePaid: 0,
      notes: "",
    };
    onChange([...participations, newParticipation]);
  };

  const handleRemoveParticipation = (index: number) => {
    const updated = participations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateParticipation = (
    index: number,
    field: keyof CreatorParticipation,
    value: any
  ) => {
    const updated = participations.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  const getCreatorName = (creatorId: string): string => {
    const creator = creators.find((c) => c.id === creatorId);
    return creator ? `${creator.name} (${creatorTypeLabels[creator.type] || creator.type})` : "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Participações de Criadores</h3>
        <Button
          type="button"
          color="secondary"
          size="sm"
          onClick={handleAddParticipation}
          isDisabled={disabled || loadingCreators}
          iconLeading={Plus}
        >
          Adicionar Criador
        </Button>
      </div>

      {participations.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          Nenhum criador adicionado. Clique em &quot;Adicionar Criador&quot; para incluir participações.
        </p>
      ) : (
        <div className="space-y-4">
          {participations.map((participation, index) => (
            <div
              key={participation.id || index}
              className="p-4 border rounded-lg bg-muted/30 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Criador *"
                    selectedKey={participation.creatorId || null}
                    onSelectionChange={(key) =>
                      handleUpdateParticipation(index, "creatorId", key as string)
                    }
                    isDisabled={disabled || loadingCreators}
                    placeholder={loadingCreators ? "Carregando..." : "Selecione o criador"}
                  >
                    {creators.map((creator) => (
                      <Select.Item
                        key={creator.id}
                        id={creator.id}
                        label={`${creator.name} (${creatorTypeLabels[creator.type] || creator.type})`}
                      />
                    ))}
                  </Select>

                  <div>
                    <label className="text-sm font-medium text-secondary mb-1.5 block">
                      Data da Diária *
                    </label>
                    <DatePicker
                      aria-label="Data da Diária"
                      value={dateToDateValue(participation.participationDate)}
                      onChange={(dateValue) => {
                        if (dateValue) {
                          handleUpdateParticipation(
                            index,
                            "participationDate",
                            dateValueToDate(dateValue)
                          );
                        }
                      }}
                      isDisabled={disabled}
                    />
                  </div>

                  <Input
                    label="Local"
                    value={participation.location || ""}
                    onChange={(value) =>
                      handleUpdateParticipation(index, "location", value)
                    }
                    placeholder="Ex: Estúdio SP, Praia de Copacabana..."
                    isDisabled={disabled}
                  />

                  <Input
                    label="Valor Pago (R$) *"
                    type="number"
                    value={participation.valuePaid.toString()}
                    onChange={(value) =>
                      handleUpdateParticipation(index, "valuePaid", parseFloat(value) || 0)
                    }
                    placeholder="0.00"
                    isDisabled={disabled}
                  />
                </div>

                <Button
                  type="button"
                  color="tertiary-destructive"
                  size="sm"
                  onClick={() => handleRemoveParticipation(index)}
                  isDisabled={disabled}
                  iconLeading={Trash01}
                />
              </div>

              {participation.creatorId && (
                <div className="text-xs text-muted-foreground">
                  {getCreatorName(participation.creatorId)} • {formatCurrency(participation.valuePaid)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {participations.length > 0 && (
        <div className="flex justify-end pt-2 border-t">
          <p className="text-sm font-medium">
            Total: {formatCurrency(participations.reduce((sum, p) => sum + p.valuePaid, 0))}
          </p>
        </div>
      )}
    </div>
  );
}

export default CreatorParticipationSection;
