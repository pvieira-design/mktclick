"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { TextArea } from "@/components/base/textarea/textarea";
import { trpc } from "@/utils/trpc";
import { ChevronDown, ChevronUp } from "@untitledui/icons";

const PHASE_NAMES: Record<number, string> = {
  1: "Briefing",
  2: "Roteiro",
  3: "Elenco",
  4: "Producao",
  5: "Revisao",
  6: "Publicacao",
};

const PHASE_COLORS: Record<number, "gray" | "blue" | "brand" | "orange" | "warning" | "success"> = {
  1: "gray",
  2: "blue",
  3: "brand",
  4: "orange",
  5: "warning",
  6: "success",
};

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface VideoCommentsProps {
  videoId: string;
}

export function VideoComments({ videoId }: VideoCommentsProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    ...trpc.adVideoComment.list.queryOptions({ videoId }),
    enabled: isOpen,
  });

  const createComment = useMutation({
    ...trpc.adVideoComment.create.mutationOptions(),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({
        queryKey: [["adVideoComment", "list"]],
      });
      toast.success("Observacao adicionada");
    },
    onError: (err: any) =>
      toast.error(err.message || "Erro ao adicionar observacao"),
  });

  const commentCount = comments?.length ?? 0;

  return (
    <div className="mt-3 border-t border-secondary pt-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left cursor-pointer group"
      >
        <span className="text-xs font-medium text-tertiary group-hover:text-secondary transition-colors">
          Observacoes{commentCount > 0 ? ` (${commentCount})` : ""}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-quaternary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-quaternary" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <p className="text-xs text-quaternary text-center py-2">
              Carregando...
            </p>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="flex gap-2.5"
                >
                  <Avatar
                    src={comment.user.image}
                    alt={comment.user.name || ""}
                    size="sm"
                    initials={
                      comment.user.name
                        ? comment.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-primary">
                        {comment.user.name}
                      </span>
                      <Badge
                        type="pill-color"
                        size="sm"
                        color={PHASE_COLORS[comment.projectPhase] || "gray"}
                      >
                        Fase {comment.projectPhase}: {PHASE_NAMES[comment.projectPhase] || "?"}
                      </Badge>
                      <span className="text-xs text-quaternary">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-quaternary text-center py-1">
              Nenhuma observacao
            </p>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <TextArea
                value={content}
                onChange={(v: string) => setContent(v)}
                rows={2}
                placeholder="Adicionar observacao..."
              />
            </div>
            <Button
              size="sm"
              color="primary"
              onClick={() =>
                createComment.mutate({ videoId, content: content.trim() })
              }
              isDisabled={
                !content.trim() || createComment.isPending
              }
            >
              {createComment.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
