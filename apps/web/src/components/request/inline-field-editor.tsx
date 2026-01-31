"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { NovelEditor } from "@/components/ui/novel-editor";
import { trpc } from "@/utils/trpc";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "WYSIWYG"
  | "FILE"
  | "IMAGE"
  | "DATE"
  | "DATETIME"
  | "SELECT"
  | "MULTI_SELECT"
  | "NUMBER"
  | "CHECKBOX"
  | "URL"
  | "REPEATER"
  | "AD_REFERENCE";

interface SubFieldDef {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

interface InlineFieldEditorProps {
  field: {
    id: string;
    name: string;
    label: string;
    fieldType: FieldType;
    required: boolean;
    options?: string[] | null;
    placeholder?: string | null;
  };
  value: any;
  isEditable: boolean;
  isRequired: boolean;
  isMissing: boolean;
  requestId: string;
  onSave?: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export function InlineFieldEditor({
  field,
  value,
  isEditable,
  isRequired,
  isMissing,
  requestId,
  onSave,
}: InlineFieldEditorProps) {
  const [localValue, setLocalValue] = useState<any>(value);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const saveFieldValueMutation = useMutation({
    ...(trpc.request.saveFieldValue.mutationOptions as any)(),
    onSuccess: () => {
      setSaveStatus("success");
      setErrorMessage(null);
      onSave?.();
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus((current) => (current === "success" ? "idle" : current));
      }, 2000);
    },
    onError: (error: Error) => {
      setSaveStatus("error");
      setErrorMessage(error.message);
      toast.error(`Erro ao salvar ${field.label}: ${error.message}`);
    },
  });

  const handleSave = useCallback(
    async (newValue: any) => {
      if (!isEditable) return;

      setSaveStatus("saving");
      (saveFieldValueMutation.mutate as any)({
        requestId,
        fieldId: field.id,
        value: newValue,
      });
    },
    [isEditable, requestId, field.id, field.label, saveFieldValueMutation]
  );

  const handleBlur = useCallback(() => {
    if (!isEditable || field.fieldType === "WYSIWYG") return;
    if (localValue !== value) {
      handleSave(localValue);
    }
  }, [isEditable, field.fieldType, localValue, value, handleSave]);

  const handleRetry = useCallback(() => {
    handleSave(localValue);
  }, [localValue, handleSave]);

  // Render read-only display
  if (!isEditable) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            {field.label}
            {isRequired && <span className="text-error-primary ml-1">*</span>}
          </span>
        </div>
        <div className="text-sm text-secondary bg-secondary rounded-lg px-3 py-2 min-h-[36px]">
          {renderReadOnlyValue(field.fieldType, value)}
        </div>
      </div>
    );
  }

  // Render editable field
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-primary">
          {field.label}
          {isRequired && <span className="text-error-primary ml-1">*</span>}
        </span>
        {saveStatus === "saving" && (
          <Loader2 className="h-4 w-4 animate-spin text-tertiary" />
        )}
        {saveStatus === "success" && (
          <CheckCircle className="h-4 w-4 text-success-primary" />
        )}
        {saveStatus === "error" && (
          <XCircle className="h-4 w-4 text-error-primary" />
        )}
      </div>

      {renderEditableField()}

      {isMissing && (
        <p className="text-xs text-error-primary">Campo obrigatório para avançar</p>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-error-primary">
            {errorMessage || "Erro ao salvar"}
          </p>
          <Button
            size="sm"
            color="tertiary"
            onClick={handleRetry}
            className="text-xs h-6 px-2"
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );

  function renderReadOnlyValue(type: FieldType, val: any): React.ReactNode {
    if (val === null || val === undefined || val === "") {
      return <span className="text-tertiary italic">Não preenchido</span>;
    }

    switch (type) {
      case "CHECKBOX":
        return val ? "Sim" : "Não";
      case "URL":
        return (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline"
          >
            {val}
          </a>
        );
      case "FILE":
        return (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline"
          >
            Ver arquivo
          </a>
        );
      case "WYSIWYG":
        return (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: val }}
          />
        );
      case "SELECT":
        return val;
      case "MULTI_SELECT":
        return Array.isArray(val) ? val.join(", ") : val;
      case "IMAGE":
        return (
          <img
            src={val}
            alt="Preview"
            className="max-h-24 rounded-lg object-contain"
          />
        );
      case "REPEATER": {
        const items = Array.isArray(val) ? val : [];
        return <span>{items.length} item(s)</span>;
      }
      default:
        return val;
    }
  }

  function renderEditableField(): React.ReactNode {
    const isInvalid = isMissing;

    switch (field.fieldType) {
      case "TEXT":
      case "URL":
        return (
          <Input
            value={localValue || ""}
            onChange={(v) => setLocalValue(v)}
            onBlur={handleBlur}
            placeholder={field.placeholder || undefined}
            isInvalid={isInvalid}
          />
        );

      case "TEXTAREA":
        return (
          <TextArea
            value={localValue || ""}
            onChange={(v) => setLocalValue(v)}
            onBlur={handleBlur}
            placeholder={field.placeholder || undefined}
            isInvalid={isInvalid}
            rows={3}
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={localValue || ""}
            onChange={(v) => setLocalValue(v ? Number(v) : null)}
            onBlur={handleBlur}
            placeholder={field.placeholder || undefined}
            isInvalid={isInvalid}
          />
        );

      case "CHECKBOX":
        return (
          <Checkbox
            label="Sim"
            isSelected={!!localValue}
            onChange={(checked) => {
              const newValue = checked === true;
              setLocalValue(newValue);
              handleSave(newValue);
            }}
          />
        );

      case "SELECT":
        return (
          <Select
            aria-label={field.label}
            selectedKey={localValue || ""}
            onSelectionChange={(key) => {
              const newValue = key as string;
              setLocalValue(newValue);
              handleSave(newValue);
            }}
            isInvalid={isInvalid}
            placeholder="Selecione..."
          >
            {(field.options || []).map((option) => (
              <Select.Item key={option} id={option} label={option} />
            ))}
          </Select>
        );

      case "MULTI_SELECT": {
        const multiOpts = field.options || [];
        const selectedMulti: string[] = Array.isArray(localValue) ? localValue : [];
        return (
          <div className="space-y-2">
            {multiOpts.map((opt) => (
              <Checkbox
                key={opt}
                isSelected={selectedMulti.includes(opt)}
                onChange={(checked) => {
                  const newVals = checked
                    ? [...selectedMulti, opt]
                    : selectedMulti.filter((v) => v !== opt);
                  setLocalValue(newVals);
                  handleSave(newVals);
                }}
              >
                {opt}
              </Checkbox>
            ))}
          </div>
        );
      }

      case "DATE":
        return (
          <Input
            type="date"
            value={localValue || ""}
            onChange={(v) => {
              setLocalValue(v);
              handleSave(v);
            }}
            isInvalid={isInvalid}
          />
        );

      case "DATETIME":
        return (
          <Input
            type="datetime-local"
            value={localValue || ""}
            onChange={(v) => {
              setLocalValue(v);
              handleSave(v);
            }}
            isInvalid={isInvalid}
          />
        );

       case "WYSIWYG":
         return (
           <div className="space-y-2">
             <NovelEditor
               value={localValue || ""}
               onChange={(value) => {
                 setLocalValue(value);
               }}
             />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => handleSave(localValue)}
                isLoading={saveStatus === "saving"}
                isDisabled={saveStatus === "saving"}
              >
                Salvar
              </Button>
            </div>
          </div>
        );

      case "FILE":
        return (
          <div className="space-y-2">
            {localValue ? (
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                <a
                  href={localValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline text-sm flex-1 truncate"
                >
                  Arquivo atual
                </a>
                <Button
                  size="sm"
                  color="tertiary"
                  onClick={() => {
                    setLocalValue(null);
                    handleSave(null);
                  }}
                >
                  Remover
                </Button>
              </div>
             ) : (
               <input
                 type="file"
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     // For file fields, we'd need to upload first
                     // This is a simplified version - file upload would need separate handling
                     toast.info("Upload de arquivo requer implementação adicional");
                   }
                 }}
                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
               />
            )}
          </div>
        );

      case "IMAGE":
        return (
          <div className="space-y-2">
            {localValue ? (
              <div className="relative group inline-block">
                <img
                  src={localValue}
                  alt={field.label}
                  className="max-h-32 rounded-lg object-contain border border-secondary"
                />
                <Button
                  size="sm"
                  color="tertiary"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/80"
                  onClick={() => {
                    setLocalValue(null);
                    handleSave(null);
                  }}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    toast.info("Upload de imagem requer implementação adicional");
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>
        );

      case "REPEATER": {
        const subFieldDefs: SubFieldDef[] = Array.isArray(field.options)
          ? (field.options as unknown as SubFieldDef[])
          : [];
        const groups: Record<string, any>[] = Array.isArray(localValue) ? localValue : [];

        const handleGroupChange = (groupIndex: number, subFieldName: string, newVal: any) => {
          const updated = [...groups];
          updated[groupIndex] = { ...updated[groupIndex], [subFieldName]: newVal };
          setLocalValue(updated);
        };

        const addGroup = () => {
          const emptyGroup: Record<string, any> = {};
          subFieldDefs.forEach((sf) => {
            emptyGroup[sf.name] = sf.type === "CHECKBOX" ? false : "";
          });
          setLocalValue([...groups, emptyGroup]);
        };

        const removeGroup = (index: number) => {
          const updated = groups.filter((_, i) => i !== index);
          setLocalValue(updated);
        };

        return (
          <div className="space-y-3">
            {groups.map((group, gIdx) => (
              <div key={gIdx} className="rounded-lg border border-secondary p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-tertiary">#{gIdx + 1}</span>
                  <Button size="sm" color="tertiary-destructive" onClick={() => removeGroup(gIdx)}>
                    Remover
                  </Button>
                </div>
                {subFieldDefs.map((sf) => {
                  const sfValue = group[sf.name] ?? "";
                  return (
                    <div key={sf.name} className="space-y-1">
                      <label className="text-xs font-medium text-secondary">{sf.label}</label>
                      {sf.type === "TEXTAREA" ? (
                        <TextArea
                          value={sfValue || ""}
                          onChange={(v) => handleGroupChange(gIdx, sf.name, v)}
                          rows={2}
                        />
                      ) : sf.type === "CHECKBOX" ? (
                        <Checkbox
                          isSelected={!!sfValue}
                          onChange={(c) => handleGroupChange(gIdx, sf.name, c === true)}
                        />
                      ) : sf.type === "SELECT" ? (
                        <Select
                          aria-label={sf.label}
                          selectedKey={sfValue || null}
                          onSelectionChange={(k) => handleGroupChange(gIdx, sf.name, k)}
                          placeholder="Selecione..."
                        >
                          {(sf.options || []).map((opt) => (
                            <Select.Item key={opt} id={opt} label={opt} />
                          ))}
                        </Select>
                      ) : (
                        <Input
                          type={sf.type === "NUMBER" ? "number" : sf.type === "URL" ? "url" : "text"}
                          value={sfValue || ""}
                          onChange={(v) =>
                            handleGroupChange(gIdx, sf.name, sf.type === "NUMBER" && v ? Number(v) : v)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <Button size="sm" color="secondary" onClick={addGroup}>
              Adicionar Item
            </Button>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => handleSave(localValue)}
                isLoading={saveStatus === "saving"}
                isDisabled={saveStatus === "saving"}
              >
                Salvar
              </Button>
            </div>
          </div>
        );
      }

      default:
        return (
          <Input
            value={localValue || ""}
            onChange={(v) => setLocalValue(v)}
            onBlur={handleBlur}
            placeholder={field.placeholder || undefined}
            isInvalid={isInvalid}
          />
        );
    }
  }
}
