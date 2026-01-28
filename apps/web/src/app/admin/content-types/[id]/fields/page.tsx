"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit01, Trash01, ChevronUp, ChevronDown } from "@untitledui/icons";
import Link from "next/link";

const fieldTypes = [
  { value: "TEXT", label: "Text", description: "Single line text input" },
  { value: "TEXTAREA", label: "Text Area", description: "Multi-line text input" },
  { value: "WYSIWYG", label: "Rich Text", description: "Rich text editor (WYSIWYG)" },
  { value: "FILE", label: "File Upload", description: "File attachment" },
  { value: "DATE", label: "Date", description: "Date picker" },
  { value: "DATETIME", label: "Date & Time", description: "Date and time picker" },
  { value: "SELECT", label: "Select", description: "Dropdown selection" },
  { value: "NUMBER", label: "Number", description: "Numeric input" },
  { value: "CHECKBOX", label: "Checkbox", description: "Boolean yes/no" },
  { value: "URL", label: "URL", description: "Web link" },
  { value: "AD_REFERENCE", label: "Ad Reference", description: "Reference to ad (coming soon)", disabled: true },
];

interface Field {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  required: boolean;
  order: number;
  options: any; 
  placeholder: string | null;
  helpText: string | null;
  defaultValue: string | null;
  isActive: boolean;
}

interface FieldFormData {
  name: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string;
  placeholder: string;
  helpText: string;
  defaultValue: string;
}

const initialFormData: FieldFormData = {
  name: "",
  label: "",
  fieldType: "TEXT",
  required: false,
  options: "",
  placeholder: "",
  helpText: "",
  defaultValue: "",
};

export default function ContentTypeFieldsPage() {
  const params = useParams();
  const contentTypeId = params.id as string;
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);
  const [formData, setFormData] = useState<FieldFormData>(initialFormData);

  const { data: contentType, isLoading: isContentTypeLoading } = useQuery(
    trpc.contentType.getById.queryOptions({ id: contentTypeId })
  );

  const { data: fieldsData, isLoading: isFieldsLoading } = useQuery(
    trpc.contentTypeField.listByContentType.queryOptions({ contentTypeId })
  );

  const createFieldMutation = useMutation({
    ...(trpc.contentTypeField.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Field created successfully");
      queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
      closeDialog();
    },
    onError: (error: Error) => toast.error(`Error: ${error.message}`),
  });

  const updateFieldMutation = useMutation({
    ...(trpc.contentTypeField.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Field updated successfully");
      queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
      closeDialog();
    },
    onError: (error: Error) => toast.error(`Error: ${error.message}`),
  });

  const deleteFieldMutation = useMutation({
    ...(trpc.contentTypeField.delete.mutationOptions as any)(),
    onSuccess: (result: { deleted: boolean; deactivated: boolean }) => {
      toast.success(result.deleted ? "Field deleted" : "Field deactivated");
      queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
    },
    onError: (error: Error) => toast.error(`Error: ${error.message}`),
  });

  const reorderFieldsMutation = useMutation({
    ...(trpc.contentTypeField.reorder.mutationOptions as any)(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
    },
    onError: (error: Error) => toast.error(`Error: ${error.message}`),
  });

  const openCreateDialog = () => {
    setEditingField(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (field: Field) => {
    setEditingField(field);
    
    let optionsStr = "";
    if (Array.isArray(field.options)) {
      optionsStr = field.options.join("\n");
    }

    setFormData({
      name: field.name,
      label: field.label,
      fieldType: field.fieldType,
      required: field.required,
      options: optionsStr,
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      defaultValue: field.defaultValue || "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingField(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = formData.fieldType === "SELECT" 
      ? formData.options.split("\n").filter(o => o.trim())
      : undefined;

    if (editingField) {
      (updateFieldMutation.mutate as any)({
        id: editingField.id,
        label: formData.label,
        required: formData.required,
        options,
        placeholder: formData.placeholder || undefined,
        helpText: formData.helpText || undefined,
        defaultValue: formData.defaultValue || undefined,
      });
    } else {
      const nextOrder = (fieldsData?.items.length || 0);
      (createFieldMutation.mutate as any)({
        contentTypeId,
        name: formData.name,
        label: formData.label,
        fieldType: formData.fieldType,
        required: formData.required,
        order: nextOrder,
        options,
        placeholder: formData.placeholder || undefined,
        helpText: formData.helpText || undefined,
        defaultValue: formData.defaultValue || undefined,
      });
    }
  };

  const handleDelete = () => {
    if (fieldToDelete) {
      (deleteFieldMutation.mutate as any)({ id: fieldToDelete.id });
      setFieldToDelete(null);
    }
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (!fields || fields.length === 0) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    const reorderedFields = [...fields];
    const temp = reorderedFields[index];
    reorderedFields[index] = reorderedFields[newIndex]!;
    reorderedFields[newIndex] = temp!;
    
    const fieldIds: string[] = [];
    for (const f of reorderedFields) {
      fieldIds.push(f.id);
    }
    
    (reorderFieldsMutation.mutate as any)({
      contentTypeId,
      fieldIds,
    });
  };

  const isLoading = isContentTypeLoading || isFieldsLoading;
  const fields = (fieldsData?.items || []) as unknown as Field[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/content-types/${contentTypeId}/edit` as any}
        >
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div className="flex-1">
          {isContentTypeLoading ? (
            <Skeleton className="h-8 w-[200px]" />
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                Fields: {contentType?.name}
              </h1>
              <p className="text-muted-foreground">
                Configure custom fields for this content type.
              </p>
            </>
          )}
        </div>
        <Button onClick={openCreateDialog} iconLeading={Plus}>
          Add Field
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            {fields.length} field(s) configured. Drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : fields.length > 0 ? (
            <div className="space-y-2">
              {fields.map((field: Field, index: number) => (
                <div
                  key={field.id}
                  className="flex items-center gap-4 p-4 rounded-md border bg-card"
                >
                  <div className="flex flex-col">
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => moveField(index, "up")}
                      isDisabled={index === 0 || reorderFieldsMutation.isPending}
                      iconLeading={ChevronUp}
                    />
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => moveField(index, "down")}
                      isDisabled={index === fields.length - 1 || reorderFieldsMutation.isPending}
                      iconLeading={ChevronDown}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      <Badge color="gray" type="pill-color" size="sm">{field.name}</Badge>
                      {field.required && <Badge color="gray" size="sm">Required</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {fieldTypes.find(t => t.value === field.fieldType)?.label || field.fieldType}
                      {field.helpText && ` • ${field.helpText}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => openEditDialog(field)}
                      iconLeading={Edit01}
                    />
                    <Button
                      color="tertiary"
                      size="sm"
                      iconLeading={Trash01}
                      className="text-destructive"
                      onClick={() => setFieldToDelete(field)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No fields configured yet. Add a field to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!fieldToDelete} onOpenChange={(open) => !open && setFieldToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete field?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{fieldToDelete?.label}" from this content type.
              If requests already use this field, it will be deactivated instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingField ? "Edit Field" : "Add Field"}</DialogTitle>
              <DialogDescription>
                {editingField 
                  ? "Update the field properties." 
                  : "Configure a new field for this content type."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {!editingField && (
                <div className="grid gap-2">
                  <Input
                    label="Field Name"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    placeholder="field_name"
                    hint="Lowercase letters, numbers, underscores. Cannot be changed later."
                    isRequired
                    {...{ pattern: "^[a-z][a-z0-9_]*$" }}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Input
                  label="Display Label"
                  value={formData.label}
                  onChange={(value) => setFormData({ ...formData, label: value })}
                  placeholder="Field Label"
                  isRequired
                />
              </div>

              {!editingField && (
                <div className="grid gap-2">
                  <Select
                    label="Field Type"
                    selectedKey={formData.fieldType}
                    onSelectionChange={(key) => setFormData({ ...formData, fieldType: key as string })}
                  >
                    {fieldTypes.map((type) => (
                      <Select.Item 
                        key={type.value} 
                        id={type.value} 
                        label={type.label} 
                        isDisabled={type.disabled} 
                      />
                    ))}
                  </Select>
                </div>
              )}

              {formData.fieldType === "SELECT" && (
                <div className="grid gap-2">
                  <TextArea
                    label="Options"
                    value={formData.options}
                    onChange={(value) => setFormData({ ...formData, options: value })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                    hint="One option per line."
                  />
                </div>
              )}

              {["TEXT", "TEXTAREA", "URL"].includes(formData.fieldType) && (
                <div className="grid gap-2">
                  <Input
                    label="Placeholder"
                    value={formData.placeholder}
                    onChange={(value) => setFormData({ ...formData, placeholder: value })}
                    placeholder="Enter placeholder text..."
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Input
                  label="Help Text"
                  value={formData.helpText}
                  onChange={(value) => setFormData({ ...formData, helpText: value })}
                  placeholder="Additional instructions for users..."
                />
              </div>

              <div className="grid gap-2">
                <Input
                  label="Default Value"
                  value={formData.defaultValue}
                  onChange={(value) => setFormData({ ...formData, defaultValue: value })}
                  placeholder="Default value for this field"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={formData.required}
                  onChange={(checked) => 
                    setFormData({ ...formData, required: checked === true })
                  }
                >
                  Required field
                </Checkbox>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" color="secondary" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                isDisabled={createFieldMutation.isPending || updateFieldMutation.isPending}
                isLoading={createFieldMutation.isPending || updateFieldMutation.isPending}
              >
                {editingField ? "Save Changes" : "Add Field"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
