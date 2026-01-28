"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input as UntitledInput } from "@/components/base/input/input";
import { TextArea as UntitledTextArea } from "@/components/base/textarea/textarea";
import { Input } from "@/components/ui/input";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { toast } from "sonner";
import { Save01, X } from "@untitledui/icons";

interface NewContentTypeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewContentTypeDrawer({ open, onOpenChange }: NewContentTypeDrawerProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#7F56D9");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setDescription("");
      setIcon("");
      setColor("#7F56D9");
      setIsSlugManuallyEdited(false);
    }
  }, [open]);

  const createMutation = useMutation({
    ...(trpc.contentType.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tipo de conteúdo criado com sucesso");
      queryClient.invalidateQueries({ queryKey: [["contentType"]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setIsSlugManuallyEdited(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (createMutation.mutate as any)({
      name,
      slug,
      description: description || undefined,
      icon: icon || undefined,
      color,
    });
  };

  const isValid = name.trim() && slug.trim();

  return (
    <SlideoutMenu isOpen={open} onOpenChange={onOpenChange}>
      {({ close }) => (
        <>
          <div className="relative z-1 flex items-start justify-between w-full px-4 pt-6 md:px-6">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={close}
                className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                aria-label="Fechar"
              >
                <FeaturedIcon 
                  icon={X} 
                  theme="light" 
                  color="gray" 
                  size="md"
                />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Novo Tipo de Conteúdo
                </h2>
                <p className="text-sm text-tertiary mt-1">
                  Defina as propriedades para este tipo de conteúdo.
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            <form id="new-content-type-form" onSubmit={handleSubmit} className="space-y-5">
              <UntitledInput 
                label="Nome"
                value={name} 
                onChange={handleNameChange} 
                placeholder="Ex: Post de Blog" 
                isRequired
              />
              
              <UntitledInput 
                label="Slug"
                value={slug} 
                onChange={handleSlugChange} 
                placeholder="Ex: post-de-blog" 
                isRequired
                hint="Identificador único usado em URLs e chamadas de API."
              />

              <UntitledTextArea 
                label="Descrição"
                value={description} 
                onChange={setDescription} 
                placeholder="Descreva para que serve este tipo de conteúdo..." 
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <UntitledInput 
                  label="Nome do Ícone"
                  value={icon} 
                  onChange={setIcon} 
                  placeholder="Ex: file-text" 
                  hint="Nome do ícone Lucide (opcional)."
                />

                <div className="space-y-1.5">
                  <UntitledInput 
                    label="Cor"
                    value={color} 
                    onChange={setColor} 
                    placeholder="#7F56D9" 
                    isRequired
                  />
                  <Input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="w-full h-10 p-1 cursor-pointer rounded-lg"
                  />
                </div>
              </div>
            </form>
          </SlideoutMenu.Content>

          <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
            <Button
              type="button"
              color="secondary"
              onClick={close}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              form="new-content-type-form"
              color="primary"
              isDisabled={!isValid || createMutation.isPending}
              isLoading={createMutation.isPending}
              iconLeading={Save01}
            >
              Criar Tipo de Conteúdo
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
