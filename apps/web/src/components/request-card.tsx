import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    contentType: string;
    status: string;
    origin: string;
    priority: string;
    deadline: Date | null;
    createdAt: Date;
    createdBy: { name: string | null };
  };
}

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING: "Pendente",
  IN_REVIEW: "Em Revisão",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CORRECTED: "Corrigido",
  CANCELLED: "Cancelado",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PENDING: "secondary",
  IN_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  CORRECTED: "secondary",
  CANCELLED: "outline",
};

const contentTypeLabels: Record<string, string> = {
  VIDEO_UGC: "Vídeo UGC",
  VIDEO_INSTITUCIONAL: "Vídeo Institucional",
  CARROSSEL: "Carrossel",
  POST_UNICO: "Post Único",
  STORIES: "Stories",
  REELS: "Reels",
};

const originLabels: Record<string, string> = {
  OSLO: "Oslo",
  INTERNO: "Interno",
  INFLUENCER: "Influencer",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export function RequestCard({ request }: RequestCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold leading-none tracking-tight">
          <Link href={`/requests/${request.id}` as any} className="hover:underline decoration-primary underline-offset-4">
            {request.title}
          </Link>
        </CardTitle>
        <Badge variant={statusVariants[request.status] || "outline"}>
          {statusLabels[request.status] || request.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {contentTypeLabels[request.contentType] || request.contentType}
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span>{originLabels[request.origin] || request.origin}</span>
          <span className="text-muted-foreground/40">|</span>
          <span className={request.priority === "URGENT" ? "text-destructive font-medium" : ""}>
            {priorityLabels[request.priority] || request.priority}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
        <div>
          Criado por <span className="font-medium text-foreground">{request.createdBy.name || "Desconhecido"}</span> em {formatDate(request.createdAt)}
        </div>
        {request.deadline && (
          <div className="font-medium">
            Prazo: {formatDate(request.deadline)}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
