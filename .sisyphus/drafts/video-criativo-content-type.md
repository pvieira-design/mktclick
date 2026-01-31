# Draft: Video Criativo Content Type

## Data: 31/01/2026

---

## Entendimento do Sistema Atual

### Tech Stack
- Next.js 15 (App Router) + tRPC + Prisma + PostgreSQL
- Monorepo: apps/web, packages/api, packages/db, packages/auth
- UI: TailwindCSS + Radix + Untitled UI Icons PRO

### Content Types Existentes (6)
| Slug | Steps | Campos |
|------|-------|--------|
| video-ugc | 3 (Briefing > Producao UGC > Aprovacao Final) | 8 campos |
| video-institucional | 4 (Briefing > Validacao Oslo > Producao > Aprovacao Final) | 8 campos |
| carrossel | 3 | 6 campos |
| post-unico | 3 | 6 campos |
| stories | 3 | 6 campos |
| reels | 3 | 7 campos |

### Areas Existentes (14) - DADOS REAIS DO BANCO
- content-manager (Samira HEAD)
- design (Mauro COORDINATOR, Vidjai STAFF)
- social-media (Vidjai COORDINATOR)
- trafego (Rafael Pro HEAD, Lucas STAFF)
- oslo (Nelson HEAD)
- ugc-manager (Bruna Wright HEAD)
- compliance (SEM MEMBROS!)
- medico (Lucas Khour HEAD)
- **growth** (Lucas Rouxinol HEAD, Rafael Pro COORDINATOR) ✅ JA EXISTE
- **copywriting** (Lucas Rouxinol HEAD) ✅ JA EXISTE
- blogseo (Samira HEAD)
- crmremarketing (Lucas Rouxinol HEAD)
- financeiro (Rafael Lacoste HEAD)
- trade-marketing (sem membros)

### Origins Existentes (4)
- oslo, interno, influencer, freelancer

### Origins do Documento de Nomenclatura (DIFERENTES!)
- OSLLO, LAGENCY, CLICK, CHAMBER, OUTRO

### Decisao: Atualizar existentes + criar novos
- Mapping a definir com usuario

### Content Types Existentes (7)
- video-ugc (3 steps) - SERA SUBSTITUIDO por video-criativo
- video-institucional (4 steps) - MANTEM (outro estilo)
- carrossel (3 steps)
- post-unico (3 steps)
- stories (3 steps)
- reels (3 steps)
- criativo---imagem-fixa (2 steps, incompleto - so 1 campo)

### Dados Reais no Banco
- 7 requests existentes
- 35 files
- 9 field values
- 1 creator (Leo do Taxi - EMBAIXADOR)
- 2 file tags (performance boa, referencias visuais)

### Users Reais no Sistema (11)
| Nome | Role | Areas |
|------|------|-------|
| Pedro | SUPER_ADMIN | Nenhuma area |
| Lucas Rouxinol | SUPER_ADMIN | Growth HEAD, Copywriting HEAD, CRM/Remarketing HEAD, Trafego STAFF |
| Rafael Pro | ADMIN | Trafego HEAD, Growth COORDINATOR |
| Rafael Lacoste | ADMIN | Financeiro HEAD |
| Samira Fernandes | USER | Content Manager HEAD, Blog/SEO HEAD |
| Bruna Wright | USER | UGC Manager HEAD |
| Vidjai | USER | Design STAFF, Social Media COORDINATOR |
| Mauro Barcelos | USER | Design COORDINATOR |
| Nelson | USER | Oslo HEAD |
| Lucas Khour | USER | Medico HEAD |
| Isabela Ururahy | USER | Nenhuma area |

### GAPS identificados nos users:
- Pedro (SUPER_ADMIN) NAO TEM area - aprovador final precisa de area?
- Compliance NAO TEM membros!
- Isabela sem area

### Mecanismos Existentes Relevantes
1. **WorkflowStep**: order-based, approverArea + approverPositions, requiredFieldsToEnter/Exit
2. **ContentTypeField**: assignedStepId para controle de edicao por etapa
3. **FieldType enum**: TEXT, TEXTAREA, WYSIWYG, FILE, DATE, DATETIME, SELECT, MULTI_SELECT, NUMBER, CHECKBOX, URL, IMAGE, REPEATER, AD_REFERENCE
4. **REPEATER**: Funciona no frontend (add/remove groups de sub-fields armazenados como JSON)
5. **Creator/CreatorParticipation**: Mecanismo separado dos custom fields, ligado diretamente ao Request
6. **File system**: Vercel Blob com tags, RequestFile junction table
7. **AdCreativeMedia**: Liga arquivos a AD IDs

---

## Requisitos Confirmados (das perguntas/respostas do usuario)

### Fluxo Geral
- Qualquer area pode abrir request
- Ideia pode vir bruta (sem briefing estruturado)
- Briefing escrito por Content Manager, Trafego, Oslo, Lucas Rouxinol, ou Influencer
- Roteiro normalmente escrito por Oslo/Bruna Wright, passa por validacao Compliance + Medico
- Selecao de elenco com aprovacao do Lucas Rouxinol
- Pre-producao com storyboard e locacao, aprovada por Lucas Rouxinol
- 2 rodadas de revisao media
- Revisao tecnica por Lucas Rouxinol e Rafael Pro
- Compliance e Medico revisam tanto roteiro quanto video final
- Aprovacao final por Pedro/Lucas/Head Marketing/Head Growth/Head Trafego
- Rafael Pro (Head Trafego) define campanha e conjunto de anuncios
- Nomenclatura gerada automaticamente, editavel nessa etapa

### Campos de Nomenclatura
- AD#### (sequencial)
- AAAAMMDD (data)
- PRODUTORA (OSLLO, LAGENCY, CLICK, CHAMBER)
- INFLUENCER (codigo do criador)
- NOME (max 25 chars)
- TEMA (ANSIEDADE, SONO, DOR, GERAL, etc.)
- ESTILO (UGC, INSTITU, TESTEMU, PODCAST, etc.)
- FORMATO (VID, MOT)
- TEMPO (15S, 30S, 45S, 60S, 90S, 120S)
- TAMANHO (9X16, 1X1, 16X9)
- MOSTRA_PROD (Sim/Nao)
- HK# (se tem variacoes)
- V# (se tem versoes)
- POST (se post impulsionado)

### Variacoes (Hooks)
- Request UNICO pode ter ate 4+ variacoes de hook
- Cada variacao eh um video diferente (arquivo diferente)
- Cada variacao recebe AD#### proprio na nomenclatura
- Todas compartilham NOME, TELA, TEMA, INFLUENCER

### Custo de Producao
- Pode ter campo de custo

### Upload de Arquivos
- Upload direto na task (nao apenas link externo)
- Arquivos de entrega final, video de teste de ator, etc.

---

## Decisoes Tecnicas Pendentes

### 1. Relacao com Content Types Existentes
- **PERGUNTA**: video-criativo substitui video-ugc e video-institucional? Ou coexiste?

### 2. Origins: Migrar ou Coexistir?
- **PERGUNTA**: Atualizar origins existentes para OSLLO/LAGENCY/CLICK/CHAMBER? Ou criar novas?

### 3. Areas Novas Necessarias
- **CONFIRMADO**: Precisa criar Growth e Copywriting
- **PERGUNTA**: Growth eh area separada ou usa content-manager?

### 4. Modelagem de Variacoes (Hooks) - DECISAO ARQUITETURAL CRITICA
- **Opcao A**: Campos fixos (arquivo_video_hk1, hk2, hk3, hk4) - Simples mas limitado
- **Opcao B**: REPEATER field type - Flexivel mas hooks em JSON, dificil gerar AD#### por variacao
- **Opcao C**: Novo modelo RequestDeliverable/VideoVariation - Mais robusto, cada variacao eh entidade propria com seu AD####

### 5. AD Sequential ID
- Nao existe no sistema. Precisa de nova tabela/sequence para gerar AD0001-AD9999

### 6. TELA (conceito/roteiro)
- Gerenciado pelo sistema. Precisa de sequence tipo T001, T002...

### 7. Creator como Campo de Selecao
- CreatorParticipation existe como mecanismo separado
- Workflow sugere "Selecao (Criadores)" como campo - precisa decidir se usa CreatorParticipation existente ou novo FieldType

### 8. Users Reais
- Precisamos criar usuarios reais no seed ou serao criados via admin panel?

---

## Scope Boundaries

### INCLUDE (Confirmado)
- Content Type video-criativo com ~50 custom fields
- Workflow de 16 etapas com aprovadores por area
- Sistema de nomenclatura automatica
- Suporte a variacoes de hook dentro do mesmo request
- Upload de arquivos direto na task
- Integracao com sistema de Criadores existente

### EXCLUDE (A confirmar)
- Integracao real com Meta Ads API
- Dashboard de metricas do video
- Notificacoes por email

---

## Open Questions (para perguntar ao usuario)
1. Relacao com content types existentes
2. Mismatch de Origins
3. Area Growth
4. Modelagem de hooks/variacoes
5. Users reais
6. Limite maximo de hooks
7. Campo custo - estimado vs final?
8. Integracao com campanhas do Meta Ads ja existentes no banco?
