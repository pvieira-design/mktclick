"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input as UntitledInput } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save01 } from "@untitledui/icons";
import Link from "next/link";

export default function EditContentTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#000000");

  const { data, isLoading } = useQuery(
    trpc.contentType.getById.queryOptions({ id })
  );

  const updateMutation = useMutation({
    ...(trpc.contentType.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tipo de conteúdo atualizado com sucesso");
      router.push("/admin/content-types" as any);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setSlug(data.slug);
      setDescription(data.description || "");
      setIcon(data.icon || "");
      setColor(data.color || "#000000");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (updateMutation.mutate as any)({
      id,
      name,
      slug,
      description: description || undefined,
      icon: icon || undefined,
      color,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
          <div className="px-6 pt-6 space-y-2">
            <Skeleton className="h-6 w-[150px] rounded-md" />
            <Skeleton className="h-4 w-[250px] rounded-md" />
          </div>
          <div className="space-y-4 px-6 pb-6 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[80px] rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-6">
            <h2 className="text-lg font-semibold text-primary">Detalhes do Tipo de Conteúdo</h2>
            <p className="text-sm text-tertiary mt-1">
              Modifique as propriedades deste tipo de conteúdo.
            </p>
          </div>
          <div className="space-y-4 px-6 pb-6 pt-4">
            <UntitledInput
              label="Nome"
              value={name}
              onChange={(value) => setName(value)}
              placeholder="Ex: Post de Blog"
              isRequired
            />

            <UntitledInput
              label="Slug"
              value={slug}
              onChange={(value) => setSlug(value)}
              placeholder="Ex: post-de-blog"
              isRequired
              hint="Identificador único usado em URLs e chamadas de API."
            />

            <TextArea
              label="Descrição"
              value={description}
              onChange={(value) => setDescription(value)}
              placeholder="Descreva para que serve este tipo de conteúdo..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <UntitledInput
                label="Nome do Ícone"
                value={icon}
                onChange={(value) => setIcon(value)}
                placeholder="Ex: file-text"
                hint="Nome do ícone Lucide (opcional)."
              />

              <div className="space-y-1.5">
                <UntitledInput
                  label="Cor"
                  value={color}
                  onChange={(value) => setColor(value)}
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
            <Link href="/admin/content-types">
              <Button color="secondary">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              isDisabled={updateMutation.isPending}
              isLoading={updateMutation.isPending}
              iconLeading={Save01}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
