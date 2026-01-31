"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { toast } from "sonner";
import { Save01, X, Plus } from "@untitledui/icons";

interface NewUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AreaAssignment {
  areaId: string;
  areaName: string;
  position: "HEAD" | "COORDINATOR" | "STAFF";
}

const positionLabels: Record<string, string> = {
  HEAD: "Líder",
  COORDINATOR: "Coordenador",
  STAFF: "Membro",
};

export function NewUserDrawer({ open, onOpenChange }: NewUserDrawerProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | "SUPER_ADMIN">("USER");
  const [areaAssignments, setAreaAssignments] = useState<AreaAssignment[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<"HEAD" | "COORDINATOR" | "STAFF">("STAFF");

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setAreaAssignments([]);
      setSelectedAreaId("");
      setSelectedPosition("STAFF");
    }
  }, [open]);

  const { data: areasData } = useQuery(trpc.area.list.queryOptions());

  const createMutation = useMutation({
    ...(trpc.user.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Usuário criado com sucesso");
      queryClient.invalidateQueries({ queryKey: [["user"]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (createMutation.mutate as any)({
      name,
      email,
      password,
      role,
      areaAssignments: areaAssignments.map((a) => ({
        areaId: a.areaId,
        position: a.position,
      })),
    });
  };

  const handleAddArea = () => {
    if (!selectedAreaId) return;

    const area = areasData?.items.find((a) => a.id === selectedAreaId);
    if (!area) return;

    if (areaAssignments.some((a) => a.areaId === selectedAreaId)) {
      toast.error("Usuário já está atribuído a esta área");
      return;
    }

    setAreaAssignments([
      ...areaAssignments,
      {
        areaId: selectedAreaId,
        areaName: area.name,
        position: selectedPosition,
      },
    ]);
    setSelectedAreaId("");
    setSelectedPosition("STAFF");
  };

  const handleRemoveArea = (areaId: string) => {
    setAreaAssignments(areaAssignments.filter((a) => a.areaId !== areaId));
  };

  const availableAreas =
    areasData?.items.filter(
      (area) => !areaAssignments.some((a) => a.areaId === area.id)
    ) || [];

  const isValid = name.trim() && email.trim() && password.trim();

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
                <h2 className="text-lg font-semibold text-primary">Novo Usuário</h2>
                <p className="text-sm text-tertiary mt-1">
                  Adicione um novo usuário ao sistema.
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            <form id="new-user-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                  Informações Básicas
                </h3>

                <Input
                  label="Nome"
                  value={name}
                  onChange={setName}
                  placeholder="João Silva"
                  isRequired
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="joao@exemplo.com"
                  isRequired
                />

                <Input
                  label="Senha Temporária"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  isRequired
                  hint="O usuário deverá alterar esta senha no primeiro login."
                />

                <Select
                  label="Função"
                  selectedKey={role}
                  onSelectionChange={(key) => setRole(key as typeof role)}
                >
                  <Select.Item id="USER" label="Usuário" />
                  <Select.Item id="ADMIN" label="Admin" />
                  <Select.Item id="SUPER_ADMIN" label="Super Admin" />
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                  Atribuição de Áreas
                </h3>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      selectedKey={selectedAreaId || null}
                      onSelectionChange={(key) => setSelectedAreaId((key as string) || "")}
                      placeholder="Selecione uma área..."
                    >
                      {availableAreas.map((area) => (
                        <Select.Item key={area.id} id={area.id} label={area.name} />
                      ))}
                    </Select>
                  </div>
                  <div className="w-[130px]">
                    <Select
                      selectedKey={selectedPosition}
                      onSelectionChange={(key) => setSelectedPosition(key as typeof selectedPosition)}
                    >
                      <Select.Item id="HEAD" label="Líder" />
                      <Select.Item id="COORDINATOR" label="Coordenador" />
                      <Select.Item id="STAFF" label="Membro" />
                    </Select>
                  </div>
                  <Button
                    type="button"
                    color="secondary"
                    size="sm"
                    iconLeading={Plus}
                    onClick={handleAddArea}
                    isDisabled={!selectedAreaId}
                  />
                </div>

                {areaAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {areaAssignments.map((assignment) => (
                      <div
                        key={assignment.areaId}
                        className="flex items-center justify-between p-3 rounded-md border border-secondary"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">
                            {assignment.areaName}
                          </span>
                          <Badge color="gray" type="pill-color" size="sm">
                            {positionLabels[assignment.position]}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          color="tertiary"
                          size="sm"
                          iconLeading={X}
                          onClick={() => handleRemoveArea(assignment.areaId)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-tertiary">
                    Nenhuma área atribuída ainda.
                  </p>
                )}
              </div>
            </form>
          </SlideoutMenu.Content>

          <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
            <Button type="button" color="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-user-form"
              color="primary"
              isDisabled={!isValid || createMutation.isPending}
              isLoading={createMutation.isPending}
              iconLeading={Save01}
            >
              Criar Usuário
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
