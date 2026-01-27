"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NovelEditor } from "@/components/ui/novel-editor";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder || undefined}
            disabled={disabled}
            className={cn(error && "border-destructive")}
          />
        );

      case "TEXTAREA":
        return (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder || undefined}
            disabled={disabled}
            rows={4}
            className={cn(error && "border-destructive")}
          />
        );

      case "WYSIWYG":
        return (
          <NovelEditor
            value={value}
            onChange={(v) => onChange(field.name, v)}
            placeholder={field.placeholder || "Start writing..."}
            disabled={disabled}
            className={cn(error && "border-destructive")}
          />
        );

      case "FILE":
        return (
          <div className="space-y-2">
            {value ? (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
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
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(field.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
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
                  variant="outline"
                  onClick={() => document.getElementById(field.name)?.click()}
                  disabled={disabled || isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
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
            onChange={(e) => onChange(field.name, e.target.value)}
            disabled={disabled}
            className={cn("w-fit", error && "border-destructive")}
          />
        );

      case "DATETIME":
        return (
          <Input
            id={field.name}
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            disabled={disabled}
            className={cn("w-fit", error && "border-destructive")}
          />
        );

      case "SELECT":
        const options = field.options || [];
        return (
          <Select
            value={value || undefined}
            onValueChange={(v) => onChange(field.name, v)}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && "border-destructive")}>
              <SelectValue placeholder={field.placeholder || "Select an option..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "NUMBER":
        return (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : "")}
            placeholder={field.placeholder || undefined}
            disabled={disabled}
            className={cn("w-fit", error && "border-destructive")}
          />
        );

      case "CHECKBOX":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.name}
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => onChange(field.name, checked)}
              disabled={disabled}
            />
            <Label htmlFor={field.name} className="cursor-pointer text-sm">
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      case "URL":
        return (
          <Input
            id={field.name}
            type="url"
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder || "https://"}
            disabled={disabled}
            className={cn(error && "border-destructive")}
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
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
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
