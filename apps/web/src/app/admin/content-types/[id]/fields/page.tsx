"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
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

  const handleDelete = (fieldId: string) => {
    (deleteFieldMutation.mutate as any)({ id: fieldId });
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
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
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
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
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
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0 || reorderFieldsMutation.isPending}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveField(index, "down")}
                      disabled={index === fields.length - 1 || reorderFieldsMutation.isPending}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="outline" className="text-xs">{field.name}</Badge>
                      {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {fieldTypes.find(t => t.value === field.fieldType)?.label || field.fieldType}
                      {field.helpText && ` • ${field.helpText}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete field?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{field.label}" from this content type.
                            If requests already use this field, it will be deactivated instead.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(field.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                  <Label htmlFor="name">Field Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="field_name"
                    pattern="^[a-z][a-z0-9_]*$"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters, numbers, underscores. Cannot be changed later.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="label">Display Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Field Label"
                  required
                />
              </div>

              {!editingField && (
                <div className="grid gap-2">
                  <Label htmlFor="fieldType">Field Type</Label>
                  <Select
                    value={formData.fieldType}
                    onValueChange={(value) => setFormData({ ...formData, fieldType: value || "TEXT" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          disabled={type.disabled}
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.fieldType === "SELECT" && (
                <div className="grid gap-2">
                  <Label htmlFor="options">Options</Label>
                  <Textarea
                    id="options"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    One option per line.
                  </p>
                </div>
              )}

              {["TEXT", "TEXTAREA", "URL"].includes(formData.fieldType) && (
                <div className="grid gap-2">
                  <Label htmlFor="placeholder">Placeholder</Label>
                  <Input
                    id="placeholder"
                    value={formData.placeholder}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    placeholder="Enter placeholder text..."
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="helpText">Help Text</Label>
                <Input
                  id="helpText"
                  value={formData.helpText}
                  onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                  placeholder="Additional instructions for users..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input
                  id="defaultValue"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  placeholder="Default value for this field"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, required: checked === true })
                  }
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Required field
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createFieldMutation.isPending || updateFieldMutation.isPending}
              >
                {(createFieldMutation.isPending || updateFieldMutation.isPending) 
                  ? "Saving..." 
                  : editingField ? "Save Changes" : "Add Field"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
