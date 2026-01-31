"use client";

import { Upload01 } from "@untitledui/icons";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/lib/utils/cx";

export interface UploadProgressToastProps {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  currentProgress: number;
  currentFileName: string;
}

export function UploadProgressToast({
  totalFiles,
  completedFiles,
  failedFiles,
  currentProgress,
  currentFileName,
}: UploadProgressToastProps) {
  const isSingular = totalFiles === 1;
  const isComplete = completedFiles + failedFiles >= totalFiles;
  
  const overallProgress = Math.round(
    ((completedFiles + currentProgress / 100) / totalFiles) * 100
  );

  const headerText = isComplete
    ? failedFiles > 0
      ? "Upload concluído com erros"
      : isSingular
        ? "Arquivo enviado!"
        : "Arquivos enviados!"
    : isSingular
      ? "Enviando arquivo..."
      : "Enviando arquivos...";

  const getProgressText = () => {
    if (isComplete) {
      if (failedFiles > 0 && completedFiles > 0) {
        return `${completedFiles} enviado${completedFiles > 1 ? "s" : ""}, ${failedFiles} ${failedFiles > 1 ? "falharam" : "falhou"}`;
      }
      if (failedFiles > 0) {
        return `${failedFiles} arquivo${failedFiles > 1 ? "s" : ""} ${failedFiles > 1 ? "falharam" : "falhou"}`;
      }
      return `${completedFiles} de ${totalFiles} arquivo${totalFiles > 1 ? "s" : ""} enviado${completedFiles > 1 ? "s" : ""}`;
    }
    return `${completedFiles} de ${totalFiles} arquivo${totalFiles > 1 ? "s" : ""} enviado${completedFiles > 1 ? "s" : ""}`;
  };

  const truncateFileName = (name: string, maxLength: number = 28) => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop() || "";
    const nameWithoutExt = name.slice(0, name.lastIndexOf("."));
    const availableLength = maxLength - ext.length - 4;
    return `${nameWithoutExt.slice(0, availableLength)}...${ext}`;
  };

  return (
    <div className="w-[320px] rounded-lg border border-secondary bg-primary p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-secondary">
          <Upload01 className="h-4 w-4 text-fg-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary text-sm">{headerText}</p>
          <p
            className={cx(
              "text-xs mt-0.5",
              failedFiles > 0 && isComplete ? "text-error-primary" : "text-tertiary"
            )}
          >
            {getProgressText()}
          </p>
        </div>
      </div>

      {!isComplete && (
        <div className="mt-3 space-y-2">
          <ProgressBar value={overallProgress} labelPosition="right" className="h-1.5" />
          {currentFileName && (
            <p className="text-xs text-quaternary truncate">
              Enviando: {truncateFileName(currentFileName)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
