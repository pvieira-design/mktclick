"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save01, X, Plus, Trash01, Key01 } from "@untitledui/icons";

interface EditUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

const positionLabels: Record<string, string> = {
  HEAD: "Líder",
  COORDINATOR: "Coordenador",
  STAFF: "Membro",
};

export function EditUserDrawer({ open, onOpenChange, userId }: EditUserDrawerProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | "SUPER_ADMIN">("USER");
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<"HEAD" | "COORDINATOR" | "STAFF">("STAFF");

  const { data: userData, isLoading: isUserLoading } = useQuery({
    ...trpc.user.getById.queryOptions({ id: userId! }),
    enabled: !!userId && open,
  });

  const { data: areasData } = useQuery({
    ...trpc.area.list.queryOptions(),
    enabled: open,
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setRole(userData.role);
      setBanned(userData.banned || false);
      setBanReason(userData.banReason || "");
    }
  }, [userData]);

  useEffect(() => {
    if (!open) {
      setName("");
      setRole("USER");
      setBanned(false);
      setBanReason("");
      setNewPassword("");
      setSelectedAreaId("");
      setSelectedPosition("STAFF");
    }
  }, [open]);

  const updateUserMutation = useMutation({
    ...(trpc.user.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: [["user"]] });
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetPasswordMutation = useMutation({
    ...(trpc.user.resetPassword.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso");
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: [["user"]] });
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const addToAreaMutation = useMutation({
    ...(trpc.user.addToArea.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Adicionado à área com sucesso");
      queryClient.invalidateQueries({ queryKey: [["user"]] });
      setSelectedAreaId("");
      setSelectedPosition("STAFF");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const removeFromAreaMutation = useMutation({
    ...(trpc.user.removeFromArea.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Removido da área");
      queryClient.invalidateQueries({ queryKey: [["user"]] });
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    (updateUserMutation.mutate as any)({
      id: userId,
      name,
      role,
      banned,
      banReason: banned ? banReason : undefined,
    });
  };

  const handleResetPassword = () => {
    if (!userId) return;
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    (resetPasswordMutation.mutate as any)({ id: userId, newPassword });
  };

  const handleAddToArea = () => {
    if (!userId || !selectedAreaId) return;
    (addToAreaMutation.mutate as any)({
      userId,
      areaId: selectedAreaId,
      position: selectedPosition,
    });
  };

  const handleRemoveFromArea = (areaId: string) => {
    if (!userId) return;
    (removeFromAreaMutation.mutate as any)({ userId, areaId });
  };

  const availableAreas =
    areasData?.items.filter(
      (area) => !userData?.areaMemberships.some((m) => m.area.id === area.id)
    ) || [];

  const isValid = name.trim();

  return (
    <SlideoutMenu isOpen={open} onOpenChange={onOpenChange} className="!max-w-[600px]">
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
                <h2 className="text-lg font-semibold text-primary">Editar Usuário</h2>
                <p className="text-sm text-tertiary mt-1">
                  {userData?.email || "Carregando..."}
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            {isUserLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !userData ? (
              <div className="text-center py-8 text-tertiary">
                Usuário não encontrado
              </div>
            ) : (
              <div className="space-y-6">
                <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                    Informações Básicas
                  </h3>

                  <Input
                    label="Email"
                    value={userData.email}
                    isDisabled
                    hint="O email não pode ser alterado."
                  />

                  <Input
                    label="Nome"
                    value={name}
                    onChange={setName}
                    placeholder="João Silva"
                    isRequired
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

                  <div className="flex items-center justify-between p-3 rounded-lg border border-secondary">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-primary">Banido</p>
                      <p className="text-xs text-tertiary">Impedir usuário de fazer login</p>
                    </div>
                    <Checkbox isSelected={banned} onChange={setBanned} />
                  </div>

                  {banned && (
                    <TextArea
                      label="Motivo do Banimento"
                      value={banReason}
                      onChange={setBanReason}
                      placeholder="Motivo do banimento..."
                      rows={2}
                    />
                  )}
                </form>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                    Redefinir Senha
                  </h3>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Nova senha (mín. 8 caracteres)"
                      />
                    </div>
                    <Button
                      type="button"
                      color="secondary"
                      size="sm"
                      onClick={handleResetPassword}
                      isDisabled={resetPasswordMutation.isPending || newPassword.length < 8}
                      isLoading={resetPasswordMutation.isPending}
                      iconLeading={Key01}
                    >
                      Redefinir
                    </Button>
                  </div>

                  {userData.mustChangePassword && (
                    <p className="text-sm text-warning-primary">
                      O usuário deve alterar a senha no próximo login.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                    Áreas
                  </h3>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        aria-label="Área"
                        selectedKey={selectedAreaId || null}
                        onSelectionChange={(key) => setSelectedAreaId((key as string) || "")}
                        placeholder="Selecione uma área..."
                      >
                        {availableAreas.map((area) => (
                          <Select.Item key={area.id} id={area.id} label={area.name} />
                        ))}
                      </Select>
                    </div>
                    <div className="w-[120px]">
                      <Select
                        aria-label="Cargo"
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
                      onClick={handleAddToArea}
                      isDisabled={!selectedAreaId || addToAreaMutation.isPending}
                      isLoading={addToAreaMutation.isPending}
                      iconLeading={Plus}
                    />
                  </div>

                  {userData.areaMemberships.length > 0 ? (
                    <div className="space-y-2">
                      {userData.areaMemberships.map((membership) => (
                        <div
                          key={membership.area.id}
                          className="flex items-center justify-between p-3 rounded-md border border-secondary"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">
                              {membership.area.name}
                            </span>
                            <Badge color="gray" type="pill-color" size="sm">
                              {positionLabels[membership.position]}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            color="tertiary-destructive"
                            size="sm"
                            iconLeading={Trash01}
                            onClick={() => handleRemoveFromArea(membership.area.id)}
                            isDisabled={removeFromAreaMutation.isPending}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-tertiary">
                      Usuário não está atribuído a nenhuma área.
                    </p>
                  )}
                </div>
              </div>
            )}
          </SlideoutMenu.Content>

          <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
            <Button type="button" color="secondary" onClick={close}>
              Fechar
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              color="primary"
              isDisabled={!isValid || updateUserMutation.isPending || isUserLoading}
              isLoading={updateUserMutation.isPending}
              iconLeading={Save01}
            >
              Salvar Alterações
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
