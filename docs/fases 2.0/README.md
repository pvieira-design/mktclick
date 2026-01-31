# Ads Types & Ads Request — Plano de Implementacao v2.0

> **Projeto**: Feature "Ads Types" para Click Cannabis  
> **Data**: 31 de Janeiro de 2026  
> **Status**: Planejado  
> **Supersede**: docs/fases/ (plano v1.0 — arquitetura diferente, DESCONSIDERAR)

---

## O Que Mudou do Plano v1.0

O plano original (docs/fases/) propunha criar um **content type** chamado "video-criativo" DENTRO do sistema existente de Requests. Isso exigia modificar modelos compartilhados (WorkflowStep, canUserApprove, etc.), afetando todos os 6 content types existentes e criando riscos criticos.

**O plano v2.0 abandona essa abordagem.** Em vez disso, cria uma **feature 100% independente** com modelos proprios, routers proprios e paginas proprias. O sistema existente de Requests/ContentTypes nao eh tocado.

| Aspecto | Plano v1.0 (DESCONSIDERAR) | Plano v2.0 (ESTE) |
|---------|---------------------------|-------------------|
| Abordagem | Novo content type dentro do sistema existente | Feature 100% separada |
| Impacto no existente | ALTO (modifica WorkflowStep, canUserApprove) | ZERO (nao toca no sistema existente) |
| Modelos | RequestDeliverable + modificar Request | AdProject + AdVideo + AdDeliverable (novos) |
| Workflow | 16 steps lineares no WorkflowStep existente | 6 fases hibridas com progresso por video |
| Videos multiplos | 1 request = 1 video (hooks sao variacoes) | 1 projeto = N videos, cada video com hooks |
| Risco | CRITICO (quebra todos content types se errar) | BAIXO (so cria coisas novas) |

---

## Visao Geral da Feature

### Dois Novos Menus no Sidebar

| Menu | URL | Acesso | Proposito |
|------|-----|--------|-----------|
| **Ads Types** | `/admin/ads-types` | ADMIN / SUPER_ADMIN | Configuracao dos tipos de ad (hardcoded por agora, so "Video Criativo") |
| **Ads Request** | `/ads-requests` | Todos os usuarios logados | Criar e gerenciar projetos de ads (operacional) |

> **ATENCAO**: A rota `/ads` ja existe no sistema (Anuncios/Facebook Ads analytics). Ads Request vive em `/ads-requests` para evitar colisao.

### Hierarquia de Dados (3 Niveis)

```
AdProject (o projeto/campanha)
│   Titulo, Origin, Briefing geral, Deadline, Prioridade
│   Fase atual do projeto (1-6)
│
├── AdVideo #1 (um conceito/roteiro especifico)
│   │   Nome descritivo, Tema, Estilo, Formato, Roteiro, Criador
│   │   Status proprio dentro da fase atual
│   │
│   ├── AdDeliverable HK1 (variacao de hook)
│   │   Arquivo, Tempo, Tamanho, MostraProduto, AD0731, Nomenclatura
│   ├── AdDeliverable HK2
│   │   Arquivo, Tempo, Tamanho, MostraProduto, AD0732, Nomenclatura
│   └── Link manual para anuncio no Meta Ads
│
├── AdVideo #2 (outro conceito diferente)
│   ├── AdDeliverable HK1 → AD0733
│   └── AdDeliverable HK2 → AD0734
│
└── AdVideo #3 ...
```

### Workflow: 6 Fases Hibridas

```
FASE 1: BRIEFING          → Projeto-level (define projeto, adiciona videos)
FASE 2: ROTEIRO            → Por video (roteiros, validacao compliance/medico)
FASE 3: ELENCO & PRE-PROD → Por video (casting, storyboard, locacao)
FASE 4: PRODUCAO & ENTREGA→ Por video (gravacao, upload de hooks)
FASE 5: REVISAO            → Por video (conteudo, design, compliance final)
FASE 6: APROVACAO & PUB    → Por video (AD####, nomenclatura, link Meta Ads)

Regra: Fase avanca quando TODOS os videos naquela fase estao PRONTOS.
Videos podem ser adicionados ate o final da Fase 2. A partir da Fase 3, lista trava.
```

---

## Diagrama de Dependencias das Fases de Implementacao

```
FASE 0 (Schema + Seed)
  |
  +---> FASE 1 (Backend Core — Routers + Services)
  |         |
  |         +---> FASE 2 (Frontend — Listagem e Criacao)
  |                   |
  |                   +---> FASE 3 (Frontend — Workflow e Fases)
  |                             |
  |                             +---> FASE 4 (Integracao + Polish)
  |
  (FASE 0 tambem adiciona Origin.code e Creator.code
   que sao pre-requisitos para nomenclatura na Fase 1)
```

---

## Indice dos Documentos

| # | Documento | Conteudo |
|---|-----------|----------|
| 1 | [Regras de Negocio](./regras-de-negocio.md) | Todas as regras de negocio completas |
| 2 | [Modelo de Dados](./modelo-de-dados.md) | Schema Prisma, relacoes, enums, campos |
| 3 | [Fase 0 — Schema e Seed](./fase-0-schema-seed.md) | Migration, seed, dados iniciais |
| 4 | [Fase 1 — Backend Core](./fase-1-backend-core.md) | tRPC routers, services, workflow logic |
| 5 | [Fase 2 — Frontend Listagem](./fase-2-frontend-listagem.md) | Paginas de listagem, criacao, detail |
| 6 | [Fase 3 — Frontend Workflow](./fase-3-frontend-workflow.md) | Fases, progresso, deliverables, nomenclatura |
| 7 | [Fase 4 — Integracao e Polish](./fase-4-integracao-polish.md) | Sidebar, auth, E2E, seed validation |
| 8 | [Riscos e Mitigacoes](./riscos-e-mitigacoes.md) | Analise de riscos com mitigacoes |

---

## Decisoes Arquiteturais Registradas

| # | Decisao | Escolha | Justificativa |
|---|---------|---------|---------------|
| 1 | Feature separada vs content type | Feature 100% separada | Elimina risco de quebrar sistema existente |
| 2 | Hierarquia de dados | AdProject → AdVideo → AdDeliverable | Permite multiplos videos por projeto, cada video com hooks |
| 3 | Workflow | 6 fases hibridas (projeto + por video) | Equilibrio entre organizacao (fases macro) e flexibilidade (progresso por video) |
| 4 | Multi-area approval | Array de area IDs com semantica OR | Etapas como "Compliance OU Medico" precisam de multiplos aprovadores |
| 5 | SUPER_ADMIN bypass | Sim — no sistema ads-types apenas | Pedro e Lucas aprovam qualquer etapa sem estar na area |
| 6 | URL routing | `/admin/ads-types` + `/ads-requests` | Evita colisao com `/ads` existente (analytics) |
| 7 | Infra compartilhada | User, Area, File, Origin, Creator | Evita duplicacao; modelos novos so para entidades de Ad |
| 8 | Origin.code + Creator.code | Campos nullable adicionados | Necessarios para nomenclatura; migration aditiva sem risco |
| 9 | AD Counter | Tabela singleton com operacao atomica | Previne race conditions; inicia em 730 (proximo = 731) |
| 10 | Ads Types config | Hardcoded no seed (so "Video Criativo") | Sem UI de config por agora; adiciona via codigo quando precisar |
| 11 | Integracao Meta Ads | Link manual (MVP) | Nomenclatura + campo para link. Sem API automatica por agora |
| 12 | Lock de videos | Ate final da Fase 2 | Apos Fase 3 (Elenco), lista de videos trava |
| 13 | Fase regression | Por video apenas | Video pode voltar fase; projeto nao regride |
| 14 | AD numbers queimados | Gaps aceitos | ADs atribuidos nunca sao reutilizados |
| 15 | Verificacao | Manual (browser + queries SQL) | Sem infra de testes no projeto |

---

## Escopo

### DENTRO (build)
- Modelos Prisma: AdProject, AdVideo, AdDeliverable, AdCounter, AdPhaseApproval
- Campo `code` em Origin e Creator (migration aditiva)
- tRPC routers: adProject, adVideo, adDeliverable
- Services: ad-workflow, ad-nomenclatura, ad-counter
- Paginas: /ads-requests (list, new, [id]), /admin/ads-types
- Componentes: project list, video cards, phase visualization, deliverables section, nomenclatura preview
- Sidebar: 2 novos itens (Ads Request para todos, Ads Types para admin)
- Seed: AdType "Video Criativo", AdCounter, Origin codes, Creator codes, Pedro em Compliance HEAD

### FORA (nao build)
- Modificar sistema existente de Requests/ContentTypes/WorkflowStep
- Modificar `workflow-validator.ts` ou `canUserApprove()` existente
- Modificar router `ads.ts` existente (Facebook Ads analytics)
- Modificar paginas `/ads/` existentes (Anuncios)
- Integracao real com Meta Ads API
- Notificacoes por email ou in-app
- Dashboard de metricas/analytics de ads
- Sistema de comentarios em ads requests
- Testes automatizados (sem infra no projeto)
- UI dinamica para criar novos Ads Types (hardcoded por agora)
- Drag-and-drop ou reordenacao de hooks
- Operacoes em batch (aprovar todos de uma vez)

---

## Glossario

| Termo | Significado |
|-------|-------------|
| **AdProject** | Projeto/campanha que contem multiplos videos |
| **AdVideo** | Conceito/roteiro individual dentro de um projeto |
| **AdDeliverable** | Variacao (hook) de um video com arquivo, metadados e AD#### |
| **Hook** | Variacao de abertura do video (HK1, HK2, HK3...) |
| **AD####** | Codigo sequencial unico do anuncio (ex: AD0731) |
| **Nomenclatura** | Nome final do criativo para uso no Meta Ads |
| **Fase** | Etapa macro do projeto (1-6) |
| **PhaseStatus** | Status de um video dentro da fase atual |
| **Multi-area OR** | Multiplas areas podem aprovar; qualquer uma sozinha basta |
| **Origin** | Produtora de onde vem o conteudo (Oslo, Click, Lagency...) |
| **Creator** | Ator/influenciador que aparece no video |
