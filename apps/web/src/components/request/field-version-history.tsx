"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Loader2 } from "lucide-react";

interface FieldVersionHistoryProps {
  requestId: string;
  fieldId: string;
  fieldLabel: string;
}

export function FieldVersionHistory({
  requestId,
  fieldId,
  fieldLabel,
}: FieldVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: versions, isLoading } = useQuery<any[]>({
    ...(trpc.request.getFieldVersions.queryOptions as any)(
      { requestId, fieldId },
    ),
    enabled: isOpen,
  });

  const hasVersions = versions && versions.length > 0;

  return (
    <>
      <Button
        size="sm"
        color="tertiary"
        className="h-6 w-6 p-0"
        title="Ver histórico de alterações"
        onClick={() => setIsOpen(true)}
      >
        <Clock className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico - {fieldLabel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !hasVersions ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma alteração registrada
              </p>
            ) : (
              <div className="space-y-3">
                {versions?.slice(0, 10).map((version: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm space-y-1 pb-2 border-b last:border-0"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{version.changedBy?.name || "Usuário"}</span>
                      <span>
                        {new Date(version.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground line-through truncate">
                        {formatValue(version.oldValue)}
                      </div>
                      <div className="text-primary truncate">
                        {formatValue(version.newValue)}
                      </div>
                    </div>
                  </div>
                ))}
                {versions && versions.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{versions.length - 10} alterações anteriores
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "(vazio)";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "string") {
    if (value.length > 50) return value.substring(0, 50) + "...";
    return value;
  }
  return String(value);
}
