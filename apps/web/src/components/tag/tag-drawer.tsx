"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { toast } from "sonner";
import { Save01, X, Tag01 } from "@untitledui/icons";
import { cx } from "@/lib/utils/cx";
import type { BadgeColors } from "@/components/base/badges/badge-types";
import { filledColors } from "@/components/base/badges/badges";

type TagGroup = "FILE" | "REQUEST";

const TAG_GROUP_LABELS: Record<TagGroup, string> = {
  FILE: "Arquivos",
  REQUEST: "Requests",
};

const TAG_COLORS: { value: BadgeColors; label: string }[] = [
  { value: "warning", label: "Amarelo" },
  { value: "orange", label: "Laranja" },
  { value: "error", label: "Vermelho" },
  { value: "success", label: "Verde" },
  { value: "blue-light", label: "Azul claro" },
  { value: "blue", label: "Azul" },
  { value: "brand", label: "Marca" },
  { value: "purple", label: "Roxo" },
  { value: "gray-blue", label: "Cinza azul" },
  { value: "pink", label: "Rosa" },
  { value: "indigo", label: "Indigo" },
  { value: "gray", label: "Cinza" },
];

interface TagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTag?: {
    id: string;
    name: string;
    color: string;
    group: TagGroup;
  } | null;
}

export function TagDrawer({ open, onOpenChange, editingTag }: TagDrawerProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState<BadgeColors>("gray");
  const [group, setGroup] = useState<TagGroup>("FILE");

  const isEditing = !!editingTag;

  useEffect(() => {
    if (open && editingTag) {
      setName(editingTag.name);
      setColor((editingTag.color || "gray") as BadgeColors);
      setGroup(editingTag.group || "FILE");
    } else if (!open) {
      setName("");
      setColor("gray");
      setGroup("FILE");
    }
  }, [open, editingTag]);

  const createMutation = useMutation({
    ...(trpc.fileTag.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tag criada com sucesso");
      queryClient.invalidateQueries({ queryKey: [["fileTag", "list"]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    ...(trpc.fileTag.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Tag atualizada");
      queryClient.invalidateQueries({ queryKey: [["fileTag", "list"]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing) {
      (updateMutation.mutate as any)({
        id: editingTag.id,
        name: name.trim(),
        color,
        group,
      });
    } else {
      (createMutation.mutate as any)({
        name: name.trim(),
        color,
        group,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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
                  {isEditing ? "Editar Tag" : "Nova Tag"}
                </h2>
                <p className="text-sm text-tertiary mt-1">
                  {isEditing
                    ? "Atualize o nome e a cor desta tag."
                    : "Defina o nome e a cor para a nova tag."}
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            <form id="tag-drawer-form" onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nome"
                value={name}
                onChange={setName}
                placeholder="Ex: Branding, Social Media..."
                isRequired
                autoFocus
              />

              <Select
                label="Grupo"
                selectedKey={group}
                onSelectionChange={(key) => setGroup(key as TagGroup)}
                placeholder="Selecione o grupo"
              >
                {(Object.entries(TAG_GROUP_LABELS) as [TagGroup, string][]).map(
                  ([value, label]) => (
                    <Select.Item key={value} id={value} label={label} />
                  )
                )}
              </Select>

              <div>
                <p className="text-sm font-semibold text-primary mb-1">Cores</p>
                <p className="text-sm text-tertiary mb-4">Selecione uma cor</p>
                <div className="grid grid-cols-8 gap-2">
                  {TAG_COLORS.map((option) => {
                    const isSelected = color === option.value;
                    const styles = filledColors[option.value];
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setColor(option.value)}
                        className={cx(
                          "flex items-center justify-center size-10 rounded-full ring-1 ring-inset text-xs font-semibold transition-all cursor-pointer",
                          styles.root,
                          isSelected && "ring-2 ring-offset-2 ring-offset-primary",
                        )}
                        title={option.label}
                      >
                        Aa
                      </button>
                    );
                  })}
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
              form="tag-drawer-form"
              color="primary"
              isDisabled={!name.trim() || isPending}
              isLoading={isPending}
              iconLeading={isEditing ? Save01 : Tag01}
            >
              {isEditing ? "Salvar" : "Criar Tag"}
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
