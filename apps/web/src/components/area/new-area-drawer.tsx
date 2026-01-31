"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { toast } from "sonner";
import { Save01, X } from "@untitledui/icons";

interface NewAreaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAreaDrawer({ open, onOpenChange }: NewAreaDrawerProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setDescription("");
      setIsSlugManuallyEdited(false);
    }
  }, [open]);

  const createMutation = useMutation({
    ...(trpc.area.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Área criada com sucesso");
      queryClient.invalidateQueries({ queryKey: [["area"]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
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
                <FeaturedIcon icon={X} theme="light" color="gray" size="md" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-primary">Nova Área</h2>
                <p className="text-sm text-tertiary mt-1">
                  Crie uma nova área de trabalho ou equipe.
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            <form id="new-area-form" onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nome"
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Time de Design"
                isRequired
              />

              <Input
                label="Slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="Ex: time-de-design"
                isRequired
                hint="Identificador único usado em URLs e chamadas de API."
              />

              <TextArea
                label="Descrição"
                value={description}
                onChange={setDescription}
                placeholder="Descreva qual é a responsabilidade desta área..."
                rows={3}
              />
            </form>
          </SlideoutMenu.Content>

          <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
            <Button type="button" color="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-area-form"
              color="primary"
              isDisabled={!isValid || createMutation.isPending}
              isLoading={createMutation.isPending}
              iconLeading={Save01}
            >
              Criar Área
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
