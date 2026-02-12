"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  LinkExternal02,
  Phone,
  Mail01,
  User01,
} from "@untitledui/icons";

interface CreatorLeadDataProps {
  phone: string | null;
}

interface LeadRow {
  nome: string | null;
  user_id: string | null;
  negotiation_id: string | null;
  telefone: string | null;
  email: string | null;
  link_guru: string | null;
  link_crm: string | null;
  funnel_stage_id: string | null;
  etapa_funil_atual: string | null;
  pipeline_id: string | null;
  nome_pipeline: string | null;
  data_entrada_usuario: string | null;
  usuario_cadastrado: boolean;
  data_primeira_consulta: string | null;
  ja_fez_consulta: boolean;
  data_pagamento_orcamento: string | null;
  ja_comprou_orcamento: boolean;
  data_envio_anvisa: string | null;
  ja_enviou_anvisa: boolean;
  data_envio_documentos: string | null;
  ja_enviou_documentos: boolean;
  data_envio_rastreio: string | null;
  ja_enviou_rastreio: boolean;
  data_chegada_produto: string | null;
  produto_entregue: boolean;
  produtos_prescritos_primeira_consulta: string | null;
  link_receita: string | null;
  link_anvisa: string | null;
  link_identidade: string | null;
  link_comp_residencia: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ value }: { value: boolean }) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-secondary px-2 py-0.5 text-xs font-medium text-success-primary">
        <CheckCircle className="size-3" />
        Sim
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-error-secondary px-2 py-0.5 text-xs font-medium text-error-primary">
      <XCircle className="size-3" />
      Não
    </span>
  );
}

function DocLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline"
    >
      <LinkExternal02 className="size-3" />
      {label}
    </a>
  );
}

export function CreatorLeadData({ phone }: CreatorLeadDataProps) {
  const { data, isLoading, isError } = useQuery({
    ...trpc.creator.getLeadData.queryOptions({ phone: phone! }),
    enabled: !!phone,
  });

  if (!phone) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Phone className="size-8 text-quaternary mb-3" />
        <p className="text-sm text-tertiary">
          Cadastre um telefone para buscar dados do lead no CRM.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <XCircle className="size-8 text-error-primary mb-3" />
        <p className="text-sm text-error-primary">
          Erro ao buscar dados do lead.
        </p>
      </div>
    );
  }

  const leads = (data ?? []) as LeadRow[];

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <User01 className="size-8 text-quaternary mb-3" />
        <p className="text-sm text-tertiary">
          Nenhum lead encontrado com este telefone.
        </p>
      </div>
    );
  }

  const lead = leads[0]!;

  const journeySteps = [
    { label: "Entrada", done: lead.usuario_cadastrado, date: lead.data_entrada_usuario },
    { label: "Primeira consulta", done: lead.ja_fez_consulta, date: lead.data_primeira_consulta },
    { label: "Pagamento orçamento", done: lead.ja_comprou_orcamento, date: lead.data_pagamento_orcamento },
    { label: "Envio Anvisa", done: lead.ja_enviou_anvisa, date: lead.data_envio_anvisa },
    { label: "Envio documentos", done: lead.ja_enviou_documentos, date: lead.data_envio_documentos },
    { label: "Envio rastreio", done: lead.ja_enviou_rastreio, date: lead.data_envio_rastreio },
    { label: "Produto entregue", done: lead.produto_entregue, date: lead.data_chegada_produto },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
          Dados do Lead (CRM)
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
          <div>
            <span className="text-xs text-quaternary">Nome</span>
            <p className="text-sm text-primary font-medium">{lead.nome || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-quaternary">Email</span>
            <p className="text-sm text-primary truncate">{lead.email || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-quaternary">Telefone</span>
            <p className="text-sm text-primary">{lead.telefone || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-quaternary">User ID</span>
            <p className="text-sm text-primary font-mono text-xs">{lead.user_id || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {lead.link_crm && (
            <a
              href={lead.link_crm}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-secondary px-2.5 py-1 text-xs font-medium text-brand-primary hover:bg-brand-secondary_alt transition-colors"
            >
              <LinkExternal02 className="size-3" />
              Abrir no CRM
            </a>
          )}
          {lead.link_guru && (
            <a
              href={lead.link_guru}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-success-secondary px-2.5 py-1 text-xs font-medium text-success-primary hover:opacity-80 transition-opacity"
            >
              <Mail01 className="size-3" />
              Chat Guru
            </a>
          )}
        </div>
      </div>

      {/* Funil */}
      <div>
        <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
          Funil Atual
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
          <div>
            <span className="text-xs text-quaternary">Pipeline</span>
            <p className="text-sm text-primary">{lead.nome_pipeline || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-quaternary">Etapa</span>
            <p className="text-sm text-primary">{lead.etapa_funil_atual || "—"}</p>
          </div>
        </div>
      </div>

      {/* Jornada */}
      <div>
        <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
          Jornada do Paciente
        </h3>
        <div className="mt-3 space-y-0">
          {journeySteps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`size-2.5 rounded-full mt-1.5 ${
                    step.done ? "bg-success-primary" : "bg-quaternary"
                  }`}
                />
                {i < journeySteps.length - 1 && (
                  <div className="w-px h-6 bg-secondary" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary">{step.label}</span>
                  <StatusBadge value={step.done} />
                </div>
                <span className="text-xs text-quaternary">{formatDate(step.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produtos Prescritos */}
      {lead.produtos_prescritos_primeira_consulta && (
        <div>
          <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
            Produtos Prescritos (1a consulta)
          </h3>
          <p className="text-sm text-primary mt-2">
            {lead.produtos_prescritos_primeira_consulta}
          </p>
        </div>
      )}

      {/* Links */}
      {(lead.link_receita || lead.link_anvisa || lead.link_identidade || lead.link_comp_residencia) && (
        <div>
          <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
            Documentos
          </h3>
          <div className="flex flex-wrap gap-3 mt-2">
            <DocLink href={lead.link_receita} label="Receita" />
            <DocLink href={lead.link_anvisa} label="Anvisa" />
            <DocLink href={lead.link_identidade} label="Identidade" />
            <DocLink href={lead.link_comp_residencia} label="Comp. Residência" />
          </div>
        </div>
      )}
    </div>
  );
}
