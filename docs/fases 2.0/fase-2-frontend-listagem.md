# Fase 2 — Frontend: Listagem e Criacao

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Pre-requisitos**: Fase 1 completa (backend routers + services funcionando)  
> **Objetivo**: Criar paginas de listagem, criacao e detalhe de AdProjects  
> **Padrao de referencia**: `apps/web/src/app/dashboard/page.tsx` (listagem de Requests)

---

## Visao Geral das Paginas

| Rota | Pagina | Proposito |
|------|--------|-----------|
| `/ads-requests` | Lista de projetos | Listagem com filtros, paginacao, cards |
| `/ads-requests/new` | Criar projeto | Formulario de criacao com videos |
| `/ads-requests/[id]` | Detalhe do projeto | Visualizacao completa + workflow (Fase 3) |
| `/admin/ads-types` | Config de tipos | Listagem read-only dos tipos de ad |

---

## Arquivos a Criar

### Paginas (App Router)

```
apps/web/src/app/
  ads-requests/
    layout.tsx              # Layout com Sidebar
    page.tsx                # Lista de projetos
    new/
      page.tsx              # Formulario de criacao
    [id]/
      page.tsx              # Detalhe do projeto (inclui workflow - Fase 3)
  admin/
    ads-types/
      page.tsx              # Lista de tipos de ad (read-only)
```

### Componentes

```
apps/web/src/components/
  ads/
    ad-project-card.tsx         # Card de projeto na listagem
    ad-project-filters.tsx      # Filtros (status, search)
    ad-project-form.tsx         # Formulario de criacao/edicao
    ad-video-form.tsx           # Formulario de video (inline no projeto)
    ad-video-card.tsx           # Card de video dentro do projeto
    ad-phase-badge.tsx          # Badge com fase atual (1-6)
    ad-status-badge.tsx         # Badge com status (DRAFT, ACTIVE, etc.)
```

---

## 1. Sidebar — Adicionar Novos Menus

### Modificacao em `apps/web/src/components/sidebar.tsx`

Adicionar na secao "General":

```typescript
// Importar icone
import { Film01, Settings01 } from "@untitledui/icons";
// Ou usar icone disponivel similar

const sections: NavSection[] = [
  {
    label: "General",
    items: [
      { label: "Requests", href: "/dashboard", icon: ClipboardCheck },
      { label: "Ads Request", href: "/ads-requests", icon: Film01 },  // NOVO
      { label: "Criadores", href: "/criadores", icon: Users01 },
      { label: "Biblioteca", href: "/library", icon: FolderClosed },
    ],
  },
];

if (isAdmin) {
  sections.push({
    label: "Admin",
    items: [
      { label: "Content Types", href: "/admin/content-types", icon: File02 },
      { label: "Ads Types", href: "/admin/ads-types", icon: Settings01 },  // NOVO
      { label: "Origins", href: "/admin/origins", icon: Globe02 },
      { label: "Areas", href: "/admin/areas", icon: Grid01 },
      { label: "Users", href: "/admin/users", icon: Users01 },
      { label: "Tags", href: "/admin/tags", icon: Tag01 },
    ],
  });
}
```

Atualizar `getActiveUrl()`:

```typescript
const getActiveUrl = () => {
  if (pathname.startsWith("/ads-requests")) return "/ads-requests";  // NOVO
  if (pathname.startsWith("/admin/ads-types")) return "/admin/ads-types";  // NOVO
  // ... existentes ...
};
```

---

## 2. Layout: ads-requests/layout.tsx

Seguir padrao identico ao `dashboard/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { auth } from "@marketingclickcannabis/auth";
import { headers } from "next/headers";
import { Sidebar } from "@/components/sidebar";

export default async function AdsRequestsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="flex h-screen">
      <Sidebar userRole={session.user.role ?? undefined}>
        {/* user footer se necessario */}
      </Sidebar>
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 3. Pagina: ads-requests/page.tsx (Lista)

### Estrutura

```
+--------------------------------------------------+
| Ads Requests                        [+ Novo Projeto] |
| Gerencie projetos de anuncios criativos            |
+--------------------------------------------------+
| [Filtros: Status | Busca]                          |
+--------------------------------------------------+
| [Card Projeto 1]  [Card Projeto 2]  [Card Projeto 3] |
| [Card Projeto 4]  [Card Projeto 5]  [Card Projeto 6] |
+--------------------------------------------------+
| [Paginacao]                                        |
+--------------------------------------------------+
```

### Implementacao

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { AdProjectCard } from "@/components/ads/ad-project-card";
import { AdProjectFilters } from "@/components/ads/ad-project-filters";
import { trpc } from "@/utils/trpc";
import { Plus } from "@untitledui/icons";

export default function AdsRequestsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ status?: string; search?: string }>({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    trpc.adProject.list.queryOptions({
      ...filters,
      page,
      limit: 20,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Ads Requests</h1>
          <p className="text-tertiary">
            Gerencie projetos de anuncios criativos e acompanhe o progresso.
          </p>
        </div>
        <Button iconLeading={Plus} onClick={() => router.push("/ads-requests/new")}>
          Novo Projeto
        </Button>
      </div>

      <AdProjectFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AdProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((project) => (
            <AdProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Paginacao */}
    </div>
  );
}
```

---

## 4. Componente: ad-project-card.tsx

### Informacoes no Card

| Campo | Posicao | Formato |
|-------|---------|---------|
| Titulo | Topo, bold | String |
| Tipo (AdType) | Badge colorido | "Video Criativo" |
| Origin | Texto secundario | "Oslo", "Click" |
| Fase atual | Badge numerado | "Fase 2/6" |
| Status | Badge colorido | DRAFT, ACTIVE, COMPLETED, CANCELLED |
| Prioridade | Icone/badge | HIGH = vermelho, MEDIUM = amarelo, LOW = verde |
| Qtd videos | Contador | "3 videos" |
| Criado por | Avatar + nome | "Pedro" |
| Deadline | Data | "31 Jan 2026" ou "Sem deadline" |
| Criado em | Data relativa | "ha 2 dias" |

### Layout do Card

```
+------------------------------------------+
| [Badge: Video Criativo]  [Badge: Fase 2] |
| Campanha Ansiedade Janeiro               |
| Oslo · 3 videos · Pedro                  |
|                                          |
| [ACTIVE]  [HIGH]  31 Jan 2026           |
+------------------------------------------+
```

### Cores dos Status

| Status | Cor | Icone |
|--------|-----|-------|
| DRAFT | gray | Pencil |
| ACTIVE | blue | Play |
| COMPLETED | green | Check |
| CANCELLED | red | X |

### Cores das Fases

| Fase | Cor | Label |
|------|-----|-------|
| 1 | slate | Briefing |
| 2 | blue | Roteiro |
| 3 | purple | Elenco |
| 4 | orange | Producao |
| 5 | yellow | Revisao |
| 6 | green | Publicacao |

---

## 5. Pagina: ads-requests/new/page.tsx (Criar Projeto)

### Estrutura do Formulario

O formulario de criacao tem 2 secoes:

#### Secao 1: Dados do Projeto

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| Titulo | Text input | Sim | min 3, max 200 |
| Tipo de Ad | Select (disabled, pre-selecionado) | Sim | Apenas "Video Criativo" |
| Origin | Select (lista de Origins) | Sim | - |
| Briefing | Textarea | Sim | min 10 |
| Deadline | Date picker | Nao | - |
| Prioridade | Select | Nao | LOW, MEDIUM, HIGH, URGENT |

#### Secao 2: Videos (inline)

Lista de videos adicionados ao projeto. Cada video tem:

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| Nome Descritivo | Text input | Sim | max 25, regex /^[A-Z0-9]+$/ |
| Tema | Select (enum) | Sim | - |
| Estilo | Select (enum) | Sim | - |
| Formato | Select (enum) | Sim | - |

Botao "+ Adicionar Video" para adicionar mais videos.

### Fluxo de Criacao

1. Usuario preenche dados do projeto
2. Usuario adiciona pelo menos 1 video
3. Botao "Salvar como Rascunho" → cria projeto DRAFT + videos
4. Botao "Submeter" → cria projeto DRAFT + videos, depois chama submit (DRAFT → ACTIVE)

### Implementacao

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
// ... imports de componentes de form ...

interface VideoFormData {
  nomeDescritivo: string;
  tema: string;
  estilo: string;
  formato: string;
}

export default function NewAdProjectPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoFormData[]>([]);

  const createProject = useMutation(trpc.adProject.create.mutationOptions());
  const createVideo = useMutation(trpc.adVideo.create.mutationOptions());
  const submitProject = useMutation(trpc.adProject.submit.mutationOptions());

  const handleSubmit = async (data: ProjectFormData, shouldSubmit: boolean) => {
    // 1. Criar projeto
    const project = await createProject.mutateAsync({
      title: data.title,
      adTypeId: data.adTypeId,
      originId: data.originId,
      briefing: data.briefing,
      deadline: data.deadline,
      priority: data.priority,
    });

    // 2. Criar videos
    for (const video of videos) {
      await createVideo.mutateAsync({
        projectId: project.id,
        nomeDescritivo: video.nomeDescritivo,
        tema: video.tema as any,
        estilo: video.estilo as any,
        formato: video.formato as any,
      });
    }

    // 3. Submeter se solicitado
    if (shouldSubmit) {
      await submitProject.mutateAsync({ id: project.id });
    }

    // 4. Redirecionar
    router.push(`/ads-requests/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Novo Projeto de Ad</h1>
        <p className="text-tertiary">Crie um novo projeto de anuncio criativo.</p>
      </div>

      {/* Formulario do projeto */}
      <ProjectForm />

      {/* Lista de videos */}
      <VideoList videos={videos} onAdd={addVideo} onRemove={removeVideo} />

      {/* Botoes */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => handleSubmit(formData, false)}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSubmit(formData, true)} disabled={videos.length === 0}>
          Submeter Projeto
        </Button>
      </div>
    </div>
  );
}
```

### Validacao do Nome Descritivo (UX)

O campo `nomeDescritivo` precisa de UX especial:
- Input com transformacao automatica para MAIUSCULAS
- Remocao automatica de acentos e espacos enquanto digita
- Contador de caracteres (X/25)
- Mensagem de ajuda: "Apenas letras maiusculas e numeros. Ex: ROTINACBDMUDOU"
- Preview da nomenclatura parcial enquanto digita

---

## 6. Pagina: admin/ads-types/page.tsx

### Estrutura

Pagina simples, read-only, mostrando os tipos de ad configurados:

```
+--------------------------------------------------+
| Ads Types                                         |
| Tipos de anuncio configurados no sistema          |
+--------------------------------------------------+
| +----------------------------------------------+ |
| | Video Criativo                                | |
| | Video criativo para anuncios de performance   | |
| | Slug: video-criativo                          | |
| | Status: Ativo                                 | |
| | Projetos: 12                                  | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

### Implementacao

```typescript
// apps/web/src/app/admin/ads-types/page.tsx
// Pagina simples que lista AdTypes
// Sem CRUD por agora — apenas visualizacao
// Usa trpc.adType.list (query simples que retorna todos AdTypes)
```

> **NOTA**: Precisamos adicionar um procedure `adType.list` no backend, ou incluir no `ad-project.ts` como `listTypes`. Eh uma query simples:

```typescript
listTypes: protectedProcedure.query(async () => {
  return db.adType.findMany({
    where: { isActive: true },
    include: { _count: { select: { projects: true } } },
  });
}),
```

---

## 7. Pagina: ads-requests/[id]/page.tsx (Detalhe)

Esta pagina eh a mais complexa. Ela mostra:

1. **Header**: Titulo, status, fase, acoes
2. **Dados do projeto**: Briefing, origin, deadline, prioridade
3. **Lista de videos**: Cards com status individual
4. **Workflow visual**: Barra de progresso das 6 fases (detalhado na Fase 3)

### Layout Basico (Fase 2 — sem workflow completo)

```
+--------------------------------------------------+
| [< Voltar]  Campanha Ansiedade Janeiro            |
| [ACTIVE] [Fase 2/6: Roteiro] [HIGH]              |
+--------------------------------------------------+
| Briefing                                          |
| Lorem ipsum dolor sit amet...                     |
|                                                   |
| Origin: Oslo  |  Deadline: 31 Jan  |  Por: Pedro  |
+--------------------------------------------------+
| Videos (3)                          [+ Add Video] |
| +----------------------------------------------+ |
| | Video #1: ROTINACBDMUDOU                     | |
| | Tema: ANSIEDADE | Estilo: UGC | Formato: VID | |
| | Fase 2 - EM_ANDAMENTO                        | |
| +----------------------------------------------+ |
| | Video #2: CBDPARADORMR                       | |
| | Tema: SONO | Estilo: DEPOI | Formato: VID    | |
| | Fase 2 - PRONTO                              | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| [Avancar Fase]  (desabilitado se nem todos PRONTO)|
+--------------------------------------------------+
```

### Acoes Disponiveis

| Acao | Condicao | Botao |
|------|----------|-------|
| Editar projeto | DRAFT ou Fase <= 2 | Icone de edicao |
| Adicionar video | Fase <= 2 | "+ Add Video" |
| Cancelar projeto | Qualquer fase (nao COMPLETED) | "Cancelar" (vermelho) |
| Avancar fase | Todos videos PRONTO na fase | "Avancar Fase" (primario) |
| Deletar projeto | Somente DRAFT | "Deletar" (vermelho) |

---

## Enums para UI (Labels em Portugues)

### Temas

```typescript
export const TEMA_LABELS: Record<string, string> = {
  GERAL: "Geral",
  SONO: "Sono",
  ANSIEDADE: "Ansiedade",
  DEPRESSAO: "Depressao",
  PESO: "Peso",
  DISF: "Disfuncao",
  DORES: "Dores",
  FOCO: "Foco",
  PERFORM: "Performance",
  PATOLOGIAS: "Patologias",
  TABACO: "Tabaco",
};
```

### Estilos

```typescript
export const ESTILO_LABELS: Record<string, string> = {
  UGC: "UGC",
  EDUC: "Educativo",
  COMED: "Comedia",
  DEPOI: "Depoimento",
  POV: "POV",
  STORY: "Storytelling",
  MITOS: "Mitos",
  QA: "Q&A",
  ANTES: "Antes/Depois",
  REVIEW: "Review",
  REACT: "React",
  TREND: "Trend",
  INST: "Institucional",
};
```

### Formatos

```typescript
export const FORMATO_LABELS: Record<string, string> = {
  VID: "Video",
  MOT: "Motion",
  IMG: "Imagem",
  CRSEL: "Carrossel",
};
```

### Tempos

```typescript
export const TEMPO_LABELS: Record<string, string> = {
  T15S: "15s",
  T30S: "30s",
  T45S: "45s",
  T60S: "60s",
  T90S: "90s",
  T120S: "2min",
  T180S: "3min",
};
```

### Tamanhos

```typescript
export const TAMANHO_LABELS: Record<string, string> = {
  S9X16: "9:16 (Vertical)",
  S1X1: "1:1 (Quadrado)",
  S4X5: "4:5",
  S16X9: "16:9 (Horizontal)",
  S2X3: "2:3",
};
```

---

## Checklist Final da Fase 2

- [ ] Sidebar atualizado com "Ads Request" e "Ads Types"
- [ ] `ads-requests/layout.tsx` criado (com auth + sidebar)
- [ ] `ads-requests/page.tsx` criado (listagem com filtros e paginacao)
- [ ] `ads-requests/new/page.tsx` criado (formulario de criacao)
- [ ] `ads-requests/[id]/page.tsx` criado (detalhe basico — workflow completo na Fase 3)
- [ ] `admin/ads-types/page.tsx` criado (listagem read-only)
- [ ] Componente `ad-project-card.tsx` criado
- [ ] Componente `ad-project-filters.tsx` criado
- [ ] Componente `ad-project-form.tsx` criado
- [ ] Componente `ad-video-form.tsx` criado (com validacao de nomeDescritivo)
- [ ] Componente `ad-video-card.tsx` criado
- [ ] Componente `ad-phase-badge.tsx` criado
- [ ] Componente `ad-status-badge.tsx` criado
- [ ] Constantes de labels para enums criadas
- [ ] Navegacao funciona: sidebar → lista → detalhe → voltar
- [ ] Criar projeto funciona (DRAFT)
- [ ] Submeter projeto funciona (DRAFT → ACTIVE)
- [ ] Adicionar videos funciona
- [ ] Filtros de status e busca funcionam
- [ ] Paginacao funciona
- [ ] Build passa (`npm run build`)
- [ ] Nenhuma pagina existente foi modificada (exceto sidebar)
