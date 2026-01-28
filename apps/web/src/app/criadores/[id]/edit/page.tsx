"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft } from "@untitledui/icons";
import Link from "next/link";

const creatorTypeLabels: Record<string, string> = {
  UGC_CREATOR: "UGC Creator",
  EMBAIXADOR: "Embaixador",
  ATLETA: "Atleta",
  INFLUENCIADOR: "Influenciador",
  ATOR_MODELO: "Ator/Modelo",
};

function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export default function EditCreatorPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const creatorId = params.id as string;
  
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    type: "UGC_CREATOR" as "UGC_CREATOR" | "EMBAIXADOR" | "ATLETA" | "INFLUENCIADOR" | "ATOR_MODELO",
    responsibleId: "",
    email: "",
    phone: "",
    instagram: "",
    contractStartDate: "",
    contractEndDate: "",
    notes: "",
  });

  const { data: creator, isLoading, isError } = useQuery(
    trpc.creator.getById.queryOptions({ id: creatorId })
  );

  const { data: usersData, isLoading: loadingUsers } = useQuery(
    trpc.user.list.queryOptions({ limit: 100 })
  );

  useEffect(() => {
    if (creator) {
      setFormData({
        name: creator.name,
        imageUrl: creator.imageUrl || "",
        type: creator.type,
        responsibleId: creator.responsibleId,
        email: creator.email || "",
        phone: creator.phone || "",
        instagram: creator.instagram || "",
        contractStartDate: formatDateForInput(creator.contractStartDate),
        contractEndDate: formatDateForInput(creator.contractEndDate),
        notes: creator.notes || "",
      });
    }
  }, [creator]);

  const updateMutation = useMutation({
    ...(trpc.creator.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Criador atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [["creator"]] });
      router.push("/criadores" as any);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    
    if (!formData.responsibleId) {
      toast.error("Responsável é obrigatório");
      return;
    }

    (updateMutation.mutate as any)({
      id: creatorId,
      name: formData.name,
      imageUrl: formData.imageUrl || null,
      type: formData.type,
      responsibleId: formData.responsibleId,
      email: formData.email || null,
      phone: formData.phone || null,
      instagram: formData.instagram || null,
      contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate) : null,
      contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : null,
      notes: formData.notes || null,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !creator) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href={"/criadores" as any}>
            <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Criador não encontrado</h1>
            <p className="text-muted-foreground">O criador solicitado não existe ou foi removido.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={"/criadores" as any}>
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Criador</h1>
          <p className="text-muted-foreground">Atualize as informações de {creator.name}.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do criador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome *"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="Nome completo"
                isRequired
              />
              <Input
                label="Foto (URL)"
                value={formData.imageUrl}
                onChange={(value) => setFormData({ ...formData, imageUrl: value })}
                placeholder="https://exemplo.com/foto.jpg"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tipo *"
                  selectedKey={formData.type}
                  onSelectionChange={(key) => setFormData({ ...formData, type: key as any })}
                >
                  {Object.entries(creatorTypeLabels).map(([value, label]) => (
                    <Select.Item key={value} id={value} label={label} />
                  ))}
                </Select>
                <Select
                  label="Responsável *"
                  selectedKey={formData.responsibleId}
                  onSelectionChange={(key) => setFormData({ ...formData, responsibleId: key as string })}
                  isDisabled={loadingUsers}
                  placeholder={loadingUsers ? "Carregando..." : "Selecione..."}
                >
                  {usersData?.items.map((user) => (
                    <Select.Item key={user.id} id={user.id} label={user.name || user.email} />
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
              <CardDescription>Informações de contato do criador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                  placeholder="email@exemplo.com"
                />
                <Input
                  label="Telefone/WhatsApp"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <Input
                label="Instagram"
                value={formData.instagram}
                onChange={(value) => setFormData({ ...formData, instagram: value })}
                placeholder="@usuario"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contrato</CardTitle>
              <CardDescription>Período de vigência do contrato (opcional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary mb-1.5 block">Data Início</label>
                  <ShadcnInput
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary mb-1.5 block">Data Fim</label>
                  <ShadcnInput
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>Notas adicionais sobre o criador</CardDescription>
            </CardHeader>
            <CardContent>
              <TextArea
                value={formData.notes}
                onChange={(value) => setFormData({ ...formData, notes: value })}
                placeholder="Observações, preferências, histórico..."
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={"/criadores" as any}>
              <Button color="secondary">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              isDisabled={updateMutation.isPending}
              isLoading={updateMutation.isPending}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
