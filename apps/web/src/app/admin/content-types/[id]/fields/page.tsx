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
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
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
import { Plus, Edit01, Trash01, ChevronUp, ChevronDown } from "@untitledui/icons";

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
   assignedStep: { id: string; name: string } | null;
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

  const isLoading = isFieldsLoading;
  const fields = (fieldsData?.items || []) as unknown as Field[];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
        <div className="flex items-center justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-primary">Custom Fields</h2>
            <p className="text-sm text-tertiary mt-1">
              {fields.length} field(s) configured. Drag to reorder.
            </p>
          </div>
          <Button onClick={openCreateDialog} iconLeading={Plus}>
            Add Field
          </Button>
        </div>
        <div className="px-6 pb-6 pt-4">
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
                  className="flex items-center gap-4 p-4 rounded-lg ring-1 ring-border-secondary bg-primary"
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
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="font-medium">{field.label}</span>
                       <Badge color="gray" type="pill-color" size="sm">{field.name}</Badge>
                       {field.required && <Badge color="gray" size="sm">Required</Badge>}
                       {field.assignedStep ? (
                         <Badge color="brand" size="sm">{field.assignedStep.name}</Badge>
                       ) : (
                         <Badge color="gray" size="sm">Desagrupado</Badge>
                       )}
                     </div>
                     <div className="text-sm text-tertiary">
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
                      className="text-error-primary"
                      onClick={() => setFieldToDelete(field)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-tertiary">
              No fields configured yet. Add a field to get started.
            </div>
          )}
        </div>
      </div>

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

      <SlideoutMenu isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {({ close }) => (
          <>
            <SlideoutMenu.Header onClose={close}>
              <div className="flex items-start gap-4 pr-8">
                <FeaturedIcon icon={editingField ? Edit01 : Plus} theme="light" color="brand" size="md" />
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    {editingField ? "Edit Field" : "Add Field"}
                  </h2>
                  <p className="text-sm text-tertiary mt-1">
                    {editingField 
                      ? "Update the field properties." 
                      : "Configure a new field for this content type."}
                  </p>
                </div>
              </div>
            </SlideoutMenu.Header>

            <SlideoutMenu.Content>
              <form id="field-form" onSubmit={handleSubmit} className="space-y-4">
                {!editingField && (
                  <Input
                    label="Field Name"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    placeholder="field_name"
                    hint="Lowercase letters, numbers, underscores. Cannot be changed later."
                    isRequired
                    {...{ pattern: "^[a-z][a-z0-9_]*$" }}
                  />
                )}

                <Input
                  label="Display Label"
                  value={formData.label}
                  onChange={(value) => setFormData({ ...formData, label: value })}
                  placeholder="Field Label"
                  isRequired
                />

                {!editingField && (
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
                )}

                {formData.fieldType === "SELECT" && (
                  <TextArea
                    label="Options"
                    value={formData.options}
                    onChange={(value) => setFormData({ ...formData, options: value })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                    hint="One option per line."
                  />
                )}

                {["TEXT", "TEXTAREA", "URL"].includes(formData.fieldType) && (
                  <Input
                    label="Placeholder"
                    value={formData.placeholder}
                    onChange={(value) => setFormData({ ...formData, placeholder: value })}
                    placeholder="Enter placeholder text..."
                  />
                )}

                <Input
                  label="Help Text"
                  value={formData.helpText}
                  onChange={(value) => setFormData({ ...formData, helpText: value })}
                  placeholder="Additional instructions for users..."
                />

                <Input
                  label="Default Value"
                  value={formData.defaultValue}
                  onChange={(value) => setFormData({ ...formData, defaultValue: value })}
                  placeholder="Default value for this field"
                />

                <Checkbox
                  label="Required field"
                  isSelected={formData.required}
                  onChange={(checked) => 
                    setFormData({ ...formData, required: checked === true })
                  }
                />
              </form>
            </SlideoutMenu.Content>

            <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
              <Button type="button" color="secondary" onClick={close}>
                Cancel
              </Button>
              <Button 
                type="submit"
                form="field-form"
                isDisabled={createFieldMutation.isPending || updateFieldMutation.isPending}
                isLoading={createFieldMutation.isPending || updateFieldMutation.isPending}
              >
                {editingField ? "Save Changes" : "Add Field"}
              </Button>
            </SlideoutMenu.Footer>
          </>
        )}
      </SlideoutMenu>
    </div>
  );
}
