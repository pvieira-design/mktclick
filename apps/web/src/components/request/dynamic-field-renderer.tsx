"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { NovelEditor } from "@/components/ui/novel-editor";
import { UploadCloud01, XClose, File04 } from "@untitledui/icons";

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

interface DynamicFieldRendererProps {
  fields: ContentTypeField[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  onFileUpload?: (fieldName: string, file: File) => Promise<string>;
  disabled?: boolean;
  errors?: Record<string, string>;
}

export function DynamicFieldRenderer({
  fields,
  values,
  onChange,
  onFileUpload,
  disabled = false,
  errors = {},
}: DynamicFieldRendererProps) {
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(new Set());

  const handleFileChange = useCallback(
    async (fieldName: string, file: File | null) => {
      if (!file || !onFileUpload) return;

      setUploadingFields((prev) => new Set(prev).add(fieldName));
      try {
        const url = await onFileUpload(fieldName, file);
        onChange(fieldName, url);
      } catch (error) {
        console.error("File upload failed:", error);
      } finally {
        setUploadingFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldName);
          return next;
        });
      }
    },
    [onChange, onFileUpload]
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
    const isUploading = uploadingFields.has(field.name);

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
            placeholder={field.placeholder || "Start writing..."}
            disabled={disabled}
            className={error ? "border-destructive" : ""}
          />
        );

      case "FILE":
        return (
          <div className="space-y-2">
            {value ? (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <File04 className="h-4 w-4 text-muted-foreground" />
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm truncate hover:underline"
                >
                  {value.split("/").pop() || "Uploaded file"}
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
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id={field.name}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(field.name, file);
                  }}
                  disabled={disabled || isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => document.getElementById(field.name)?.click()}
                  isDisabled={disabled || isUploading}
                  iconLeading={UploadCloud01}
                >
                  {isUploading ? "Uploading..." : "Choose file"}
                </Button>
              </div>
            )}
          </div>
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
            placeholder={field.placeholder || "Select an option..."}
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
            Ad reference field (coming soon)
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unknown field type: {field.fieldType}
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
        <p className="text-sm text-muted-foreground">No custom fields configured.</p>
      )}
    </div>
  );
}

export default DynamicFieldRenderer;
