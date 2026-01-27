# MVP Sistema de Marketing Click Cannabis

# DOCUMENTO CONSOLIDADO: MVP Sistema de Marketing Click Cannabis
**Foco: Gestão de Criativos + Gestão de Influencers/Embaixadores**
**Versão:** 1.0
**Data:** 26 de Janeiro de 2026
**Autor:** Pedro Mota + Claude AI
**Status:** Consolidação para Validação
* * *
## ÍNDICE
1. [Contexto e Objetivo do MVP](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#1-contexto-e-objetivo-do-mvp)
2. [Escopo do MVP](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#2-escopo-do-mvp)
3. [Arquitetura Técnica](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#3-arquitetura-t%C3%A9cnica)
4. [Sistema de Permissões (Skills)](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#4-sistema-de-permiss%C3%B5es-skills)
5. [MÓDULO 1: Pipeline de Criativos](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#5-m%C3%B3dulo-1-pipeline-de-criativos)
6. [MÓDULO 2: Gestão de Influencers/Embaixadores](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#6-m%C3%B3dulo-2-gest%C3%A3o-de-influencersembaixadores)
7. [MÓDULO 3: Integração Oslo](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#7-m%C3%B3dulo-3-integra%C3%A7%C3%A3o-oslo)
8. [MÓDULO 4: Dashboard de Performance de Ads](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#8-m%C3%B3dulo-4-dashboard-de-performance-de-ads)
9. [Fluxos de Cobrança e Alertas](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#9-fluxos-de-cobran%C3%A7a-e-alertas)
10. [Estrutura do Banco de Dados (Proposta)](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#10-estrutura-do-banco-de-dados-proposta)
11. [Roadmap de Implementação](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#11-roadmap-de-implementa%C3%A7%C3%A3o)
12. [PERGUNTAS PENDENTES](https://claude.ai/chat/9e84ff05-eaf8-4004-9415-59176bdc7165#12-perguntas-pendentes)
* * *
# 1\. CONTEXTO E OBJETIVO DO MVP
## 1.1 Origem do Projeto
O projeto surge após uma **reunião de mapeamento de fluxos** (26/01/2026) onde a equipe identificou desorganização crítica em processos de marketing, especialmente:

| Problema Identificado | Impacto |
| ---| --- |
| Oslo não atualiza ClickUp | Perda de visibilidade das entregas |
| Falta validação estruturada de criativos | Qualidade inconsistente, compliance não verificado |
| Escala de produção (30 → 200 vídeos/mês) | Sistema atual não suporta volume |
| Influencers sem gestão centralizada | Controle manual, perdas de prazo |
| Métricas de Ads espalhadas | Decisões sem dados consolidados |

## 1.2 Objetivo do MVP
Criar um sistema centralizado que:
1. **Substitui completamente o ClickUp** para marketing
2. **Controla todo o ciclo de vida de criativos** (da solicitação à análise de performance)
3. **Gerencia influencers/embaixadores** (do onboarding à entrega final)
4. **Cobra entregas da Oslo e Influencers** (SLAs, alertas, histórico)
5. **Exibe métricas de performance** conectadas ao banco de Ads
## 1.3 Premissas do MVP
*   A estrutura e lógica devem estar preparadas para o projeto inteiro
*   Implementação inicial foca em: **Criativos + Influencers**
*   Demais módulos serão implementados após validação
* * *
# 2\. ESCOPO DO MVP
## 2.1 O que ENTRA no MVP

| Módulo | Funcionalidades |
| ---| --- |
| Pipeline de Criativos | Solicitação, briefing, produção, validação, aprovação, publicação, métricas |
| Gestão de Influencers | Cadastro, onboarding, contrato, entregáveis, entregas, pagamentos, histórico |
| Integração Oslo | Acesso limitado, atualização de status, feedback, SLA, alertas |
| Dashboard de Ads | Conexão com banco, métricas por criativo, filtros por patologia/origem |
| Sistema de Permissões | Níveis de acesso, skills configuráveis, validadores por etapa |
| Notificações | Email via Resend, alertas internos |

## 2.2 O que NÃO ENTRA no MVP
*   Blog/SEO
*   Redes Sociais
*   Endomarketing
*   Trade Marketing
*   Calendário Editorial
*   Relatórios automáticos
*   Integração SemRush/Search Console
*   Publicação automática em redes
## 2.3 Usuários do MVP

| Perfil | Exemplos | Acesso |
| ---| ---| --- |
| Super Admin | Pedro Mota | Acesso total + configurações |
| Head | Lucas Rouxinol, Head Marketing | Aprovações finais, dashboard |
| Coordenador | Samira, Vidjai (até desligamento) | Validações, gestão de equipes |
| Executor | Rafael Pro, Mauro, Andrea | Funções específicas por skill |
| Externo - Oslo | Equipe da agência | Suas entregas apenas |
| Externo - Influencer | Embaixadores ativos | Portal de entrega (futuro) |
| Bruna Wright | Gestão de Influencers | Módulo de influencers completo |

* * *
# 3\. ARQUITETURA TÉCNICA
## 3.1 Stack Definido

| Camada | Tecnologia | Observação |
| ---| ---| --- |
| Frontend | Next.js + React | A definir versão |
| Backend | Next.js API Routes | Full-stack |
| Banco de Dados | PostgreSQL | Novo banco dedicado |
| Hospedagem | Vercel | Deploy principal |
| Banco Cloud | Neon | PostgreSQL serverless |
| Armazenamento | Vercel Blob | Arquivos e assets |
| Email | Resend | API Key: `re_gBKBvUVv_QDn9QtXWavJszpfSWdAZ2ph7` |

## 3.2 Bancos Externos (Somente Leitura)
### Banco Principal Click Cannabis

```perl
postgresql://postgres:52439100@click-cannabis-production-postgres-rds-replica.cktooi4cqmri.us-east-1.rds.amazonaws.com:5432/click-database
```

**Uso:** Dados de pacientes/influencers (consultas, pagamentos, entregas)
### Banco de Ads

```perl
postgresql://click:52439100@159.203.75.72:5432/adtracker
```

**Uso:** Métricas de performance de anúncios (Meta Ads)
## 3.3 Decisão: Sem N8N
O sistema fará integrações **diretamente** com os serviços necessários, sem passar pelo N8N.
* * *
# 4\. SISTEMA DE PERMISSÕES (SKILLS)
## 4.1 Níveis de Usuário

| Nível | Descrição | Pode Configurar Sistema? |
| ---| ---| --- |
| Super Admin | Acesso total | ✅ Sim |
| Head | Aprovações finais, visão estratégica | ❌ Não |
| Coordenador | Gestão de área, validações | ❌ Não |
| Executor | Execução de tarefas específicas | ❌ Não |
| Externo | Acesso limitado a módulos específicos | ❌ Não |

## 4.2 Skills Configuráveis (MVP)

```swift
SKILLS DE CRIATIVOS:
├── solicitar_criativo
├── criar_briefing
├── aprovar_briefing
├── criar_roteiro
├── validar_roteiro_compliance
├── validar_roteiro_medico
├── produzir_criativo
├── revisar_criativo
├── aprovar_criativo_final
├── subir_criativo_ads
└── ver_metricas_criativo

SKILLS DE INFLUENCERS:
├── cadastrar_influencer
├── aprovar_influencer
├── criar_contrato
├── aprovar_contrato
├── registrar_entrega
├── validar_entrega
├── aprovar_pagamento
└── ver_historico_influencer

SKILLS DE ADMIN:
├── configurar_sistema
├── configurar_fluxos
├── configurar_validadores
├── gerenciar_usuarios
├── ver_todos_logs
└── ver_dashboard_completo
```

## 4.3 Validadores por Etapa (Configurável)
O sistema permite configurar **quem valida cada etapa** de cada fluxo:

```yaml
EXEMPLO: Fluxo de Criativo de Vídeo UGC
├── Etapa: Briefing
│   └── Validadores: [Content Manager] - Aprovação de 1 basta
├── Etapa: Roteiro
│   └── Validadores: [Médico, Content Manager] - Opcional: [Jurídico]
│   └── Regra: Todos devem aprovar OU pelo menos 2 de 3
├── Etapa: Produção (Entrega)
│   └── Validadores: [Vidjai, Mauro]
├── Etapa: Revisão Final
│   └── Validadores: [Pedro Mota, Lucas Rouxinol]
└── Etapa: Performance
    └── Validadores: [Rafael Pro]
```

**Pontos a definir:**
*   Quais validações são obrigatórias vs opcionais?
*   Aprovação de todos necessária ou apenas de 1?
*   Quem pode "pular" etapas em casos excepcionais?
* * *
# 5\. MÓDULO 1: PIPELINE DE CRIATIVOS
## 5.1 Visão Geral
Gerencia o **ciclo de vida completo** de criativos, desde a solicitação inicial até a análise de performance pós-publicação.
## 5.2 Ciclo de Vida (Status)

```yaml
FLUXO PRINCIPAL:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  SOLICITAÇÃO    CRIAÇÃO        VALIDAÇÃO      PRODUÇÃO     DISTRIBUIÇÃO    │
│  ──────────     ───────        ─────────      ────────     ────────────    │
│                                                                             │
│  Ideia ──► Briefing ──► Roteiro ──► Produção ──► Revisão ──► Aprovado     │
│    │           │            │           │           │            │         │
│    ▼           ▼            ▼           ▼           ▼            ▼         │
│ Aguardando  Aprovação   Validação   Entrega     Ajustes      No Ar        │
│             Briefing    Compliance  do Arquivo  Finais                     │
│                                                                 │          │
│                                                                 ▼          │
│                                                            Pausado         │
│                                                                 │          │
│                                                                 ▼          │
│                                                            Encerrado       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

FLUXO DE REPROVAÇÃO (pode acontecer em qualquer etapa):
Reprovado ──► Volta para etapa anterior ──► Ajuste ──► Resubmissão

FLUXO DE CANCELAMENTO:
Qualquer etapa ──► Descontinuado (com motivo obrigatório)
```

## 5.3 Status Detalhados

| Status | Descrição | Próximos Status Possíveis |
| ---| ---| --- |
| `ideia` | Sugestão inicial, ainda não validada | briefing, descontinuado |
| `aguardando_briefing` | Ideia aprovada, esperando briefing | briefing\_em\_criacao |
| `briefing_em_criacao` | Briefing sendo escrito | briefing\_pendente\_aprovacao |
| `briefing_pendente_aprovacao` | Aguardando validação do briefing | roteiro, reprovado\_briefing |
| `roteiro_em_criacao` | Roteiro/copy sendo escrito | roteiro\_pendente\_aprovacao |
| `roteiro_pendente_aprovacao` | Aguardando validação do roteiro | roteiro\_aprovado, reprovado\_roteiro |
| `em_producao` | Criativo sendo produzido | entrega\_pendente |
| `entrega_pendente` | Aguardando upload do arquivo | em\_revisao |
| `em_revisao` | Em análise de qualidade | aprovado, reprovado\_revisao |
| `aprovado` | Aprovado, pronto para subir | no\_ar |
| `no_ar` | Rodando em campanhas de Ads | pausado, encerrado |
| `pausado` | Temporariamente parado | no\_ar, encerrado |
| `encerrado` | Finalizado definitivamente | \- |
| `descontinuado` | Cancelado (com motivo) | \- |

## 5.4 Tipos de Criativos

| Tipo | Descrição | Origem Típica |
| ---| ---| --- |
| `video_ugc` | Vídeo com pessoa real (UGC) | Influencer, Oslo |
| `video_institucional` | Vídeo institucional da marca | Oslo, Interno |
| `carrossel` | Sequência de imagens | Oslo, Interno |
| `post_unico` | Imagem única para feed | Oslo, Interno |
| `stories` | Conteúdo vertical para stories | Oslo, Influencer |
| `reels` | Vídeo curto para Reels | Oslo, Influencer |

## 5.5 Origens do Criativo

| Origem | Descrição | Diferenças no Fluxo |
| ---| ---| --- |
| `oslo` | Produzido pela agência Oslo | Oslo atualiza status, Click valida |
| `interno` | Produzido pela equipe Click | Equipe Click produz e valida |
| `influencer` | Entregue por influencer/embaixador | Influencer entrega, Click valida |

**⚠️ PERGUNTA PENDENTE:** Quais são as diferenças exatas de fluxo entre cada origem?
## 5.6 Campos do Criativo
### Campos Obrigatórios

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `id` | uuid | Identificador único |
| `nome` | string | Nomenclatura padrão (configurável) |
| `tipo` | enum | Tipo do criativo |
| `origem` | enum | Oslo, Interno, Influencer |
| `status` | enum | Etapa atual do fluxo |
| `responsavel_atual_id` | uuid | Quem está com a "bola" agora |
| `data_criacao` | datetime | Quando foi criado |
| `data_atualizacao` | datetime | Última atualização |

### Campos Opcionais

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `patologia` | enum | Insônia, Ansiedade, Dor, Emagrecimento, Geral |
| `briefing` | text | Descrição do que deve ser feito |
| `roteiro` | text | Roteiro/copy do criativo |
| `copy_id` | uuid | Link para copy do banco de copies |
| `custo_producao` | decimal | Custo total de produção |
| `versao` | int | Número da versão (v1, v2, v3...) |
| `criativo_pai_id` | uuid | Se for versão, link para o original |
| `influencer_id` | uuid | Se origem = influencer |
| `data_deadline` | date | Prazo de entrega |
| `prioridade` | enum | Baixa, Normal, Alta, Urgente |
| `tags` | array | Tags customizáveis |

### Campos de Arquivos

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `arquivos` | array | Upload, link Drive, link [Frame.io](http://Frame.io) |
| `thumbnail` | string | Imagem de preview |

### Campos de Métricas (após No Ar)

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `ad_name` | string | Nome do anúncio no Meta Ads (para vincular métricas) |
| `data_inicio_veiculacao` | date | Quando começou a rodar |
| `data_fim_veiculacao` | date | Quando parou |

## 5.7 Nomenclatura de Criativos
**Definido:** A nomenclatura será **configurável nas settings do sistema**.
**Formato sugerido (a confirmar):**

```css
[DATA]_[PATOLOGIA]_[TIPO]_[ORIGEM]_[VERSÃO]

Exemplo: 20260126_INSONIA_VIDEO_UGC_OSLO_V1
```

**⚠️ PERGUNTA PENDENTE:** Qual é a regra exata de nomenclatura?
## 5.8 Fluxo de Solicitação de Criativo

```markdown
1. SOLICITANTE cria uma IDEIA
   - Preenche: tipo, patologia (opcional), descrição básica, prioridade
   
2. VALIDADOR DE IDEIA aprova ou rejeita
   - Se aprovada: status = aguardando_briefing
   - Se rejeitada: status = descontinuado (com motivo)

3. RESPONSÁVEL PELO BRIEFING recebe a tarefa
   - Preenche: briefing detalhado, referências, deadline
   - Submete para aprovação

4. VALIDADOR DE BRIEFING aprova ou solicita ajustes
   - Se aprovado: status = roteiro_em_criacao
   - Se ajustes: volta para responsável pelo briefing

5. REDATOR/COPYWRITER cria o roteiro
   - Preenche: roteiro, copy, CTA
   - Submete para validação

6. VALIDADORES DE ROTEIRO validam
   - Compliance: verifica regras do setor
   - Médico: verifica informações de saúde (quando aplicável)
   - Se aprovado: status = em_producao
   - Se ajustes: volta para redator

7. PRODUTOR (Oslo, Interno ou Influencer) produz
   - Faz upload do arquivo ou envia link
   - Submete para revisão

8. REVISORES avaliam qualidade
   - Qualidade visual, áudio, alinhamento com briefing
   - Se aprovado: status = aprovado
   - Se ajustes: volta para produtor (versão incrementa)

9. APROVADOR FINAL dá ok para rodar
   - Lucas, Pedro Mota ou Head de Marketing
   - Se aprovado: status = pronto_para_subir

10. GESTOR DE TRÁFEGO sobe no Meta Ads
    - Vincula ad_name do Meta com o criativo
    - status = no_ar
```

## 5.9 Versionamento de Criativos
Quando um criativo é **reprovado na revisão**, não cria um novo registro. Em vez disso:
1. O campo `versao` incrementa (v1 → v2 → v3)
2. O histórico de arquivos é mantido
3. Os comentários de reprovação ficam registrados
4. O status volta para a etapa de ajuste
## 5.10 Validação e Compliance
### Tipos de Validação

| Tipo | Quem Faz | Quando | Obrigatório? |
| ---| ---| ---| --- |
| Validação de Briefing | Content Manager | Após criação do briefing | Sim |
| Validação de Compliance | Jurídico ou Compliance | No roteiro | Configurável |
| Validação Médica | Médico | No roteiro (se menciona saúde) | Configurável |
| Validação de Design | Vidjai, Mauro | Na entrega do criativo | Sim |
| Aprovação Final | Lucas, Pedro, Head | Antes de subir | Sim |

### Checklist de Compliance (A Configurar)
**⚠️ PERGUNTA PENDENTE:** Quais são os itens exatos do checklist de compliance?
Sugestões:
*   \[ \] Não menciona "cura"
*   \[ \] Não faz promessas irreais
*   \[ \] Não mostra produtos controlados
*   \[ \] Depoimento tem disclaimer
*   \[ \] Imagens aprovadas para uso
*   \[ \] Não menciona concorrentes
## 5.11 Histórico e Auditoria
Cada criativo terá um **log completo** de:

| Evento | Campos Registrados |
| ---| --- |
| Criação | quem, quando, dados iniciais |
| Mudança de Status | quem, quando, de qual para qual, comentário |
| Upload de Arquivo | quem, quando, arquivo, versão |
| Aprovação/Reprovação | quem, quando, tipo validação, comentário |
| Vinculação com Ad | quem, quando, ad\_name |
| Mudança de Métricas | quando, métricas anteriores vs novas |

* * *
# 6\. MÓDULO 2: GESTÃO DE INFLUENCERS/EMBAIXADORES
## 6.1 Visão Geral
Gerencia o **ciclo de vida completo** de influencers e embaixadores, desde a prospecção até o acompanhamento de resultados.
## 6.2 Definições

| Termo | Descrição | Diferença |
| ---| ---| --- |
| Influencer | Pessoa com audiência que produz conteúdo para Click | Relação pontual ou de curto prazo |
| Embaixador | Influencer com relacionamento contínuo com a Click | Contrato de longo prazo, representante da marca |
| UGC Creator | Produtor de conteúdo sem necessariamente ter audiência própria | Foco na produção, não na distribuição |

**⚠️ PERGUNTA PENDENTE:** Quais são as diferenças práticas de fluxo entre cada um?
## 6.3 Ciclo de Vida do Influencer

```css
PROSPECÇÃO              NEGOCIAÇÃO            ONBOARDING
──────────              ──────────            ──────────
Prospectando ──► Contatado ──► Em negociação ──► Contrato enviado

                    ATIVO                      ENCERRADO
                    ─────                      ─────────
──► Contrato assinado ──► Ativo ──► Pausado ──► Encerrado
         │                  │
         ▼                  ▼
    Onboarding         Produzindo
    (paciente Click)   entregas
```

## 6.4 Status do Influencer

| Status | Descrição | Ações Disponíveis |
| ---| ---| --- |
| `prospectando` | Identificado, ainda não contatado | Contatar, Descartar |
| `contatado` | Primeiro contato realizado | Negociar, Descartar |
| `em_negociacao` | Em discussão de termos | Enviar contrato, Descartar |
| `contrato_enviado` | Aguardando assinatura | Registrar assinatura, Cancelar |
| `contrato_assinado` | Pronto para iniciar | Iniciar onboarding |
| `em_onboarding` | Passando pelo fluxo de paciente | Concluir onboarding |
| `ativo` | Produzindo entregas | Registrar entrega, Pausar, Encerrar |
| `pausado` | Temporariamente inativo | Reativar, Encerrar |
| `encerrado` | Relacionamento finalizado | Reativar (raro) |
| `descartado` | Não avançou na prospecção | \- |

## 6.5 Campos do Influencer
### Dados Cadastrais

| Campo | Tipo | Obrigatório | Descrição |
| ---| ---| ---| --- |
| `id` | uuid | Sim | Identificador único |
| `nome` | string | Sim | Nome completo |
| `instagram` | string | Sim | @ do Instagram |
| `tipo` | enum | Sim | Influencer, Embaixador, UGC Creator |
| `status` | enum | Sim | Status atual |
| `nicho` | array | Não | Nichos de atuação |
| `seguidores` | int | Não | Número de seguidores |

### Dados Pessoais

| Campo | Tipo | Obrigatório | Descrição |
| ---| ---| ---| --- |
| `cpf_cnpj` | string | Contrato | CPF ou CNPJ |
| `email` | string | Sim | Email de contato |
| `telefone` | string | Sim | Telefone/WhatsApp |
| `endereco` | object | Envio produto | Endereço completo |
| `dados_bancarios` | object | Pagamento | Banco, agência, conta, PIX |

### Vinculação com Click

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `user_id_click` | int | ID do usuário no banco Click (se for paciente) |
| `fez_consulta` | boolean | Se já fez consulta médica (puxado automaticamente) |
| `recebeu_receita` | boolean | Se já recebeu receita (puxado automaticamente) |
| `recebeu_produto` | boolean | Se já recebeu produto (puxado automaticamente) |

### Dados Contratuais

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `valor_contrato` | decimal | Valor acordado |
| `forma_pagamento` | enum | Fixo, Por entrega, Performance |
| `data_inicio_contrato` | date | Início do contrato |
| `data_fim_contrato` | date | Fim do contrato |
| `contrato_arquivo` | string | Link para contrato assinado |

## 6.6 Fluxo de Onboarding
O influencer precisa passar pelo **fluxo de paciente da Click** antes de gravar:

```markdown
1. CADASTRO NO SISTEMA
   - Bruna cadastra influencer com dados básicos
   
2. VINCULAÇÃO COM BANCO CLICK
   - Coloca user_id do influencer
   - Sistema puxa automaticamente: consultas, pagamentos, entregas
   
3. VERIFICAÇÃO DE REQUISITOS
   - Fez consulta médica? ✅/❌
   - Recebeu receita? ✅/❌
   - Recebeu produto? ✅/❌
   
4. SE TODOS ✅ → Status = Ativo
   SE ALGUM ❌ → Alerta para Bruna acompanhar
```

## 6.7 Entregáveis do Influencer
Cada influencer pode ter **múltiplos entregáveis** acordados:

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `id` | uuid | Identificador único |
| `influencer_id` | uuid | Influencer vinculado |
| `tipo_entrega` | enum | Vídeo Ads, Stories, Post Feed, Presença Evento, Outro |
| `quantidade` | int | Quantidade acordada |
| `descricao` | text | Detalhes do entregável |
| `deadline` | date | Prazo de entrega |
| `valor_unitario` | decimal | Valor por unidade (se aplicável) |
| `status` | enum | Pendente, Em produção, Entregue, Aprovado, Reprovado |

## 6.8 Registro de Entregas
Quando o influencer faz uma entrega:

```markdown
1. BRUNA OU INFLUENCER registra a entrega
   - Upload de comprovante (imagem, vídeo, link)
   - Seleciona qual entregável está sendo entregue
   
2. VALIDADOR revisa a entrega
   - Verifica qualidade
   - Verifica conformidade com briefing
   - Aprova ou solicita ajustes
   
3. SE APROVADO:
   - Entrega vinculada ao criativo (se for vídeo para Ads)
   - Atualiza contagem de entregas
   - Libera para pagamento (se aplicável)
```

## 6.9 Controle de Envio de Produtos

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `id` | uuid | Identificador único |
| `influencer_id` | uuid | Influencer vinculado |
| `data_pedido` | date | Quando foi solicitado |
| `data_envio` | date | Quando foi enviado |
| `codigo_rastreio` | string | Código dos Correios |
| `data_recebimento` | date | Quando o influencer recebeu |
| `status` | enum | Aguardando, Enviado, Em trânsito, Entregue, Problema |

**⚠️ MVP:** Controle manual (sem integração Correios)
## 6.10 Histórico do Influencer
Cada influencer terá um **histórico completo** de:
*   Todas as entregas realizadas
*   Todos os criativos produzidos
*   Performance dos criativos (conectado ao banco de Ads)
*   Pagamentos realizados
*   Produtos enviados/recebidos
*   Comentários e anotações
## 6.11 Métricas do Influencer

| Métrica | Cálculo |
| ---| --- |
| Total de entregas | Contagem de entregas aprovadas |
| Taxa de aprovação | Aprovadas / Total \* 100 |
| Custo total | Soma de pagamentos |
| Receita gerada | Soma de receita dos criativos (via banco Ads) |
| ROI | Receita / Custo |

* * *
# 7\. MÓDULO 3: INTEGRAÇÃO OSLO
## 7.1 Visão Geral
A Oslo é a agência que produz a maior parte dos criativos. O sistema precisa:
1. Dar **acesso limitado** à Oslo
2. Permitir que **atualizem status** das suas entregas
3. **Cobrar entregas** com SLA e alertas
4. Registrar **feedback** de ida e volta
5. Mostrar **resultados** dos criativos para a Oslo
## 7.2 Acesso da Oslo

| Permissão | Descrição |
| ---| --- |
| Ver suas entregas | Apenas criativos onde origem = oslo |
| Atualizar status | De "em\_producao" para "entrega\_pendente" |
| Fazer upload | Subir arquivo ou link [Frame.io](http://Frame.io) |
| Ver feedback | Comentários da Click sobre entregas |
| Responder feedback | Adicionar comentários |
| Ver métricas | Performance dos seus criativos |
| NÃO pode | Ver outros criativos, aprovar, configurar sistema |

## 7.3 SLA de Entregas

| Tipo de Criativo | SLA Padrão | SLA Urgente |
| ---| ---| --- |
| Vídeo UGC | 7 dias úteis | 3 dias úteis |
| Vídeo Institucional | 10 dias úteis | 5 dias úteis |
| Carrossel | 3 dias úteis | 1 dia útil |
| Post Único | 2 dias úteis | 1 dia útil |

**⚠️ PERGUNTA PENDENTE:** Quais são os SLAs reais definidos?
## 7.4 Sistema de Alertas

| Situação | Alerta | Para Quem |
| ---| ---| --- |
| 2 dias antes do deadline | Lembrete amigável | Oslo + Responsável Click |
| No dia do deadline | Alerta de prazo | Oslo + Responsável Click |
| 1 dia após deadline | Alerta de atraso | Oslo + Responsável Click + Head |
| 3 dias após deadline | Escalonamento | Oslo + Head + CEO |

**Canais de alerta:** Email (Resend) + Notificação interna no sistema
## 7.5 Feedback e Ajustes

```markdown
FLUXO DE FEEDBACK:

1. CLICK reprova entrega
   - Obrigatório: motivo detalhado
   - Opcional: anexo com marcações
   
2. OSLO recebe notificação
   - Vê feedback no sistema
   - Pode responder/comentar
   
3. OSLO faz ajuste
   - Upload de nova versão
   - Versão incrementa (v1 → v2)
   
4. CLICK revisa novamente
   - Histórico completo visível
```

## 7.6 Relatório Oslo (Futuro)
Relatório automático com:

| Seção | Conteúdo |
| ---| --- |
| Entregas do período | Quantidade por tipo |
| Prazos | No prazo vs Atrasados |
| Qualidade | Aprovados de primeira vs Com revisão |
| Performance | Métricas dos criativos |

* * *
# 8\. MÓDULO 4: DASHBOARD DE PERFORMANCE DE ADS
## 8.1 Visão Geral
Dashboard conectado ao **banco de Ads** para exibir métricas de performance por criativo.
## 8.2 Estrutura do Banco de Ads

| Informação | Valor |
| ---| --- |
| Banco | PostgreSQL (adtracker) |
| Tabela principal | facebook\_ads\_insights |
| Total de registros | ~69.245 |
| Período | Julho/2024 até presente |

### Hierarquia

```markdown
Conta (account_id)
  └── Campanha (campaign_name)
        └── Conjunto de Anúncios (adset_name)
              └── Criativo/Anúncio (ad_name)
```

## 8.3 Métricas Principais

| Métrica | Fonte | Descrição |
| ---| ---| --- |
| Investimento | spend | Valor gasto em R$ |
| Impressões | impressions | Exibições |
| Cliques | link\_clicks | Cliques no link |
| Cadastros | complete\_registration | Leads gerados |
| Deals | custom\_conversion\_data (CP\_Click\_deal) | Negociações criadas |
| Pag. Consulta | custom\_conversion\_data (CP\_Click\_payment\_consulting) | Consultas pagas |
| Pag. Orçamento | custom\_conversion\_data (CP\_Click\_payment\_product) | Orçamentos pagos |
| Receita | custom\_conversion\_data (monetary\_value) | Faturamento gerado |

## 8.4 Métricas Calculadas

| Métrica | Fórmula |
| ---| --- |
| CPM | (spend / impressions) \* 1000 |
| CTR | (link\_clicks / impressions) \* 100 |
| CPC | spend / link\_clicks |
| CPL | spend / complete\_registration |
| Custo por Deal | spend / deals |
| Custo por Pag. Consulta | spend / pagamentos\_consulting |
| Custo por Pag. Orçamento | spend / pagamentos\_product |
| ROAS | receita / spend |

## 8.5 Filtros do Dashboard

| Filtro | Opções |
| ---| --- |
| Período | Hoje, 7 dias, 30 dias, Custom |
| Conta | Account 1, Account 3, Todas |
| Campanha | Lista de campanhas |
| Patologia | Insônia, Ansiedade, Dor, etc. |
| Origem | Oslo, Interno, Influencer |
| Tipo | Vídeo, Carrossel, etc. |

## 8.6 Vinculação Criativo ↔ Ad
Para conectar criativo do sistema com anúncio do Meta:
1. Gestor de Tráfego sobe criativo no Meta Ads
2. Registra o `ad_name` no criativo do sistema
3. Sistema consulta banco de Ads pelo `ad_name`
4. Métricas ficam disponíveis no criativo
**⚠️ PERGUNTA PENDENTE:** O ad\_name segue algum padrão? Como garantir correspondência?
## 8.7 Sincronização de Dados

| Tipo | Frequência |
| ---| --- |
| Automática | A cada 1 hora |
| Manual | Botão "Sincronizar" |
| On-demand | Refresh na página |

* * *
# 9\. FLUXOS DE COBRANÇA E ALERTAS
## 9.1 Cobrança de Entregas (Oslo)

```yaml
GATILHOS DE ALERTA:

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  D-2 (2 dias antes)                                    │
│  ├── Notificação: "Entrega X vence em 2 dias"          │
│  └── Para: Oslo, Responsável Click                      │
│                                                         │
│  D-0 (no dia)                                          │
│  ├── Notificação: "Entrega X vence HOJE"               │
│  └── Para: Oslo, Responsável Click                      │
│                                                         │
│  D+1 (1 dia após)                                      │
│  ├── Alerta: "Entrega X está ATRASADA (1 dia)"         │
│  └── Para: Oslo, Responsável Click, Head Marketing      │
│                                                         │
│  D+3 (3 dias após)                                     │
│  ├── Escalonamento: "Entrega X ATRASADA (3 dias)"      │
│  └── Para: Oslo, Head Marketing, CEO                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 9.2 Cobrança de Entregas (Influencers)

```yaml
GATILHOS DE ALERTA:

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  D-3 (3 dias antes)                                    │
│  ├── Notificação: "Entrega de [Influencer] vence em 3d"│
│  └── Para: Bruna, Influencer (se tiver acesso)          │
│                                                         │
│  D-0 (no dia)                                          │
│  ├── Notificação: "Entrega de [Influencer] vence HOJE" │
│  └── Para: Bruna, Influencer                            │
│                                                         │
│  D+2 (2 dias após)                                     │
│  ├── Alerta: "Entrega de [Influencer] ATRASADA"        │
│  └── Para: Bruna, Head Marketing                        │
│                                                         │
│  D+5 (5 dias após)                                     │
│  ├── Escalonamento: "AÇÃO NECESSÁRIA: [Influencer]"    │
│  └── Para: Bruna, Head Marketing, CEO                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 9.3 Alertas Internos (Validações Pendentes)

```yaml
GATILHOS:

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Criativo aguardando validação > 24h                   │
│  ├── Notificação: "Criativo X aguarda sua validação"   │
│  └── Para: Validador designado                          │
│                                                         │
│  Criativo aguardando validação > 48h                   │
│  ├── Alerta: "URGENTE: Criativo X aguarda validação"   │
│  └── Para: Validador + Head                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

* * *
# 10\. ESTRUTURA DO BANCO DE DADOS (PROPOSTA)
## 10.1 Tabelas Principais
### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nivel ENUM('super_admin', 'head', 'coordenador', 'executor', 'externo'),
  tipo_externo ENUM('oslo', 'influencer') NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user\_skills

```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  skill VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### criativos

```sql
CREATE TABLE criativos (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo ENUM('video_ugc', 'video_institucional', 'carrossel', 'post_unico', 'stories', 'reels'),
  origem ENUM('oslo', 'interno', 'influencer'),
  status VARCHAR(50) NOT NULL,
  patologia VARCHAR(50) NULL,
  briefing TEXT NULL,
  roteiro TEXT NULL,
  copy_id UUID NULL,
  custo_producao DECIMAL(10,2) NULL,
  versao INT DEFAULT 1,
  criativo_pai_id UUID REFERENCES criativos(id) NULL,
  influencer_id UUID REFERENCES influencers(id) NULL,
  responsavel_atual_id UUID REFERENCES users(id),
  data_deadline DATE NULL,
  prioridade ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
  ad_name VARCHAR(255) NULL,
  data_inicio_veiculacao DATE NULL,
  data_fim_veiculacao DATE NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### criativo\_arquivos

```sql
CREATE TABLE criativo_arquivos (
  id UUID PRIMARY KEY,
  criativo_id UUID REFERENCES criativos(id),
  versao INT,
  tipo ENUM('upload', 'drive', 'frameio'),
  url VARCHAR(500),
  nome_arquivo VARCHAR(255),
  tamanho_bytes BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### criativo\_validacoes

```sql
CREATE TABLE criativo_validacoes (
  id UUID PRIMARY KEY,
  criativo_id UUID REFERENCES criativos(id),
  tipo_validacao VARCHAR(50),
  validador_id UUID REFERENCES users(id),
  status ENUM('pendente', 'aprovado', 'reprovado'),
  comentario TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### criativo\_historico

```sql
CREATE TABLE criativo_historico (
  id UUID PRIMARY KEY,
  criativo_id UUID REFERENCES criativos(id),
  usuario_id UUID REFERENCES users(id),
  acao VARCHAR(100),
  dados_anteriores JSONB,
  dados_novos JSONB,
  comentario TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### influencers

```sql
CREATE TABLE influencers (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  instagram VARCHAR(100) NOT NULL,
  tipo ENUM('influencer', 'embaixador', 'ugc_creator'),
  status VARCHAR(50),
  nicho JSONB,
  seguidores INT,
  cpf_cnpj VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco JSONB,
  dados_bancarios JSONB,
  user_id_click INT,
  fez_consulta BOOLEAN DEFAULT false,
  recebeu_receita BOOLEAN DEFAULT false,
  recebeu_produto BOOLEAN DEFAULT false,
  valor_contrato DECIMAL(10,2),
  forma_pagamento ENUM('fixo', 'por_entrega', 'performance'),
  data_inicio_contrato DATE,
  data_fim_contrato DATE,
  contrato_arquivo VARCHAR(500),
  motivo_encerramento TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### influencer\_entregaveis

```sql
CREATE TABLE influencer_entregaveis (
  id UUID PRIMARY KEY,
  influencer_id UUID REFERENCES influencers(id),
  tipo_entrega VARCHAR(50),
  quantidade INT,
  descricao TEXT,
  deadline DATE,
  valor_unitario DECIMAL(10,2),
  status ENUM('pendente', 'em_producao', 'entregue', 'aprovado', 'reprovado'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### influencer\_entregas

```sql
CREATE TABLE influencer_entregas (
  id UUID PRIMARY KEY,
  entregavel_id UUID REFERENCES influencer_entregaveis(id),
  criativo_id UUID REFERENCES criativos(id) NULL,
  comprovante_url VARCHAR(500),
  comentario TEXT,
  status ENUM('pendente', 'aprovada', 'reprovada'),
  data_entrega TIMESTAMP DEFAULT NOW(),
  validador_id UUID REFERENCES users(id) NULL,
  data_validacao TIMESTAMP NULL
);
```

### influencer\_envios\_produto

```sql
CREATE TABLE influencer_envios_produto (
  id UUID PRIMARY KEY,
  influencer_id UUID REFERENCES influencers(id),
  data_pedido DATE,
  data_envio DATE,
  codigo_rastreio VARCHAR(50),
  data_recebimento DATE,
  status ENUM('aguardando', 'enviado', 'em_transito', 'entregue', 'problema'),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### configuracoes\_fluxo

```sql
CREATE TABLE configuracoes_fluxo (
  id UUID PRIMARY KEY,
  tipo_criativo VARCHAR(50),
  etapa VARCHAR(50),
  validadores_ids JSONB, -- array de user_ids
  validadores_grupo VARCHAR(100) NULL, -- ou nome do grupo
  regra_aprovacao ENUM('todos', 'pelo_menos_um', 'maioria'),
  obrigatorio BOOLEAN DEFAULT true,
  ordem INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### notificacoes

```sql
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES users(id),
  tipo VARCHAR(50),
  titulo VARCHAR(255),
  mensagem TEXT,
  link VARCHAR(500),
  lida BOOLEAN DEFAULT false,
  enviada_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

* * *

* * *
# 12\. PERGUNTAS PENDENTES
## 12.1 Perguntas sobre Pipeline de Criativos
**1.** Qual é a **nomenclatura padrão** de criativos? Quais campos compõem o nome automaticamente?
Resposta: Veja o arquivo em /docs manual\_nomenclaturas\_click\_ads

**2.** Quais são os **itens exatos do checklist de compliance**? (Do's and Don'ts)
Resposta: nao sei, coloque exemplos e depois ajustamos

**3.** Para cada tipo de criativo, quais **validações são obrigatórias** vs opcionais?
Resposta: Vai variar

**4.** Quais são as **diferenças exatas de fluxo** entre origem Oslo, Interno e Influencer?
Resposta: Preciso de ajuda para mapear, pois pensando melhor, eles sao bem parecidos (quase identicos).

**5.** Quando um criativo é reprovado, ele **sempre volta para a etapa anterior** ou pode ir para uma etapa específica?
Resposta: Ele vai para revisao com o motivo da reprovação.

**6.** Quem pode **"pular" etapas** em casos excepcionais? Existe esse conceito?
Resposta: Não

**7.** A validação de Compliance é **obrigatória para todos os tipos** de criativo ou só para alguns?
Resposta: Todos

**8.** A validação Médica é obrigatória **sempre que menciona saúde** ou só para patologias específicas?
Resposta: Todos

**9.** Um criativo pode estar **em múltiplas campanhas** simultaneamente? Como tratar isso no sistema?
Resposta: Sim

**10.** Quando um criativo é "Encerrado", ele pode ser **reativado** ou é definitivo?
Resposta: Sim, pode ser reativado, para sabermos os criativos que estão rodando temos que ver o banco de dados de ADS

**11.** Existe **limite de versões** (v1, v2, v3...) antes de descartar um criativo?
Resposta: Não

**12.** Como funciona a **vinculação entre criativo do sistema e ad\_name do Meta**? É manual ou existe padrão?
Resposta: Quero que seja manual, na etapa final de pós entrega do criativo, deve ter um local onde eu posso atrelar ele a um criativo que está rodando em ADS (puxamos a lista do banco de dados de Anúncios - Arquivo Documentação Banco de dados Ads - Schema
## 12.2 Perguntas sobre Influencers
**13.** Quais são as **diferenças práticas de fluxo** entre Influencer, Embaixador e UGC Creator?
Resposta: Embaixador é um dos rostos da Click, colocamos a foto dele no site, ele vai ter um contrato direto com a Click, é outro tipo de tratamento pós. Normalmente influenciadores (UGC Creator) a Bruna Wright ficará em contato. Embaixadores já é provavelmente a Samira.
Influenciador é um contato fora Click (Bruna Wright é uma pessoa que faz entregas contratada por fora, ela tem uma empresa de influencers - É como se fosse a oslo, mas ao invés de entregas de audio visual, ela coordena os influenciadores e suas entregas). O Embaixador já é outra pessoa.

**14.** Além dos campos listados, quais **outras informações cadastrais** são necessárias?
Resposta: Não sei

**15.** O influencer **sempre precisa ser paciente Click** antes de produzir? Ou existem exceções?
Resposta: Sim, pois precisa ter receita valida (influencer e embaixador). Podemos selecionar o influencer como user\_id da plataforma da Click (já é o outro banco de dados de replica)

**16.** Qual é o **modelo padrão de contrato**? Existe template?
Resposta: Não tenho aqui o template.

**17.** Como funciona o **pagamento por performance**? Quais métricas definem o bônus? (ou é sempre fixo?)
Resposta: Não tem pagamento por performance

**18.** Quem tem **autoridade para aprovar** contratos de influencers?
Resposta: Eu preciso configurar quem tem essa skill

**19.** O influencer terá **acesso ao sistema** para ver suas pendências ou tudo é via Bruna?
Resposta: Terá uma visualização só do influencer, nao precisa de login, é só um link de view de pendencias e feedbacks que a bruna manda para o influencer acompanhar. A bruna wright ja terá seu acesso na plataforma.

**20.** Como avaliar se um influencer **deve continuar ou ser descontinuado**? Existem critérios objetivos?
Resposta: Subjetivo

**21.** Quais são os **tipos de entregáveis** que um influencer pode ter além de vídeos para Ads?
Resposta: Não sei agora

**22.** Se um influencer **não entregar no prazo**, quais são as consequências? Existe penalidade contratual?
Resposta: Não
## 12.3 Perguntas sobre Integração Oslo
**23.** Quais **SLAs reais** estão definidos por tipo de criativo? (Você mencionou que vai de 30 para 200 vídeos/mês)
Resposta: Nao tem mapeado

**25.** Quais **pessoas da Oslo** terão acesso ao sistema? Todos ou só gestores?
Resposta: Irei registrar manualmente cada um

**26.** A Oslo pode ver **métricas de performance** de todos os criativos deles ou só após aprovação?
Resposta: Sim, e sem ser deles também.

**27.** Existe **reunião periódica** além das terças e quintas para alinhar entregas?
Resposta: Só terças e quintas reuniao com oslo

**28.** Quando a Oslo atrasa, **qual é o processo atual** de cobrança? (para replicar/melhorar no sistema)
Resposta: Cobrança semanal na reunião, grupo wpp. Mas queremos colocar também o sistema que estamos criando.
## 12.4 Perguntas sobre Dashboard de Ads
**29.** O `ad_name` no Meta Ads segue algum **padrão de nomenclatura**? Como garantir correspondência com criativo do sistema?
Resposta: Mandei no arquivo que está em /docs
## 12.5 Perguntas sobre Sistema de Permissões
**33.** Quais são os **validadores específicos** de cada etapa? (Você mencionou que é configurável, mas quem são inicialmente?)
Resposta: Samira content manager, vidjai e mauro são o validador de design, etc. Mas isso adiciono manulamnte um por um e configuro as permissões

**34.** Pode existir **aprovação automática** após X horas sem resposta do validador?
Resposta: Sim

**35.** Quando um validador está **ausente/férias**, como funciona a delegação?
Resposta: Não existe o cenário
## 12.6 Perguntas sobre Notificações
**36.** Além de email, precisa de **notificação por WhatsApp** ou só sistema + email?
Resposta: nao precisa wpp

**37.** O usuário pode **configurar quais notificações** recebe ou é padrão para todos?
Resposta: Recebe todas

**38.** Em caso de **escalonamento para CEO**, qual é o formato preferido? (email executivo, dashboard especial?)
Resposta: Todos
## 12.7 Perguntas sobre Integrações
**39.** Para a integração com **banco Click** (dados de paciente/influencer), quais queries específicas precisa?
Resposta: Vamos precisar de queries para puxar consulta do usuário, pagamento, entregas. (em docs/queries coloquei alguns arquivos que explicam as queries)

**40.** Existe **API do** [**Frame.io**](http://Frame.io) que permite puxar arquivos automaticamente ou é sempre link manual?
Não sei se tem API, mas a Oslo irá enviar o link de forma manual no sistema. No MVP pode fazer o upload direto no sistema. Usamos Blob da Vercel para criar.

**41.** O sistema precisa **notificar via Slack** ou apenas email?
Apenas email
## 12.8 Perguntas sobre Configurações
**42.** Os **fluxos de aprovação** são iguais para todos os tipos de criativo ou cada tipo tem seu fluxo?
Resposta: Cada um tem o seu

**43.** Quais **tags/categorias** customizáveis existem além de patologia?
Resposta: Deve ter local de configurar as tags no sistema.

**44.** Existe **priorização automática** baseada em algum critério ou é sempre manual?
Resposta: Manual agora, no futuro podemos ter validação com IA em alguns Steps
## 12.9 Perguntas sobre MVP vs Futuro
**45.** No MVP, influencers terão **portal próprio** para entregar ou tudo via Bruna?
Resposta: Terão seu link publico

**46.** Relatório Oslo é **funcionalidade do MVP** ou fica para V2?
Resposta: V2

**47.** Alertas de **threshold de performance** (CTR caiu abaixo de X%) entram no MVP?
Resposta: Ainda não precisa de dashboard de anuncios. Primeiro entenda como puxar as coisas, entenda o basico, vamos cirando aos poucos usando untitled UI
## 12.10 Perguntas Gerais
**48.** Existe **budget mensal de produção** que precisa ser controlado no sistema?
Resposta: Na V1 teremos isso, porém agora ainda nem temos isso setado pelo financeiro, depois podemos incluir e usar como base. Cada equipe registra seus custos e conseguimos acompanhar isso. O custo da entrega de cada video, cada produção.
Uma produção da oslo pode ter varios videos atrelados a ela. E o custo estaria atrelado a produção. Porém teriam videos com custos diferentes dentro da mesma produção, pois temos o video principal e seus cortes. O prestador (como a oslo) pode depois configurar qual o valor de cada criativo, para ajudar a validar o custo (isso nao é obrigatorio, opcional, mas fica explicado que está pendente)

**49.** Precisa de **dashboard de produtividade** da equipe? (quantos criativos cada um produziu/validou)
Resposta: Sim

**50.** O sistema deve ter **modo escuro**? Segue design system específico?
Resposta: Modo claro padrão, mas também poder mudar para escuro

**51.** Quais são os **embaixadores atuais** além de Léo Dutaxi e Pedro Machado? Tem dados deles?
Resposta: Só esses dois

**52.** Existe **histórico de criativos passados** que precisa ser migrado para o sistema ou começa do zero?
Resposta: Sim, porém pode ser feito manualmente. Tem como importar historico do ADS (banco de ads)
* * *
#