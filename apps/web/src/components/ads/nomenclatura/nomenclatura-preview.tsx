"use client";

interface NomenclaturaPreviewProps {
  nomenclatura: string;
}

const PART_COLORS = [
  "text-brand-primary",
  "text-tertiary",
  "text-success-primary",
  "text-warning-primary",
  "text-error-primary",
  "text-brand-primary",
  "text-tertiary",
  "text-success-primary",
  "text-warning-primary",
  "text-error-primary",
];

const PART_LABELS = [
  "AD#",
  "Data",
  "Origin",
  "Creator",
  "Nome",
  "Tema",
  "Estilo",
  "Formato",
  "Tempo",
  "Tamanho",
];

export function NomenclaturaPreview({
  nomenclatura,
}: NomenclaturaPreviewProps) {
  if (!nomenclatura) return null;

  const parts = nomenclatura.split("_");

  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-secondary p-3 font-mono text-xs break-all">
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && <span className="text-quaternary">_</span>}
            <span
              className={PART_COLORS[i] || "text-primary"}
              title={PART_LABELS[i] || `Part ${i + 1}`}
            >
              {part}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {parts.slice(0, Math.min(parts.length, PART_LABELS.length)).map((part, i) => (
          <span key={i} className="text-[10px] text-quaternary">
            <span className={PART_COLORS[i] || "text-primary"}>{part}</span>
            {" = "}
            {PART_LABELS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
