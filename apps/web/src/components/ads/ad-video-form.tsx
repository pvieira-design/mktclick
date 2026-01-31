"use client";

import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { Trash01 } from "@untitledui/icons";
import { TEMA_LABELS, ESTILO_LABELS, FORMATO_LABELS } from "@/components/ads/ad-constants";

export interface VideoFormData {
  nomeDescritivo: string;
  tema: string;
  estilo: string;
  formato: string;
}

interface AdVideoFormProps {
  index: number;
  video: VideoFormData;
  onChange: (index: number, video: VideoFormData) => void;
  onRemove: (index: number) => void;
  errors?: Partial<Record<keyof VideoFormData, string>>;
}

export function AdVideoForm({ index, video, onChange, onRemove, errors }: AdVideoFormProps) {
  const handleNomeChange = (value: string) => {
    const sanitized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 25);
    onChange(index, { ...video, nomeDescritivo: sanitized });
  };

  const handleSelectChange = (field: keyof VideoFormData) => (value: string | number | null) => {
    if (value) {
      onChange(index, { ...video, [field]: String(value) });
    }
  };

  return (
    <div className="rounded-lg ring-1 ring-border-secondary p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary">Video #{index + 1}</h4>
        <Button
          color="tertiary"
          size="sm"
          iconLeading={Trash01}
          onClick={() => onRemove(index)}
        />
      </div>

      <div className="space-y-3">
        <div>
          <Input
            label="Nome Descritivo"
            placeholder="Ex: ROTINACBDMUDOU"
            value={video.nomeDescritivo}
            onChange={handleNomeChange}
            size="md"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-quaternary">
              Apenas letras maiusculas e numeros
            </p>
            <p className="text-xs text-quaternary">
              {video.nomeDescritivo.length}/25
            </p>
          </div>
          {errors?.nomeDescritivo && (
            <p className="text-xs text-error-primary mt-1">{errors.nomeDescritivo}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Tema"
            aria-label="Tema do video"
            selectedKey={video.tema || undefined}
            onSelectionChange={handleSelectChange("tema")}
            placeholder="Selecione"
          >
            {Object.entries(TEMA_LABELS).map(([key, label]) => (
              <Select.Item key={key} id={key} label={label} />
            ))}
          </Select>

          <Select
            label="Estilo"
            aria-label="Estilo do video"
            selectedKey={video.estilo || undefined}
            onSelectionChange={handleSelectChange("estilo")}
            placeholder="Selecione"
          >
            {Object.entries(ESTILO_LABELS).map(([key, label]) => (
              <Select.Item key={key} id={key} label={label} />
            ))}
          </Select>

          <Select
            label="Formato"
            aria-label="Formato do video"
            selectedKey={video.formato || undefined}
            onSelectionChange={handleSelectChange("formato")}
            placeholder="Selecione"
          >
            {Object.entries(FORMATO_LABELS).map(([key, label]) => (
              <Select.Item key={key} id={key} label={label} />
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
