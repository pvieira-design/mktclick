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
  { value: "TEXT", label: "Texto", description: "Campo de texto de linha única" },
  { value: "TEXTAREA", label: "Área de Texto", description: "Campo de texto multilinha" },
  { value: "WYSIWYG", label: "Texto Rico", description: "Editor de texto rico (WYSIWYG)" },
  { value: "FILE", label: "Upload de Arquivo", description: "Anexo de arquivo" },
  { value: "DATE", label: "Data", description: "Seletor de data" },
  { value: "DATETIME", label: "Data e Hora", description: "Seletor de data e hora" },
  { value: "SELECT", label: "Seleção", description: "Lista suspensa" },
  { value: "NUMBER", label: "Número", description: "Campo numérico" },
  { value: "CHECKBOX", label: "Checkbox", description: "Sim/Não" },
  { value: "URL", label: "URL", description: "Link web" },
  { value: "AD_REFERENCE", label: "Referência de Anúncio", description: "Referência a anúncio (em breve)", disabled: true },
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
       toast.success("Campo criado com sucesso");
       queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
       closeDialog();
     },
     onError: (error: Error) => toast.error(`Error: ${error.message}`),
   });

   const updateFieldMutation = useMutation({
     ...(trpc.contentTypeField.update.mutationOptions as any)(),
     onSuccess: () => {
       toast.success("Campo atualizado com sucesso");
       queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
       closeDialog();
     },
     onError: (error: Error) => toast.error(`Error: ${error.message}`),
   });

   const deleteFieldMutation = useMutation({
     ...(trpc.contentTypeField.delete.mutationOptions as any)(),
     onSuccess: (result: { deleted: boolean; deactivated: boolean }) => {
       toast.success(result.deleted ? "Campo excluído" : "Campo desativado");
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
           <h2 className="text-lg font-semibold text-primary">Campos Personalizados</h2>
             <p className="text-sm text-tertiary mt-1">
               {fields.length} campo(s) configurado(s). Arraste para reordenar.
             </p>
          </div>
           <Button onClick={openCreateDialog} iconLeading={Plus}>
             Adicionar Campo
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
                        {field.required && <Badge color="gray" size="sm">Obrigatório</Badge>}
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
               Nenhum campo configurado. Adicione um para começar.
             </div>
          )}
        </div>
      </div>

       <AlertDialog open={!!fieldToDelete} onOpenChange={(open) => !open && setFieldToDelete(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Excluir campo?</AlertDialogTitle>
             <AlertDialogDescription>
               Isso removerá "{fieldToDelete?.label}" deste tipo de conteúdo.
               Se requests já utilizam este campo, ele será desativado.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancelar</AlertDialogCancel>
             <AlertDialogAction onClick={handleDelete}>
               Excluir
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
                     {editingField ? "Editar Campo" : "Adicionar Campo"}
                   </h2>
                   <p className="text-sm text-tertiary mt-1">
                     {editingField 
                       ? "Atualize as propriedades do campo." 
                       : "Configure um novo campo para este tipo de conteúdo."}
                   </p>
                 </div>
              </div>
            </SlideoutMenu.Header>

            <SlideoutMenu.Content>
              <form id="field-form" onSubmit={handleSubmit} className="space-y-4">
                 {!editingField && (
                   <Input
                     label="Nome do Campo"
                     value={formData.name}
                     onChange={(value) => setFormData({ ...formData, name: value })}
                     placeholder="field_name"
                     hint="Letras minúsculas, números e underscores. Não pode ser alterado depois."
                     isRequired
                     {...{ pattern: "^[a-z][a-z0-9_]*$" }}
                   />
                 )}

                 <Input
                   label="Rótulo de Exibição"
                   value={formData.label}
                   onChange={(value) => setFormData({ ...formData, label: value })}
                   placeholder="Rótulo do Campo"
                   isRequired
                 />

                 {!editingField && (
                   <Select
                     label="Tipo do Campo"
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
                     label="Opções"
                     value={formData.options}
                     onChange={(value) => setFormData({ ...formData, options: value })}
                     placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                     rows={4}
                     hint="Uma opção por linha."
                   />
                 )}

                 {["TEXT", "TEXTAREA", "URL"].includes(formData.fieldType) && (
                   <Input
                     label="Placeholder"
                     value={formData.placeholder}
                     onChange={(value) => setFormData({ ...formData, placeholder: value })}
                     placeholder="Texto de placeholder..."
                   />
                 )}

                 <Input
                   label="Texto de Ajuda"
                   value={formData.helpText}
                   onChange={(value) => setFormData({ ...formData, helpText: value })}
                   placeholder="Instruções adicionais para os usuários..."
                 />

                 <Input
                   label="Valor Padrão"
                   value={formData.defaultValue}
                   onChange={(value) => setFormData({ ...formData, defaultValue: value })}
                   placeholder="Valor padrão deste campo"
                 />

                 <Checkbox
                   label="Campo obrigatório"
                   isSelected={formData.required}
                   onChange={(checked) => 
                     setFormData({ ...formData, required: checked === true })
                   }
                 />
              </form>
            </SlideoutMenu.Content>

             <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
               <Button type="button" color="secondary" onClick={close}>
                 Cancelar
               </Button>
               <Button 
                 type="submit"
                 form="field-form"
                 isDisabled={createFieldMutation.isPending || updateFieldMutation.isPending}
                 isLoading={createFieldMutation.isPending || updateFieldMutation.isPending}
               >
                 {editingField ? "Salvar Alterações" : "Adicionar Campo"}
               </Button>
             </SlideoutMenu.Footer>
          </>
        )}
      </SlideoutMenu>
    </div>
  );
}
