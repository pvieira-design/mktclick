# Regras de Negocio — Ads Types & Ads Request

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Status**: Fonte unica de verdade para TODAS as regras de negocio da feature ads-types  

---

## 1. Hierarquia de Dados

### 1.1 AdProject (Projeto)

O AdProject eh a entidade raiz. Representa um projeto ou campanha que contem multiplos videos criativos para ads.

**Campos do projeto**:
| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| titulo | String | Sim | Nome do projeto (ex: "Campanha Ansiedade Janeiro") |
| originId | String (FK → Origin) | Sim | Produtora (Oslo, Click, Lagency, Chamber, Freelancer) |
| briefing | String (Text) | Sim | Briefing geral da campanha — objetivo, publico-alvo, contexto |
| deadline | DateTime | Nao | Data limite para conclusao do projeto |
| prioridade | Enum | Nao | ALTA, MEDIA, BAIXA |
| currentPhase | Int (1-6) | Auto | Fase atual do projeto |
| status | Enum | Auto | DRAFT, ACTIVE, COMPLETED, CANCELLED |
| createdById | String (FK → User) | Auto | Quem criou o projeto |

**Regras**:
- Um projeto pode conter 1 a N videos (AdVideo)
- O projeto tem uma ORIGIN unica (todos videos do projeto sao da mesma produtora)
- O status comeca como DRAFT. Ao submeter, vira ACTIVE e entra na Fase 1
- O projeto eh COMPLETED quando todos os videos chegam a PUBLICADO na Fase 6
- O projeto pode ser CANCELLED a qualquer momento pelo criador ou ADMIN/SUPER_ADMIN
- Um projeto CANCELLED nao pode ser reaberto
- Um projeto COMPLETED nao pode ser reaberto

### 1.2 AdVideo (Video)

O AdVideo representa um conceito/roteiro individual dentro de um projeto. Cada video eh independente — tem seu proprio tema, estilo, criador e progresso no workflow.

**Campos do video**:
| Campo | Tipo | Obrigatorio | Fase | Descricao |
|-------|------|-------------|------|-----------|
| projectId | String (FK → AdProject) | Auto | - | Projeto pai |
| nomeDescritivo | String (max 25) | Sim | 1 | Nome curto para nomenclatura (ex: "ROTINACBDMUDOU") |
| tema | Enum | Sim | 1 | GERAL, SONO, ANSIEDADE, DEPRESSAO, PESO, DISF, DORES, FOCO, PERFORM, PATOLOGIAS, TABACO |
| estilo | Enum | Sim | 1 | UGC, EDUC, COMED, DEPOI, POV, STORY, MITOS, QA, ANTES, REVIEW, REACT, TREND, INST |
| formato | Enum | Sim | 1 | VID, MOT, IMG, CRSEL |
| roteiro | String (Text) | Nao | 2 | Roteiro completo do video |
| criadorId | String (FK → Creator) | Nao | 3 | Criador/ator selecionado |
| storyboardUrl | String (URL) | Nao | 3 | Link do storyboard |
| localGravacao | String | Nao | 3 | Descricao da locacao |
| dataGravacao | DateTime | Nao | 3 | Data prevista/real de gravacao |
| currentPhase | Int (1-6) | Auto | - | Fase atual do video |
| phaseStatus | String | Auto | - | Status dentro da fase (PENDENTE, EM_ANDAMENTO, PRONTO) |
| validacaoRoteiroCompliance | Boolean | Nao | 2 | Compliance aprovou roteiro |
| validacaoRoteiroMedico | Boolean | Nao | 2 | Medico aprovou roteiro |
| aprovacaoElenco | Boolean | Nao | 3 | Lucas aprovou elenco |
| aprovacaoPreProducao | Boolean | Nao | 3 | Lucas aprovou pre-producao |
| revisaoConteudo | Boolean | Nao | 5 | Conteudo revisado e aprovado |
| revisaoDesign | Boolean | Nao | 5 | Design revisado e aprovado |
| validacaoFinalCompliance | Boolean | Nao | 5 | Compliance aprovou video final |
| validacaoFinalMedico | Boolean | Nao | 5 | Medico aprovou video final |
| aprovacaoFinal | Boolean | Nao | 6 | Aprovacao final concedida |
| linkAnuncio | String (URL) | Nao | 6 | Link do anuncio no Meta Ads |

**Regras**:
- Um video pertence a exatamente UM projeto
- nomeDescritivo nao pode ter espacos, acentos ou caracteres especiais (sanitizado automaticamente)
- nomeDescritivo tem maximo 25 caracteres
- nomeDescritivo nao deve repetir palavras de outros campos (tema, estilo, formato)
- O criadorId referencia o modelo Creator existente no sistema
- Cada video tem seu proprio progresso de fase, independente dos outros videos do projeto

### 1.3 AdDeliverable (Hook/Variacao)

O AdDeliverable representa uma variacao de hook de um video. Cada deliverable eh uma entrega concreta com arquivo, metadados e AD number proprio.

**Campos do deliverable**:
| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| videoId | String (FK → AdVideo) | Auto | Video pai |
| hookNumber | Int (1-10) | Sim | Numero sequencial do hook dentro do video |
| adNumber | Int (nullable) | Auto | AD#### atribuido na Fase 6 (ex: 731) |
| fileId | String (FK → File) | Sim | Arquivo de video |
| tempo | Enum | Sim | 15S, 30S, 45S, 60S, 90S, 120S, 180S |
| tamanho | Enum | Sim | 9X16, 1X1, 4X5, 16X9, 2X3 |
| mostraProduto | Boolean | Nao | Se aparece produto Click no video (default false) |
| isPost | Boolean | Nao | Se eh post impulsionado (default false) |
| versionNumber | Int | Nao | Versao da variacao (default 1) |
| descHook | String (Text) | Nao | Descricao do hook |
| nomenclatura | String (nullable) | Auto | Nome final gerado/editado |

**Regras**:
- Maximo 10 deliverables por video
- hookNumber eh sequencial: 1, 2, 3... Nao pode pular numeros
- hookNumber eh unico dentro do video (nao pode ter dois HK1)
- adNumber comeca null — eh atribuido automaticamente na Fase 6 (Aprovacao Final)
- Uma vez que adNumber eh atribuido, nunca muda, nunca eh reutilizado
- O arquivo (fileId) referencia o modelo File existente (upload via Vercel Blob)
- mostraProduto indica presenca VISUAL de produto Click (gummy, oleo, capsula, creme, embalagem)
- Mencao verbal sem mostrar visualmente = mostraProduto false

---

## 2. Workflow — 6 Fases

### 2.0 Principios Gerais

1. O projeto tem uma fase macro (currentPhase: 1-6)
2. Dentro de cada fase, cada video tem seu proprio status (PENDENTE, EM_ANDAMENTO, PRONTO)
3. A fase do projeto so avanca quando TODOS os videos estao PRONTO naquela fase
4. Se um video regredir, a fase do projeto NAO avanca ate ele voltar a PRONTO
5. O projeto NUNCA regride de fase — apenas videos individuais podem regredir

### 2.1 Fase 1: BRIEFING (Projeto-level)

**Escopo**: Definir o projeto, adicionar videos, aprovar o briefing.

**Quem cria o projeto**: Qualquer usuario logado.

**O que acontece nesta fase**:
1. Usuario cria AdProject com titulo, origin, briefing, deadline, prioridade
2. Usuario adiciona AdVideos ao projeto com nomeDescritivo, tema, estilo, formato
3. Aprovador revisa e aprova o briefing geral

**Areas aprovadoras**: Content Manager OU Growth (semantica OR)  
**Posicoes que aprovam**: HEAD, COORDINATOR

**Campos obrigatorios do projeto para sair da fase**: titulo, originId, briefing  
**Campos obrigatorios por video**: nomeDescritivo, tema, estilo, formato  
**Requisito adicional**: Pelo menos 1 video adicionado ao projeto

**Resultado**: Projeto avanca para Fase 2. Todos videos iniciam com phaseStatus = PENDENTE na Fase 2.

### 2.2 Fase 2: ROTEIRO & VALIDACAO (Por video)

**Escopo**: Escrever roteiro de cada video e obter validacao de Compliance e Medico.

**O que acontece para CADA video**:
1. Roteirista escreve o roteiro completo
2. Membro de Compliance marca validacao do roteiro
3. Membro Medico marca validacao do roteiro
4. Video fica PRONTO quando roteiro preenchido + ambas validacoes marcadas

**Areas para escrita de roteiro**: Copywriting OU Oslo  
**Areas para validacao**: Compliance OU Medico (qualquer um pode marcar as duas validacoes sozinho se tiver competencia em ambas areas)

**Status do video nesta fase**:
- PENDENTE: Roteiro nao iniciado
- EM_ANDAMENTO: Roteiro em progresso (campo roteiro parcialmente preenchido)
- PRONTO: Roteiro preenchido + validacaoRoteiroCompliance = true + validacaoRoteiroMedico = true

**Regra especial**: PODE adicionar novos videos ao projeto nesta fase (ultima chance).

**Resultado**: Quando TODOS os videos estao PRONTO, projeto avanca para Fase 3. A partir daqui, lista de videos TRAVA.

### 2.3 Fase 3: ELENCO & PRE-PRODUCAO (Por video)

**Escopo**: Selecionar criadores, aprovar elenco, preparar producao.

**O que acontece para CADA video**:
1. UGC Manager ou Oslo seleciona criador (criadorId)
2. Lucas (Growth HEAD) aprova elenco
3. Equipe prepara storyboard, define locacao e data de gravacao
4. Lucas (Growth HEAD) aprova pre-producao

**Areas selecao elenco**: UGC Manager OU Oslo  
**Areas aprovacao elenco**: Growth (HEAD only)  
**Areas pre-producao**: Oslo OU Design  
**Areas aprovacao pre-producao**: Growth (HEAD only)

**Status do video nesta fase**:
- PENDENTE: Nenhuma acao iniciada
- ELENCO: Criador selecionado, aguardando aprovacao de Lucas
- PRE_PROD: Elenco aprovado, storyboard/locacao/data em progresso
- PRONTO: aprovacaoElenco = true + aprovacaoPreProducao = true + storyboardUrl ou localGravacao preenchido

**Regra critica**: NAO pode mais adicionar videos ao projeto a partir desta fase. Lista TRAVADA.

**Resultado**: Quando TODOS os videos PRONTO, projeto avanca para Fase 4.

### 2.4 Fase 4: PRODUCAO & ENTREGA (Por video)

**Escopo**: Gravar videos e fazer upload dos hooks (deliverables).

**O que acontece para CADA video**:
1. Equipe grava o video
2. Produtor faz upload dos arquivos de video como deliverables (hooks)
3. Cada deliverable precisa de: arquivo, tempo, tamanho

**Areas**: Oslo OU UGC Manager

**Status do video nesta fase**:
- PENDENTE: Nenhum deliverable criado
- EM_PRODUCAO: Em gravacao (sem deliverables ainda)
- ENTREGUE: Pelo menos 1 deliverable com arquivo (fileId) uploaded

**Regra de deliverables**:
- Deliverables so podem ser CRIADOS a partir desta fase
- hookNumber eh automatico (proximo disponivel)
- Campos obrigatorios por deliverable: fileId, tempo, tamanho
- mostraProduto eh opcional (default false)
- Maximo 10 deliverables por video

**Resultado**: Quando TODOS os videos estao ENTREGUE (com >= 1 deliverable com arquivo), projeto avanca para Fase 5.

### 2.5 Fase 5: REVISAO & VALIDACAO FINAL (Por video)

**Escopo**: Revisar conteudo e design dos videos finais, obter validacao final de Compliance/Medico.

**O que acontece para CADA video**:
1. Growth/Trafego revisam conteudo (qualidade, mensagem, CTA, aderencia ao briefing)
2. Design revisa qualidade visual (branding, cores, legibilidade)
3. Compliance/Medico validam video FINAL editado (nao so roteiro)

**Areas revisao conteudo**: Growth OU Trafego  
**Areas revisao design**: Design  
**Areas validacao final**: Compliance OU Medico (qualquer um sozinho)

**Status do video nesta fase**:
- PENDENTE: Nenhuma revisao iniciada
- EM_REVISAO: Pelo menos 1 revisao em andamento
- VALIDANDO: Revisoes de conteudo e design feitas, aguardando compliance/medico
- PRONTO: revisaoConteudo = true + revisaoDesign = true + validacaoFinalCompliance = true + validacaoFinalMedico = true

**Regra de deliverables nesta fase**: Deliverables podem ser EDITADOS (trocar arquivo, ajustar tempo, tamanho, mostraProduto). Tambem podem ser ADICIONADOS novos hooks se necessario.

**Resultado**: Quando TODOS os videos PRONTO, projeto avanca para Fase 6.

### 2.6 Fase 6: APROVACAO & PUBLICACAO (Por video)

**Escopo**: Aprovacao final, atribuicao de AD numbers, geracao de nomenclatura, publicacao.

Esta fase tem 3 sub-etapas por video:

#### Sub-etapa 6A: Aprovacao Final
- Aprovador marca aprovacao final do video
- **Ao aprovar**: AD numbers sao atribuidos AUTOMATICAMENTE a todos os deliverables do video
- Atribuicao via AdCounter atomico, por hookNumber crescente
- Ex: Video com 3 hooks recebe AD0731, AD0732, AD0733

**Areas aprovacao final**: Growth OU Trafego OU Content Manager (HEAD only)

#### Sub-etapa 6B: Nomenclatura
- Sistema gera nomenclatura automaticamente para cada deliverable
- Trafego pode EDITAR a nomenclatura se necessario
- Trafego pode marcar isPost (post impulsionado) e ajustar versionNumber
- Campo nomenclatura_editada permite ajuste manual

**Areas nomenclatura**: Trafego (HEAD, COORDINATOR)

#### Sub-etapa 6C: Publicacao
- Trafego preenche link do anuncio no Meta Ads (campo manual)
- Video eh marcado como PUBLICADO

**Status do video nesta fase**:
- PENDENTE: Aguardando aprovacao final
- APROVADO: Aprovacao concedida, AD numbers atribuidos
- NOMENCLATURA: Nomenclatura gerada/editada, pronto para publicar
- PUBLICADO: Link do Meta Ads preenchido, video no ar

**Regras criticas**:
- Apos AD numbers atribuidos, deliverables sao IMUTAVEIS (exceto isPost, nomenclatura na sub-etapa Nomenclatura)
- AD numbers nunca mudam, nunca sao reutilizados
- Nomenclatura editavel APENAS na sub-etapa Nomenclatura
- Projeto eh COMPLETED quando TODOS os videos estao PUBLICADO

---

## 3. Regras de Multi-Area Approval

### 3.1 Conceito

Algumas etapas do workflow aceitam aprovacao de MULTIPLAS areas. A semantica eh sempre OR — qualquer membro de QUALQUER uma das areas listadas pode aprovar SOZINHO.

### 3.2 Mapeamento Completo de Areas por Acao

| Fase | Acao | Areas (OR) | Posicoes |
|------|------|-----------|----------|
| 1 | Aprovar briefing | Content Manager, Growth | HEAD, COORDINATOR |
| 2 | Escrever roteiro | Copywriting, Oslo | HEAD, COORDINATOR, STAFF |
| 2 | Validar roteiro (compliance) | Compliance, Medico | HEAD, COORDINATOR |
| 2 | Validar roteiro (medico) | Compliance, Medico | HEAD, COORDINATOR |
| 3 | Selecionar elenco | UGC Manager, Oslo | HEAD, COORDINATOR |
| 3 | Aprovar elenco | Growth | HEAD |
| 3 | Pre-producao | Oslo, Design | HEAD, COORDINATOR, STAFF |
| 3 | Aprovar pre-producao | Growth | HEAD |
| 4 | Producao e entrega | Oslo, UGC Manager | HEAD, COORDINATOR, STAFF |
| 5 | Revisao conteudo | Growth, Trafego | HEAD, COORDINATOR |
| 5 | Revisao design | Design | HEAD, COORDINATOR |
| 5 | Validacao final | Compliance, Medico | HEAD, COORDINATOR |
| 6 | Aprovacao final | Growth, Trafego, Content Manager | HEAD |
| 6 | Nomenclatura | Trafego | HEAD, COORDINATOR |

### 3.3 Regras de Checagem

1. Se a acao tem multiplas areas, checar se usuario eh membro de QUALQUER uma delas
2. Se a acao tem posicoes especificas, checar se a posicao do usuario na area eh uma das listadas
3. Se nenhuma area configurada, qualquer usuario pode atuar
4. SUPER_ADMIN bypassa toda checagem (ve secao 4)

---

## 4. Regras de SUPER_ADMIN Bypass

### 4.1 Quem tem bypass

| Usuario | Role | Bypass |
|---------|------|--------|
| Pedro | SUPER_ADMIN | SIM — aprova qualquer acao de qualquer fase |
| Lucas Rouxinol | SUPER_ADMIN | SIM — aprova qualquer acao de qualquer fase |
| Rafael Pro | ADMIN | NAO — segue regras normais de area |
| Rafael Lacoste | ADMIN | NAO — segue regras normais de area |

### 4.2 Implementacao

```
function canUserApproveAdAction(userId, action, userRole):
  // PASSO 1: Checar bypass
  if userRole === "SUPER_ADMIN":
    return true  // Bypass total
  
  // PASSO 2: Checar area membership
  areas = action.approverAreaIds
  positions = action.approverPositions
  
  if areas is empty:
    return true  // Sem restricao de area
  
  membership = findUserMembership(userId, areas, positions)
  return membership exists
```

### 4.3 Decisao Explicita

APENAS SUPER_ADMIN tem bypass. ADMIN NAO tem bypass no sistema de ads-types. Isso eh uma decisao deliberada para:
- Evitar que Rafael Lacoste (Financeiro, ADMIN) possa aprovar etapas de Design
- Manter controle granular sobre quem pode aprovar o que
- SUPER_ADMIN sao apenas Pedro e Lucas — ambos sao gestores seniores com visao completa

---

## 5. Regras de AD Counter

### 5.1 Conceito

O AdCounter eh uma tabela singleton que mantem o ultimo AD number usado. Cada deliverable recebe um AD number unico e sequencial global.

### 5.2 Valor Inicial

currentValue = 730. O proximo AD number a ser atribuido sera 731.

### 5.3 Operacao Atomica

A atribuicao de AD numbers DEVE ser atomica para prevenir race conditions:

```sql
UPDATE ad_counter 
SET "currentValue" = "currentValue" + 1 
RETURNING "currentValue";
```

Dentro de uma transacao Prisma. NUNCA usar `SELECT MAX() + 1` — isso causa duplicatas com requests concorrentes.

### 5.4 Quando Atribuir

AD numbers sao atribuidos na sub-etapa 6A (Aprovacao Final), automaticamente. O codigo que avanca o video para "APROVADO" deve:

1. Buscar todos deliverables do video que tem adNumber = null
2. Ordenar por hookNumber crescente
3. Para cada deliverable, chamar getNextAdNumber() (atomico)
4. Atualizar o deliverable com o adNumber retornado

### 5.5 Regras de Gaps

- AD numbers atribuidos NUNCA sao reutilizados, mesmo se o projeto for cancelado
- Gaps na sequencia sao aceitos e esperados
- Exemplo: Projeto A recebe AD0731, AD0732. Projeto B eh cancelado apos receber AD0733. Projeto C recebe AD0734. Resultado: sequencia 731, 732, 733 (queimado), 734.

---

## 6. Regras de Nomenclatura

### 6.1 Formula

```
AD####_AAAAMMDD_PRODUTORA_INFLUENCER_NOME_TEMA_ESTILO_FORMATO_TEMPO_TAMANHO[_PROD][_HK#][_V#][_POST]
```

### 6.2 Componentes

| Posicao | Campo | Origem | Exemplo |
|---------|-------|--------|---------|
| 1 | AD#### | adNumber do deliverable, 4 digitos zero-padded | AD0731 |
| 2 | AAAAMMDD | Data da aprovacao final (ou data atual) | 20260131 |
| 3 | PRODUTORA | Origin.code do projeto | OSLLO |
| 4 | INFLUENCER | Creator.code do video. Se nao tem: NO1. Se multiplos: MULTI | BRUNAWT |
| 5 | NOME | nomeDescritivo do video (sanitizado) | ROTINACBDMUDOU |
| 6 | TEMA | tema do video | ANSIEDADE |
| 7 | ESTILO | estilo do video | UGC |
| 8 | FORMATO | formato do video | VID |
| 9 | TEMPO | tempo do deliverable (so VID/MOT) | 30S |
| 10 | TAMANHO | tamanho do deliverable | 9X16 |

### 6.3 Sufixos Opcionais (nesta ordem)

| Sufixo | Condicao | Exemplo |
|--------|----------|---------|
| _PROD | mostraProduto = true | ..._9X16_PROD |
| _HK# | hookNumber > 1 | ..._HK2, ..._HK3 |
| _V# | versionNumber > 1 | ..._V2, ..._V3 |
| _POST | isPost = true | ..._POST |

### 6.4 Regras de Formatacao

- Tudo em MAIUSCULAS
- Separador: underscore `_` (unico separador permitido)
- Sem espacos, acentos ou caracteres especiais
- NOME: maximo 25 caracteres, sem palavras que ja estao em outros campos

### 6.5 Exemplos Completos

**Video com 1 hook, sem produto, dark post**:
```
AD0731_20260131_OSLLO_BRUNAWT_ROTINACBDMUDOU_ANSIEDADE_UGC_VID_30S_9X16
```

**Video com 2 hooks, com produto**:
```
AD0731_20260131_LAGENCY_RACHEL_CBDPARADORMR_SONO_DEPOI_VID_45S_9X16_PROD
AD0732_20260131_LAGENCY_RACHEL_CBDPARADORMR_SONO_DEPOI_VID_45S_9X16_PROD_HK2
```

**Hook com post impulsionado e versao 2**:
```
AD0733_20260131_CLICK_NO1_COMOFUNCIONA_GERAL_INST_MOT_15S_9X16_V2_POST
```

### 6.6 Edicao Manual

- Campo nomenclatura_editada no deliverable permite ajuste manual
- So editavel na sub-etapa Nomenclatura da Fase 6
- Se nomenclatura_editada estiver preenchido, usa ele. Se vazio, usa a gerada automaticamente.
- Botao "Resetar" na UI limpa o campo editado e volta para a gerada

### 6.7 Imutabilidade

Uma vez que o video eh marcado como PUBLICADO, a nomenclatura NUNCA mais muda.

---

## 7. Regras de Deliverables (Hooks)

### 7.1 Criacao

- So pode criar deliverables a partir da Fase 4 (Producao & Entrega)
- Tambem pode criar na Fase 5 (Revisao) se video ainda nao tem AD numbers
- Maximo 10 deliverables por video
- hookNumber eh sequencial automatico (proximo disponivel)
- hookNumber nao pode ser duplicado dentro do mesmo video
- hookNumber nao pode pular numeros (se tem HK1 e HK3, nao pode — precisa de HK2 antes)
- Campos obrigatorios na criacao: fileId, tempo, tamanho

### 7.2 Edicao

- Campos editaveis: fileId, tempo, tamanho, mostraProduto, descHook
- Editavel ate a sub-etapa 6A (Aprovacao Final)
- Apos aprovacao (adNumber atribuido), deliverable eh IMUTAVEL
- Excecoes apos aprovacao: isPost e nomenclatura sao editaveis na sub-etapa 6B (Nomenclatura)
- hookNumber NUNCA eh editavel

### 7.3 Delecao

- Pode deletar deliverable ate a sub-etapa 6A (Aprovacao Final)
- Apos adNumber atribuido, NAO pode deletar
- Ao deletar, hookNumbers dos deliverables restantes NAO sao resequenciados
- Ex: Se deleta HK2 de {HK1, HK2, HK3}, ficam {HK1, HK3}. Proximo hook criado sera HK4 (ou pode reusar HK2).
- Decisao: ao deletar um hook intermediario, o proximo hook criado REUTILIZA o numero deletado (preenche o gap)

### 7.4 Listagem

- Sempre ordenada por hookNumber crescente (1, 2, 3...)
- Inclui dados do arquivo (File) para preview de video
- Inclui nomenclatura quando disponivel

---

## 8. Regras de Lock e Imutabilidade

### 8.1 Adicao de Videos ao Projeto

| Fase do Projeto | Pode adicionar video? |
|-----------------|----------------------|
| Fase 1 (Briefing) | SIM |
| Fase 2 (Roteiro) | SIM (ultima chance) |
| Fase 3 (Elenco) | NAO — lista TRAVADA |
| Fase 4 (Producao) | NAO |
| Fase 5 (Revisao) | NAO |
| Fase 6 (Publicacao) | NAO |

### 8.2 Edicao de Campos do Video

| Campo | Editavel ate | Quem pode editar |
|-------|-------------|-----------------|
| nomeDescritivo | Fase 2 | Criador do projeto, membro da area da fase |
| tema, estilo, formato | Fase 2 | Criador do projeto, membro da area da fase |
| roteiro | Fase 5 (se video regredir) | Membro de Copywriting/Oslo |
| criadorId | Fase 3 | Membro de UGC Manager/Oslo |
| storyboard, locacao, data | Fase 4 | Membro de Oslo/Design |
| validacoes (checkboxes) | Fase onde sao marcadas | Membro da area respectiva |

### 8.3 Edicao de Deliverables

| Campo | Editavel ate | Excecao |
|-------|-------------|---------|
| fileId | Fase 6A (Aprovacao) | - |
| tempo | Fase 6A (Aprovacao) | - |
| tamanho | Fase 6A (Aprovacao) | - |
| mostraProduto | Fase 6A (Aprovacao) | - |
| descHook | Fase 6A (Aprovacao) | - |
| isPost | Fase 6B (Nomenclatura) | Editavel APOS aprovacao |
| versionNumber | Fase 6B (Nomenclatura) | Editavel APOS aprovacao |
| nomenclatura | Fase 6B (Nomenclatura) | Editavel APOS aprovacao |
| hookNumber | NUNCA | Imutavel desde criacao |
| adNumber | NUNCA (apos atribuicao) | Imutavel desde atribuicao |

### 8.4 Projeto

| Acao | Permitida quando |
|------|-----------------|
| Editar titulo/briefing | Ate Fase 2 |
| Editar deadline/prioridade | Qualquer fase (ate COMPLETED) |
| Cancelar | Qualquer momento (por criador ou ADMIN/SUPER_ADMIN) |
| Deletar | Somente se DRAFT (por criador ou ADMIN/SUPER_ADMIN) |

---

## 9. Regras de Regressao (Voltar Fase)

### 9.1 Quando Regredir

Se durante a revisao (Fase 5) ou outra fase posterior, um problema eh identificado em um video que requer retorno a uma fase anterior. Exemplo: roteiro tem erro de compliance — video precisa voltar para Fase 2.

### 9.2 Regras

- APENAS videos individuais podem regredir — o projeto inteiro NAO regride
- Quem pode enviar de volta: aprovador da fase atual do video (ou SUPER_ADMIN)
- Ao enviar de volta, obrigatorio informar motivo (campo rejectionReason)
- O video volta para a fase indicada com phaseStatus = PENDENTE
- Deliverables do video NAO sao deletados (mantidos para referencia)
- AD numbers ja atribuidos NAO sao revogados em regressao

### 9.3 Consequencias

- Se um video regride, a fase do PROJETO nao avanca (fica travada ate o video voltar a PRONTO)
- Exemplo: Projeto esta na Fase 5. Video #2 regride para Fase 2. Video #1 e #3 estao PRONTO na Fase 5. Resultado: Projeto continua na Fase 5, mas nao avanca para Fase 6 ate Video #2 percorrer novamente Fases 2-5 e ficar PRONTO.

### 9.4 Restricoes de Regressao

- Nao pode regredir para Fase 1 (Briefing) — isso seria cancelar o video
- Nao pode regredir apos AD numbers atribuidos (Fase 6A). Se ha problema apos AD, tratar com edicao na nomenclatura ou cancelamento.

---

## 10. Regras de Permissoes

### 10.1 Criar Ads Request

Qualquer usuario logado pode criar um AdProject. Nao ha restricao por area.

### 10.2 Visualizar

Qualquer usuario logado pode visualizar todos os AdProjects e seus videos/deliverables. Nao ha restricao de visibilidade.

### 10.3 Editar Campos

- Campos do PROJETO: editaveis pelo criador do projeto OU por membro de area da fase atual
- Campos do VIDEO: editaveis pelo criador do projeto OU por membro de area relevante para o campo
- Em DRAFT: somente o criador pode editar
- Apos COMPLETED: ninguem pode editar (read-only)
- ADMIN/SUPER_ADMIN podem editar em qualquer status (exceto COMPLETED)

### 10.4 Aprovar Fase/Acao

- Checagem: SUPER_ADMIN bypass → depois area membership + position
- Detalhado na Secao 3 (Multi-Area Approval) e Secao 4 (SUPER_ADMIN Bypass)

### 10.5 Cancelar/Deletar

- Cancelar projeto: criador ou ADMIN/SUPER_ADMIN
- Deletar projeto: criador ou ADMIN/SUPER_ADMIN, somente se DRAFT
- Deletar video: criador ou ADMIN/SUPER_ADMIN, somente ate Fase 2
- Deletar deliverable: criador ou membro da area, somente ate Fase 6A

---

## 11. Regras de Origin e Creator Codes

### 11.1 Origin Codes

Novo campo `code` (String, nullable) no modelo Origin existente.

| Origin Name | Slug (nao muda) | Code (novo) |
|-------------|-----------------|-------------|
| Oslo | oslo | OSLLO |
| Click | interno | CLICK |
| Lagency | influencer | LAGENCY |
| Chamber | chamber | CHAMBER |
| Freelancer | freelancer | OUTRO |

**Regra**: Slug nao muda (preserva FKs existentes). Apenas adiciona campo code.

### 11.2 Creator Codes

Novo campo `code` (String, nullable) no modelo Creator existente.

**Codes pre-definidos**:
| Creator | Code |
|---------|------|
| Leo do Taxi | LEOTX |
| Pedro Machado | PEDROM |
| Dr. Joao | DRJOAO |
| Dr. Felipe | DRFELIPE |
| Bruna Wright | BRUNAWT |
| Rachel | RACHEL |
| Irwen | IRWEN |
| Babi Rosa | BABIROSA |

**Codigos especiais**:
| Codigo | Significado | Quando usar |
|--------|-------------|-------------|
| NO1 | Ninguem | Video sem pessoa aparecendo |
| MULTI | Multiplas pessoas | Video com 2+ criadores |

**Auto-geracao**: Se Creator.code esta vazio, gerar automaticamente:
1. Pegar palavras do nome em maiusculas
2. Se 1 palavra: primeiros 6 caracteres
3. Se 2+ palavras: concatenar letras e preencher ate 6-8 chars
4. Remover acentos, espacos, caracteres especiais
5. Ex: "Maria Silva Santos" → MARISS

---

## 12. Integracao com Meta Ads (MVP)

### 12.1 Escopo MVP

- Campo manual `linkAnuncio` no AdVideo para colar link/ID do anuncio no Meta Ads
- Nomenclatura gerada automaticamente para uso como ad_name no Meta
- SEM integracao automatica com Meta Ads API
- SEM criacao automatica de anuncios
- SEM puxar metricas automaticamente

### 12.2 Fluxo

1. Video chega na sub-etapa Nomenclatura (Fase 6B)
2. Trafego copia a nomenclatura gerada
3. Trafego cria o anuncio no Meta Ads Manager manualmente
4. Trafego cola o link do anuncio no campo linkAnuncio
5. Trafego marca video como PUBLICADO

### 12.3 Rota Existente /ads

A rota `/ads` ja existe no sistema para analytics de Facebook Ads. Ads Request vive em `/ads-requests` — completamente separado. Nenhuma integracao entre os dois por agora.
