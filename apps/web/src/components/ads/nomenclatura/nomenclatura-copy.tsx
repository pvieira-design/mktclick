"use client";

import { toast } from "sonner";
import { Copy01 } from "@untitledui/icons";

interface NomenclaturaCopyProps {
  deliverable: any;
}

export function NomenclaturaCopy({ deliverable }: NomenclaturaCopyProps) {
  const nomenclatura =
    deliverable.nomenclaturaEditada || deliverable.nomenclaturaGerada;

  if (!nomenclatura) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(nomenclatura);
    toast.success("Nomenclatura copiada!");
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar nomenclatura"
      className="flex h-7 w-7 items-center justify-center rounded-md text-tertiary hover:bg-secondary hover:text-primary transition-colors"
    >
      <Copy01 className="h-3.5 w-3.5" />
    </button>
  );
}
