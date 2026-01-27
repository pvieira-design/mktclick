"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { ArrowLeft } from "lucide-react";
import { useContentTypes, useOrigins } from "@/hooks/use-metadata";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type Patologia = "INSONIA" | "ANSIEDADE" | "DOR" | "ESTRESSE" | "INFLAMACAO" | "OUTRO";

const priorityLabels: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const patologiaLabels: Record<Patologia, string> = {
  INSONIA: "Insônia",
  ANSIEDADE: "Ansiedade",
  DOR: "Dor",
  ESTRESSE: "Estresse",
  INFLAMACAO: "Inflamação",
  OUTRO: "Outro",
};

interface CreateRequestPayload {
  title: string;
  description: string;
  contentTypeId: string;
  originId: string;
  priority?: Priority;
  deadline?: Date;
  patologia?: Patologia;
}

export default function NewRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: contentTypes, isLoading: loadingContentTypes } = useContentTypes();
  const { data: origins, isLoading: loadingOrigins } = useOrigins();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentTypeId: "",
    originId: "",
    priority: "MEDIUM" as Priority,
    deadline: "",
    patologia: "" as Patologia | "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    ...(trpc.request.create.mutationOptions as any)(),
    onSuccess: (data: { id: string }) => {
      toast.success("Request criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["request", "list"] });
      router.push(`/requests/${data.id}` as any);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar request");
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = "Título deve ter pelo menos 3 caracteres";
    }
    if (formData.title.length > 200) {
      newErrors.title = "Título deve ter no máximo 200 caracteres";
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Descrição deve ter pelo menos 10 caracteres";
    }
    if (formData.description.length > 5000) {
      newErrors.description = "Descrição deve ter no máximo 5000 caracteres";
    }
    if (!formData.contentTypeId) {
      newErrors.contentTypeId = "Tipo de conteúdo é obrigatório";
    }
    if (!formData.originId) {
      newErrors.originId = "Origem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const payload: CreateRequestPayload = {
      title: formData.title,
      description: formData.description,
      contentTypeId: formData.contentTypeId,
      originId: formData.originId,
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      patologia: formData.patologia ? formData.patologia as Patologia : undefined,
    };

    createMutation.mutate(payload as any);
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Novo Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Digite o título do request"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o request em detalhes (mínimo 10 caracteres)"
                className={`min-h-32 ${errors.description ? "border-destructive" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/5000 caracteres
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Conteúdo *</Label>
                <Select
                  value={formData.contentTypeId}
                  onValueChange={(value) => setFormData({ ...formData, contentTypeId: value || "" })}
                  disabled={loadingContentTypes}
                >
                  <SelectTrigger className={errors.contentTypeId ? "border-destructive" : ""}>
                    <SelectValue placeholder={loadingContentTypes ? "Carregando..." : "Selecione o tipo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes?.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contentTypeId && (
                  <p className="text-sm text-destructive">{errors.contentTypeId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Origem *</Label>
                <Select
                  value={formData.originId}
                  onValueChange={(value) => setFormData({ ...formData, originId: value || "" })}
                  disabled={loadingOrigins}
                >
                  <SelectTrigger className={errors.originId ? "border-destructive" : ""}>
                    <SelectValue placeholder={loadingOrigins ? "Carregando..." : "Selecione a origem"} />
                  </SelectTrigger>
                  <SelectContent>
                    {origins?.map((origin) => (
                      <SelectItem key={origin.id} value={origin.id}>{origin.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.originId && (
                  <p className="text-sm text-destructive">{errors.originId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(priorityLabels) as [Priority, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo (opcional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Patologia (opcional)</Label>
              <Select
                value={formData.patologia}
                onValueChange={(value) => setFormData({ ...formData, patologia: value as Patologia })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a patologia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {(Object.entries(patologiaLabels) as [Patologia, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
