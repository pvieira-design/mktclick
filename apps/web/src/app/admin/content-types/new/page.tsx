"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input as UntitledInput } from "@/components/base/input/input";
import { TextArea as UntitledTextArea } from "@/components/base/textarea/textarea";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { ArrowLeft, Save01 } from "@untitledui/icons";


export default function NewContentTypePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#000000");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const createMutation = useMutation({
    ...(trpc.contentType.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tipo de conteúdo criado com sucesso");
      router.push("/admin/content-types" as any);
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          href="/admin/content-types" 
          color="tertiary"
          iconLeading={ArrowLeft}
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Tipo de Conteúdo</h1>
          <p className="text-tertiary">Crie uma nova definição de tipo de conteúdo.</p>
        </div>
      </div>

      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary overflow-visible">
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-6">
            <h2 className="text-lg font-semibold text-primary">Detalhes do Tipo de Conteúdo</h2>
            <p className="text-sm text-tertiary mt-1">
              Defina as propriedades para este tipo de conteúdo.
            </p>
          </div>
          <div className="space-y-4 overflow-visible px-6 pb-6 pt-4">
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
                  placeholder="#000000" 
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
          </div>
          <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
            <Button 
              href="/admin/content-types"
              color="tertiary"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              color="primary"
              isDisabled={createMutation.isPending}
              isLoading={createMutation.isPending}
              iconLeading={Save01}
            >
              Criar Tipo de Conteúdo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
