"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { NovelEditor } from "@/components/ui/novel-editor";
import { FileUpload, FileListItemProgressBar, getReadableFileSize } from "@/components/application/file-upload/file-upload-base";
import { XClose, File04 } from "@untitledui/icons";

type FieldType = 
  | "TEXT"
  | "TEXTAREA"
  | "WYSIWYG"
  | "FILE"
  | "DATE"
  | "DATETIME"
  | "SELECT"
  | "NUMBER"
  | "CHECKBOX"
  | "URL"
  | "AD_REFERENCE";

interface ContentTypeField {
  id: string;
  name: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  options: string[] | null;
  placeholder: string | null;
  helpText: string | null;
  defaultValue: string | null;
}

interface FileUploadState {
  file: File;
  progress: number;
  failed: boolean;
}

interface DynamicFieldRendererProps {
  fields: ContentTypeField[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  onFileUpload?: (fieldName: string, file: File) => Promise<string>;
  disabled?: boolean;
  errors?: Record<string, string>;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function DynamicFieldRenderer({
  fields,
  values,
  onChange,
  onFileUpload,
  disabled = false,
  errors = {},
}: DynamicFieldRendererProps) {
  const [uploadStates, setUploadStates] = useState<Record<string, FileUploadState>>({});

  const handleFileUpload = useCallback(
    async (fieldName: string, file: File) => {
      if (!onFileUpload) return;

      setUploadStates((prev) => ({
        ...prev,
        [fieldName]: { file, progress: 0, failed: false },
      }));

      const progressInterval = setInterval(() => {
        setUploadStates((prev) => {
          const current = prev[fieldName];
          if (!current || current.progress >= 90) return prev;
          return {
            ...prev,
            [fieldName]: { ...current, progress: current.progress + 10 },
          };
        });
      }, 100);

      try {
        const url = await onFileUpload(fieldName, file);
        clearInterval(progressInterval);
        setUploadStates((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], progress: 100 },
        }));
        
        setTimeout(() => {
          onChange(fieldName, url);
          setUploadStates((prev) => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
          });
        }, 500);
      } catch (error) {
        clearInterval(progressInterval);
        setUploadStates((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], failed: true },
        }));
      }
    },
    [onChange, onFileUpload]
  );

  const handleDropFiles = useCallback(
    (fieldName: string, files: FileList) => {
      const file = files[0];
      if (file) {
        handleFileUpload(fieldName, file);
      }
    },
    [handleFileUpload]
  );

  const handleRetry = useCallback(
    (fieldName: string) => {
      const state = uploadStates[fieldName];
      if (state) {
        handleFileUpload(fieldName, state.file);
      }
    },
    [uploadStates, handleFileUpload]
  );

  const handleDeleteUpload = useCallback(
    (fieldName: string) => {
      setUploadStates((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    },
    []
  );

  const removeFile = useCallback(
    (fieldName: string) => {
      onChange(fieldName, null);
    },
    [onChange]
  );

  const renderField = (field: ContentTypeField) => {
    const value = values[field.name] ?? field.defaultValue ?? "";
    const error = errors[field.name];
    const uploadState = uploadStates[field.name];

    switch (field.fieldType) {
      case "TEXT":
        return (
          <Input
            id={field.name}
            type="text"
            value={value}
            onChange={(val) => onChange(field.name, val)}
            placeholder={field.placeholder || undefined}
            isDisabled={disabled}
            isInvalid={!!error}
          />
        );

      case "TEXTAREA":
        return (
          <TextArea
            id={field.name}
            value={value}
            onChange={(val) => onChange(field.name, val)}
            placeholder={field.placeholder || undefined}
            isDisabled={disabled}
            rows={4}
            isInvalid={!!error}
          />
        );

      case "WYSIWYG":
        return (
          <NovelEditor
            value={value}
            onChange={(v) => onChange(field.name, v)}
            placeholder={field.placeholder || "Comece a escrever..."}
            disabled={disabled}
            className={error ? "border-destructive" : ""}
          />
        );

      case "FILE":
        if (value) {
          return (
            <div className="flex items-center gap-2 p-3 border rounded-xl bg-primary ring-1 ring-secondary ring-inset">
              <File04 className="h-5 w-5 text-tertiary shrink-0" />
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-medium text-secondary truncate hover:underline"
              >
                {value.split("/").pop() || "Arquivo enviado"}
              </a>
              {!disabled && (
                <Button
                  type="button"
                  color="tertiary"
                  size="sm"
                  onClick={() => removeFile(field.name)}
                  iconLeading={XClose}
                />
              )}
            </div>
          );
        }

        if (uploadState) {
          return (
            <FileUpload.Root>
              <FileUpload.List>
                <FileListItemProgressBar
                  name={uploadState.file.name}
                  size={uploadState.file.size}
                  progress={uploadState.progress}
                  failed={uploadState.failed}
                  onDelete={() => handleDeleteUpload(field.name)}
                  onRetry={() => handleRetry(field.name)}
                />
              </FileUpload.List>
            </FileUpload.Root>
          );
        }

        return (
          <FileUpload.Root>
            <FileUpload.DropZone
              hint={`PNG, JPG, PDF, DOC (máx. ${getReadableFileSize(MAX_FILE_SIZE_BYTES)})`}
              isDisabled={disabled}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              allowsMultiple={false}
              maxSize={MAX_FILE_SIZE_BYTES}
              onDropFiles={(files) => handleDropFiles(field.name, files)}
            />
          </FileUpload.Root>
        );

      case "DATE":
        return (
          <Input
            id={field.name}
            type="date"
            value={value}
            onChange={(val) => onChange(field.name, val)}
            isDisabled={disabled}
            isInvalid={!!error}
            className="w-fit"
          />
        );

      case "DATETIME":
        return (
          <Input
            id={field.name}
            type="datetime-local"
            value={value}
            onChange={(val) => onChange(field.name, val)}
            isDisabled={disabled}
            isInvalid={!!error}
            className="w-fit"
          />
        );

      case "SELECT":
        const options = field.options || [];
        const controlledSelectValue = typeof value === "string" ? value : "";
        return (
          <Select
            selectedKey={controlledSelectValue || null}
            onSelectionChange={(key) => onChange(field.name, key)}
            isDisabled={disabled}
            placeholder={field.placeholder || "Selecione uma opção..."}
            isInvalid={!!error}
          >
            {options.map((opt) => (
              <Select.Item key={opt} id={opt} label={opt} />
            ))}
          </Select>
        );

      case "NUMBER":
        return (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(val) => onChange(field.name, val ? Number(val) : "")}
            placeholder={field.placeholder || undefined}
            isDisabled={disabled}
            isInvalid={!!error}
            className="w-fit"
          />
        );

      case "CHECKBOX":
        return (
          <Checkbox
            id={field.name}
            isSelected={value === true || value === "true"}
            onChange={(checked) => onChange(field.name, checked)}
            isDisabled={disabled}
          >
            {field.placeholder || field.label}
          </Checkbox>
        );

      case "URL":
        return (
          <Input
            id={field.name}
            type="url"
            value={value}
            onChange={(val) => onChange(field.name, val)}
            placeholder={field.placeholder || "https://"}
            isDisabled={disabled}
            isInvalid={!!error}
          />
        );

      case "AD_REFERENCE":
        return (
          <div className="p-3 border rounded-md bg-muted/50 text-muted-foreground text-sm">
            Campo de referência de anúncio (em breve)
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Tipo de campo desconhecido: {field.fieldType}
          </div>
        );
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedFields.map((field) => (
        <div key={field.id} className="space-y-2">
          {field.fieldType !== "CHECKBOX" && (
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}

          {renderField(field)}

          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}

          {errors[field.name] && (
            <p className="text-xs text-destructive">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {sortedFields.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum campo personalizado configurado.</p>
      )}
    </div>
  );
}

export default DynamicFieldRenderer;
