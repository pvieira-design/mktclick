"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

type ContentType = "VIDEO_UGC" | "VIDEO_INSTITUCIONAL" | "CARROSSEL" | "POST_UNICO" | "STORIES" | "REELS";
type RequestOrigin = "OSLO" | "INTERNO" | "INFLUENCER";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type Patologia = "INSONIA" | "ANSIEDADE" | "DOR" | "ESTRESSE" | "INFLAMACAO" | "OUTRO";

const contentTypeLabels: Record<ContentType, string> = {
  VIDEO_UGC: "Vídeo UGC",
  VIDEO_INSTITUCIONAL: "Vídeo Institucional",
  CARROSSEL: "Carrossel",
  POST_UNICO: "Post Único",
  STORIES: "Stories",
  REELS: "Reels",
};

const originLabels: Record<RequestOrigin, string> = {
  OSLO: "Oslo",
  INTERNO: "Interno",
  INFLUENCER: "Influencer",
};

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

interface RequestData {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  status: string;
  origin: RequestOrigin;
  priority: Priority;
  deadline: string | null;
  patologia: Patologia | null;
}

export default function EditRequestPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentType: "" as ContentType | "",
    origin: "" as RequestOrigin | "",
    priority: "MEDIUM" as Priority,
    deadline: "",
    patologia: "" as Patologia | "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: request, isLoading } = useQuery<RequestData>(
    (trpc.request.getById.queryOptions as any)({ id: requestId })
  );

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title,
        description: request.description,
        contentType: request.contentType,
        origin: request.origin,
        priority: request.priority,
        deadline: request.deadline ? request.deadline.split("T")[0] : "",
        patologia: request.patologia || "",
      });
    }
  }, [request]);

  const isRejected = request?.status === "REJECTED";

  const updateMutation = useMutation({
    ...(trpc.request.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request atualizado!");
      queryClient.invalidateQueries({ queryKey: ["request"] });
      router.push(`/requests/${requestId}` as any);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const correctMutation = useMutation({
    ...(trpc.request.correct.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request corrigido e resubmetido!");
      queryClient.invalidateQueries({ queryKey: ["request"] });
      router.push(`/requests/${requestId}` as any);
    },
    onError: (error: Error) => toast.error(error.message),
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
    if (!formData.contentType) {
      newErrors.contentType = "Tipo de conteúdo é obrigatório";
    }
    if (!formData.origin) {
      newErrors.origin = "Origem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const payload = {
      id: requestId,
      title: formData.title,
      description: formData.description,
      contentType: formData.contentType as ContentType,
      origin: formData.origin as RequestOrigin,
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      patologia: formData.patologia ? formData.patologia as Patologia : undefined,
    };

    if (isRejected) {
      correctMutation.mutate(payload as any);
    } else {
      updateMutation.mutate(payload as any);
    }
  };

  const isPending = updateMutation.isPending || correctMutation.isPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Request não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (request.status !== "DRAFT" && request.status !== "REJECTED") {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Este request não pode ser editado</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(`/requests/${requestId}` as any)}>
            Ver Detalhes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link 
          href={`/requests/${requestId}` as any}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isRejected ? "Corrigir Request" : "Editar Request"}
          </CardTitle>
          {isRejected && (
            <p className="text-sm text-muted-foreground">
              Corrija o request e ele será automaticamente resubmetido para revisão.
            </p>
          )}
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
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value as ContentType })}
                >
                  <SelectTrigger className={errors.contentType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(contentTypeLabels) as [ContentType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contentType && (
                  <p className="text-sm text-destructive">{errors.contentType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Origem *</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value) => setFormData({ ...formData, origin: value as RequestOrigin })}
                >
                  <SelectTrigger className={errors.origin ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(originLabels) as [RequestOrigin, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.origin && (
                  <p className="text-sm text-destructive">{errors.origin}</p>
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
                onClick={() => router.push(`/requests/${requestId}` as any)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending 
                  ? (isRejected ? "Corrigindo..." : "Salvando...") 
                  : (isRejected ? "Corrigir e Resubmeter" : "Salvar Alterações")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
