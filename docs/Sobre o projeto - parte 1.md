# ESPECIFICAÇÃO COMPLETA: Sistema de Marketing Click Cannabis

**Versão:** 1.0  
**Data de Criação:** 26 de Janeiro de 2026  
**Última Atualização:** 26 de Janeiro de 2026  
**Autor:** Pedro Mota + Claude AI  
**Status:** Em Definição

---

## ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura Técnica](#2-arquitetura-técnica)
3. [Sistema de Permissões e Acessos](#3-sistema-de-permissões-e-acessos)
4. [Módulo 1: Pipeline de Criativos](#4-módulo-1-pipeline-de-criativos)
5. [Módulo 2: Gestão de Influencers e Embaixadores](#5-módulo-2-gestão-de-influencers-e-embaixadores)
6. [Módulo 3: Blog e SEO](#6-módulo-3-blog-e-seo)
7. [Módulo 4: Validação e Compliance](#7-módulo-4-validação-e-compliance)
8. [Módulo 5: Integração com Oslo](#8-módulo-5-integração-com-oslo)
9. [Módulo 6: Dashboard de Performance de Ads](#9-módulo-6-dashboard-de-performance-de-ads)
10. [Módulo 7: Redes Sociais](#10-módulo-7-redes-sociais)
11. [Módulo 8: Endomarketing](#11-módulo-8-endomarketing)
12. [Módulo 9: Trade Marketing](#12-módulo-9-trade-marketing)
13. [Módulo 10: Gestão de Propostas e Parcerias](#13-módulo-10-gestão-de-propostas-e-parcerias)
14. [Módulo 11: Calendário Editorial](#14-módulo-11-calendário-editorial)
15. [Módulo 12: Biblioteca de Assets](#15-módulo-12-biblioteca-de-assets)
16. [Módulo 13: Redatores e Copywriting](#16-módulo-13-redatores-e-copywriting)
17. [Módulo 14: Relatórios e Reports](#17-módulo-14-relatórios-e-reports)
18. [Módulo 15: Click Educa](#18-módulo-15-click-educa)
19. [Integrações Externas](#19-integrações-externas)
20. [Roadmap MVP vs Futuro](#20-roadmap-mvp-vs-futuro)
21. [Equipe e Responsáveis](#21-equipe-e-responsáveis)
22. [Anexos Técnicos](#22-anexos-técnicos)

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo

Criar um sistema centralizado para gerenciar **todas as operações de marketing** da Click Cannabis, substituindo o ClickUp atual e unificando processos que hoje estão espalhados em múltiplas ferramentas.

### 1.2 Problema que Resolve

| Problema Atual | Solução do Sistema |
|----------------|-------------------|
| Processos de marketing desorganizados | Fluxos estruturados e configuráveis |
| Criativos sem validação adequada | Pipeline com etapas de aprovação |
| Falta de visibilidade das entregas da Oslo | Módulo dedicado com SLA e alertas |
| Métricas de Ads espalhadas | Dashboard unificado conectado ao banco |
| Dificuldade de escalar produção (30→200 criativos/mês) | Sistema preparado para volume |
| Ausência de histórico e auditoria | Log completo de todas as ações |

### 1.3 Escopo do Sistema

O sistema abrange **17 módulos** que cobrem todo o ciclo de marketing:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE MARKETING                          │
├─────────────────────────────────────────────────────────────────┤
│  PRODUÇÃO DE CONTEÚDO                                           │
│  ├── Pipeline de Criativos                                      │
│  ├── Blog e SEO                                                 │
│  ├── Redatores e Copywriting                                    │
│  └── Click Educa                                                │
├─────────────────────────────────────────────────────────────────┤
│  GESTÃO DE PARCEIROS                                            │
│  ├── Influencers e Embaixadores                                 │
│  ├── Integração Oslo                                            │
│  └── Propostas e Parcerias                                      │
├─────────────────────────────────────────────────────────────────┤
│  DISTRIBUIÇÃO                                                   │
│  ├── Redes Sociais                                              │
│  ├── Trade Marketing                                            │
│  └── Calendário Editorial                                       │
├─────────────────────────────────────────────────────────────────┤
│  ANÁLISE E CONTROLE                                             │
│  ├── Dashboard de Ads                                           │
│  ├── Validação e Compliance                                     │
│  ├── Relatórios                                                 │
│  └── Biblioteca de Assets                                       │
├─────────────────────────────────────────────────────────────────┤
│  COMUNICAÇÃO INTERNA                                            │
│  └── Endomarketing                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Usuários do Sistema

| Perfil | Exemplos | Acesso |
|--------|----------|--------|
| Super Admin | Pedro Mota | Acesso total + configurações |
| Heads | Lucas Rouxinol, Head de Marketing | Aprovações finais, relatórios |
| Coordenadores | Samira, Vidjai | Gestão de equipes, validações |
| Equipe Click | Redatores, Social Media, Rafael Pro | Funções específicas por skill |
| Oslo | Equipe da agência | Acesso limitado às suas entregas |
| Influencers | Embaixadores ativos | Portal de entrega (futuro) |

---

## 2. ARQUITETURA TÉCNICA

### 2.1 Stack Tecnológico

| Camada | Tecnologia | Observação |
|--------|------------|------------|
| **Frontend** | Next.js + React | A definir versão |
| **Backend** | Next.js API Routes | Full-stack |
| **Banco de Dados** | PostgreSQL | Novo banco dedicado |
| **Hospedagem** | Vercel | Deploy principal |
| **Banco Cloud** | Neon | PostgreSQL serverless |
| **Armazenamento** | Vercel Blob | Arquivos e assets |
| **Email** | Resend | Notificações |
| **Autenticação** | A definir | Níveis de permissão |

### 2.2 Bancos de Dados Externos (Leitura)

#### Banco Principal Click Cannabis (Somente Leitura)
```
Host: click-cannabis-production-postgres-rds-replica.cktooi4cqmri.us-east-1.rds.amazonaws.com
Port: 5432
Database: click-database
User: postgres
Password: 52439100
```
**Uso:** Consultar dados de pacientes/influencers (consultas, pagamentos, entregas)

#### Banco de Ads (Somente Leitura)
```
Host: 159.203.75.72
Port: 5432
Database: adtracker
User: click
Password: 52439100
```
**Uso:** Métricas de performance de anúncios (Meta Ads)

### 2.3 APIs e Integrações

| Serviço | Uso | Credenciais |
|---------|-----|-------------|
| **Resend** | Envio de emails/notificações | `re_gBKBvUVv_QDn9QtXWavJszpfSWdAZ2ph7` |
| **Frame.io** | Links de criativos da Oslo | Apenas links (sem API) |
| **Vercel Blob** | Upload de arquivos | A configurar |

### 2.4 Estrutura de Permissões (Skills)

O sistema usa um modelo de **skills configuráveis** onde cada usuário pode ter múltiplas permissões:

```
SKILLS DISPONÍVEIS:
├── Criativos
│   ├── criar_criativo
│   ├── editar_criativo
│   ├── aprovar_criativo
│   ├── validar_compliance
│   └── ver_metricas
├── Influencers
│   ├── cadastrar_influencer
│   ├── aprovar_contrato
│   └── registrar_entrega
├── Blog
│   ├── criar_pauta
│   ├── escrever_artigo
│   ├── revisar_artigo
│   └── publicar_artigo
├── Redes Sociais
│   ├── agendar_post
│   ├── aprovar_post
│   └── ver_calendario
├── Financeiro
│   ├── ver_custos
│   └── registrar_pagamento
├── Admin
│   ├── configurar_sistema
│   ├── gerenciar_usuarios
│   └── ver_logs
└── ...
```

---

## 3. SISTEMA DE PERMISSÕES E ACESSOS

### 3.1 Níveis de Usuário

| Nível | Descrição | Exemplo de Usuários |
|-------|-----------|---------------------|
| **Super Admin** | Acesso total, configurações do sistema | Pedro Mota |
| **Head** | Aprovações finais, visão estratégica | Lucas Rouxinol, Head Marketing |
| **Coordenador** | Gestão de área, validações | Samira, Vidjai |
| **Executor** | Execução de tarefas específicas | Redatores, Social Media |
| **Externo** | Acesso limitado a módulos específicos | Oslo, Influencers |

### 3.2 Configuração de Validadores por Etapa

O sistema permite configurar **quem valida cada etapa** de cada fluxo:

```
EXEMPLO: Fluxo de Criativo de Vídeo
├── Etapa: Roteiro
│   └── Validadores: [Content Manager, Médico] (opcional: Jurídico)
├── Etapa: Produção
│   └── Validadores: [Vidjai, Mauro]
├── Etapa: Revisão Final
│   └── Validadores: [Pedro Mota, Lucas Rouxinol]
└── Etapa: Performance
    └── Validadores: [Rafael Pro]
```

**Regras:**
- Pode ser uma pessoa específica OU um grupo
- Pode exigir aprovação de todos OU de pelo menos um
- Configurável nas settings do sistema

---

## 4. MÓDULO 1: PIPELINE DE CRIATIVOS

### 4.1 Visão Geral

Gerencia o ciclo de vida completo de criativos, desde a ideia até a análise de performance.

### 4.2 Ciclo de Vida (Status)

```
Ideia → Briefing → Roteiro → Produção → Revisão → Aprovado → No Ar → Pausado → Encerrado
         ↑                      ↑          ↑
         └──────────────────────┴──────────┘
              (pode voltar por reprovação)
```

### 4.3 Tipos de Criativos

- Vídeo UGC
- Vídeo Institucional
- Carrossel
- Post Único
- Stories
- Reels

### 4.4 Campos do Criativo

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome | string | Sim | Nomenclatura padrão (configurável) |
| tipo | enum | Sim | Tipo do criativo |
| patologia | enum | Não | Insônia, Ansiedade, Dor, etc. |
| responsavel | user | Sim | Quem está produzindo |
| origem | enum | Sim | Oslo, Interno, Influencer |
| status | enum | Sim | Etapa atual do fluxo |
| versao | int | Auto | v1, v2, v3... |
| custo_producao | decimal | Não | Custo total de produção |
| arquivos | array | Não | Upload, link Drive, link Frame.io |
| briefing | text | Não | Descrição do que deve ser feito |
| roteiro | text | Não | Roteiro/copy do criativo |
| metricas | json | Auto | Dados do banco de Ads |
| created_at | datetime | Auto | Data de criação |
| updated_at | datetime | Auto | Última atualização |

### 4.5 Versionamento

Quando um criativo é **reprovado**:
1. Registra o motivo da reprovação
2. Cria automaticamente a próxima versão (v2, v3...)
3. Mantém histórico de todas as versões
4. Responsável é notificado por email

### 4.6 Arquivos Aceitos

- **Upload direto:** MP4, MOV, PNG, JPG, PSD, AI, PDF
- **Links externos:** Google Drive, Frame.io
- **Comportamento:** Ao receber link externo, o sistema deve baixar e salvar no Blob (quando possível)

### 4.7 Nomenclatura Padrão

A nomenclatura é **configurável nas settings** do sistema. Campos que podem compor:
- Data
- Tipo
- Patologia
- Versão
- Responsável
- Código único

Exemplo: `2026-01-26_VIDEO-UGC_INSONIA_V1_001`

### 4.8 Métricas de Performance

Puxadas automaticamente do banco de Ads:
- Custo por Click Deal
- Custo por Pagamento de Consulta
- Custo por Pagamento de Orçamento
- ROAS
- Impressões, Cliques, CTR (complementares)

### 4.9 Funcionalidades Especiais

- **Duplicar criativo:** Cria cópia para variações rápidas
- **Fila de correção:** Criativos reprovados aparecem em destaque
- **Descontinuar:** Marca criativo como cancelado (não continua o fluxo)
- **Múltiplas plataformas:** Mesmo criativo pode rodar em Meta + Google

---

## 5. MÓDULO 2: GESTÃO DE INFLUENCERS E EMBAIXADORES

### 5.1 Visão Geral

Controla todo o relacionamento com influencers, desde prospecção até análise de resultados.

### 5.2 Status do Influencer

```
Prospectando → Negociando → Fechado → Ativo → Pausado → Encerrado
```

### 5.3 Cadastro do Influencer

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome completo |
| instagram | string | Sim | @usuario |
| outras_redes | json | Não | TikTok, YouTube, etc. |
| cpf_cnpj | string | Sim | Documento |
| dados_bancarios | json | Sim | Banco, agência, conta, PIX |
| contato | json | Sim | Telefone, email, WhatsApp |
| nicho | enum | Não | Saúde, Lifestyle, etc. |
| seguidores | int | Não | Número de seguidores |
| user_id_click | int | Não | ID no banco Click (se for paciente) |
| status | enum | Sim | Status atual |
| contrato | file | Não | Contrato assinado anexado |
| valor_fixo | decimal | Não | Valor do contrato |
| motivo_descontinuacao | text | Não | Por que foi pausado/encerrado |

### 5.4 Integração com Banco Click

Se o influencer tem `user_id_click` preenchido, o sistema puxa automaticamente:
- Histórico de consultas
- Pagamentos realizados
- Entregas de produtos
- Status como paciente

### 5.5 Entregáveis do Influencer

Cada influencer tem uma lista de entregáveis combinados:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| descricao | string | Ex: "3 vídeos para Ads" |
| quantidade | int | Quantidade acordada |
| prazo | date | Data limite |
| status | enum | Pendente, Entregue, Atrasado |
| comprovante | file | Upload de comprovante |
| observacoes | text | Notas sobre a entrega |

### 5.6 Envio de Produtos

| Campo | Descrição |
|-------|-----------|
| data_envio | Quando foi enviado |
| codigo_rastreio | Código dos Correios (manual) |
| data_recebimento | Confirmação de chegada |
| status | Pendente, Enviado, Recebido |

**Nota:** Integração com API Correios é para versão futura.

### 5.7 Avaliação e Continuidade

A decisão de continuar ou não com influencer é **manual**, mas o sistema registra:
- Motivo da descontinuação
- Performance dos criativos do influencer
- Histórico de entregas (no prazo vs atrasado)

---

## 6. MÓDULO 3: BLOG E SEO

### 6.1 Visão Geral

Gerencia o pipeline de conteúdo do blog, desde pauta até publicação. Funciona como um **mini-CMS** integrado ao Strapi.

### 6.2 Fluxo do Artigo

```
Pauta → Pesquisa Keywords → Redação → Revisão Médica → Revisão Compliance → Revisão SEO → Publicação → Otimização
```

### 6.3 Meta de Produção

**30 artigos por mês** (1 por dia)

### 6.4 Cadastro de Pauta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| titulo_sugerido | string | Título inicial |
| keyword_principal | string | Palavra-chave foco |
| keywords_secundarias | array | Palavras relacionadas |
| briefing | text | Orientações para redator |
| referencias | array | Links de referência |
| prioridade | enum | Alta, Média, Baixa |
| solicitante | user | Quem pediu a pauta |
| redator_responsavel | user | Quem vai escrever |

### 6.5 Editor de Artigo

O sistema tem um **editor de texto** onde o redator pode:
- Escrever o artigo
- Salvar como rascunho
- Voltar a editar depois
- Enviar para revisão

### 6.6 Revisões Obrigatórias

1. **Revisão Médica:** Valida informações de saúde
2. **Revisão de Compliance:** Verifica regras da ANVISA/CFM
3. **Revisão de SEO:** Otimização para busca

### 6.7 Atualização de Artigos Antigos

O sistema deve permitir marcar artigos existentes para atualização, com fluxo similar ao de criação.

### 6.8 Integração com Strapi

**MVP:** Apenas gestão do pipeline (publicação é feita manual no Strapi)
**Futuro:** Integração direta para publicar via API

### 6.9 Integrações Futuras

- **SemRush:** Dados de keywords automaticamente
- **Google Search Console:** Performance pós-publicação
- **Google Analytics:** Tráfego e conversões

---

## 7. MÓDULO 4: VALIDAÇÃO E COMPLIANCE

### 7.1 Visão Geral

Sistema de validação que garante que todo conteúdo está dentro das regras antes de ir ao ar.

### 7.2 Momentos de Validação

| Momento | O que valida | Quem valida |
|---------|--------------|-------------|
| Pré-produção | Roteiro/briefing | Médico, Jurídico, Content Manager |
| Pós-produção | Criativo final | Vidjai, Mauro, Pedro |
| Pós-teste | Performance | Rafael Pro, Lucas |

### 7.3 Checklist de Compliance

Checklists são **configuráveis por tipo de criativo**:

Exemplo para "Vídeo com Depoimento":
- [ ] Não menciona "cura"
- [ ] Não faz promessas de resultado
- [ ] Tem disclaimer visível
- [ ] Depoimento é de paciente real
- [ ] Paciente assinou termo de uso de imagem
- [ ] Não mostra produtos controlados

### 7.4 Registro de Validações

Toda validação gera um registro:

| Campo | Descrição |
|-------|-----------|
| validador | Quem validou |
| data_hora | Quando validou |
| resultado | Aprovado / Reprovado |
| justificativa | Motivo (obrigatório se reprovado) |
| checklist_respostas | Quais itens foram marcados |

### 7.5 Histórico para Auditoria

O sistema mantém **log completo** de todas as validações para auditoria futura.

---

## 8. MÓDULO 5: INTEGRAÇÃO COM OSLO

### 8.1 Visão Geral

Módulo dedicado a acompanhar entregas da agência Oslo, que custa R$100.000/mês e é responsável por grande parte da produção.

### 8.2 Acesso da Oslo

A equipe Oslo terá **login limitado** no sistema para:
- Ver suas tarefas pendentes
- Atualizar status das entregas
- Receber e responder feedbacks
- Acessar resultados dos criativos que produziram

### 8.3 Fluxo de Entrega Oslo

```
Click cria briefing → Oslo recebe notificação → Oslo produz → Oslo marca como entregue → Click valida → Aprovado/Reprovado
```

### 8.4 SLA de Entregas

| Campo | Descrição |
|-------|-----------|
| prazo_dias | Dias para entrega após briefing |
| data_inicio | Quando o briefing foi enviado |
| data_prevista | Deadline calculado |
| data_entrega | Quando foi efetivamente entregue |
| status_prazo | No prazo / Atrasado |

### 8.5 Alertas de Atraso

Quando a Oslo atrasa uma entrega:
- Email automático para responsáveis da Click
- Notificação no sistema
- Item destacado na lista de pendências

### 8.6 Feedback e Ajustes

O sistema registra toda comunicação de ajustes:
- Click envia feedback
- Oslo responde
- Histórico de ida e volta
- Quantidade de revisões por entrega

### 8.7 Relatório de Entregas (Futuro)

Métricas da Oslo:
- Quantidade entregue no período
- % no prazo vs atrasado
- % aprovado de primeira vs com revisão
- Performance dos criativos produzidos

---

## 9. MÓDULO 6: DASHBOARD DE PERFORMANCE DE ADS

### 9.1 Visão Geral

Dashboard conectado ao banco de Ads da Click para visualização de métricas em tempo real.

### 9.2 Fonte de Dados

```
Banco: adtracker
Tabela: facebook_ads_insights
Registros: ~69.245
Período: Julho/2024 até presente
```

### 9.3 Métricas Obrigatórias

| Métrica | Descrição | Fórmula |
|---------|-----------|---------|
| Custo por Click Deal | Custo para gerar um deal | spend / deals |
| Custo por Consulta Paga | Custo para pagamento de consulta | spend / payment_consulting |
| Custo por Orçamento Pago | Custo para pagamento de produto | spend / payment_product |
| ROAS | Retorno sobre investimento | receita / spend |

### 9.4 Níveis de Visualização

1. **Por Criativo Individual:** Métricas de cada ad
2. **Por Campanha:** Métricas agregadas por campanha
3. **Por Conjunto:** Métricas agregadas por ad set
4. **Geral:** Visão consolidada de toda a conta

### 9.5 Filtros Disponíveis

- Por período (data início / data fim)
- Por patologia
- Por tipo de campanha
- Por conta de anúncio
- Por criativo específico

### 9.6 Atualização dos Dados

- **Automática:** A cada 1 hora
- **Manual:** Botão "Sincronizar" para atualização imediata
- **Refresh:** Atualiza ao recarregar a página

### 9.7 Acesso ao Dashboard

Controlado por **skill**: apenas usuários com permissão "ver_dashboard_ads" visualizam.

### 9.8 Funcionalidades MVP

- Visualização de métricas principais
- Filtros básicos
- Ranking de criativos

### 9.9 Funcionalidades Futuras

- Comparativo temporal (semana vs semana, mês vs mês)
- Alertas automáticos de threshold
- Exportação para Excel/PDF

---

## 10. MÓDULO 7: REDES SOCIAIS

### 10.1 Visão Geral

Gerencia o calendário e publicações das redes sociais da Click.

### 10.2 Redes Gerenciadas

- Instagram (prioridade 1)
- YouTube (prioridade 2)
- LinkedIn (prioridade 3)

### 10.3 Visualizações Disponíveis

1. **Kanban:** Cards por status
2. **Lista:** Tabela com todas as publicações
3. **Calendário:** Visão mensal/semanal

### 10.4 Fluxo de Publicação

```
Ideia → Criação → Revisão → Aprovação → Agendado → Publicado
```

### 10.5 Campos da Publicação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| titulo | string | Nome interno da publicação |
| rede | enum | Instagram, YouTube, LinkedIn |
| tipo | enum | Post, Stories, Reels, Carrossel, Vídeo |
| data_agendada | datetime | Quando deve ser publicado |
| copy | text | Texto da publicação |
| hashtags | array | Hashtags a usar |
| arquivos | array | Imagens/vídeos |
| status | enum | Etapa atual |
| responsavel | user | Quem está criando |
| aprovador | user | Quem aprovou |

### 10.6 Aprovação

- Aprovadores são **configuráveis** nas settings
- Pode ser pessoa específica ou grupo
- Registro de quem aprovou e quando

### 10.7 Histórico

O sistema mantém histórico completo de tudo que foi publicado, com filtros por:
- Rede social
- Período
- Tipo de publicação
- Responsável

### 10.8 Métricas (Futuro)

- Likes, comentários, shares, alcance
- Input manual inicialmente
- Integração com APIs das redes futuramente

### 10.9 Observação Importante

A Click tem **shadowban** no Instagram (engajamento de 0.02% com 400k seguidores). O foco é **qualidade para quem chega via Ads**, não crescimento orgânico.

---

## 11. MÓDULO 8: ENDOMARKETING

### 11.1 Visão Geral

Comunicação interna com a equipe da Click.

### 11.2 Funcionalidades

1. **Mural/Feed de Comunicados:** Onde a equipe vê avisos
2. **Aniversariantes:** Lista de aniversários do período
3. **Celebrações:** Conquistas, metas batidas
4. **Competições:** Gamificação interna

### 11.3 Tipos de Comunicado

- Aviso geral
- Celebração
- Competição
- Aniversariante do dia/semana

### 11.4 Campos do Comunicado

| Campo | Tipo | Descrição |
|-------|------|-----------|
| titulo | string | Título do comunicado |
| conteudo | text | Corpo do comunicado |
| tipo | enum | Tipo do comunicado |
| data_publicacao | datetime | Quando publicar |
| autor | user | Quem criou |
| destaque | boolean | Se aparece em destaque |

### 11.5 O que NÃO está no escopo

- Automatização de feliz aniversário
- Integração com lista de RH
- Onboarding de funcionários
- Métricas de engajamento

---

## 12. MÓDULO 9: TRADE MARKETING

### 12.1 Visão Geral

Controle de materiais físicos e ações presenciais.

### 12.2 Funcionalidades MVP

#### 12.2.1 Controle de Guarda-Sóis

| Campo | Descrição |
|-------|-----------|
| local | Ponto no mapa (lat/long) + nome |
| nome_estabelecimento | Nome do local |
| quantidade_enviada | Quantos foram enviados |
| quantidade_atual | Quantos restam (validação mensal) |
| quantidade_perdida | Diferença calculada |
| historico_validacoes | Log de validações mensais |

**Fluxo:**
1. Seleciona ponto no mapa
2. Registra entrega inicial
3. Todo mês: registra validação de quantidade
4. Sistema calcula perdas automaticamente

#### 12.2.2 Controle de Outdoors

| Campo | Descrição |
|-------|-----------|
| local | Ponto no mapa |
| endereco | Endereço completo |
| data_inicio | Início do período |
| data_fim | Fim do período |
| fornecedor | Empresa responsável |
| valor | Custo do outdoor |
| arquivo_arte | Arte veiculada |

### 12.3 Calendário de Eventos

- Feiras
- Congressos
- Ações de rua
- Gravações

### 12.4 Galeria de Fotos/Vídeos

Registro visual das ações realizadas para:
- Histórico
- Reuso em materiais futuros
- Comprovação

### 12.5 Funcionalidades Futuras (V2)

- Controle de estoque de materiais
- Integração com Shopify (Click Store)
- Integração com Correios
- Vinculação de custos com resultados

---

## 13. MÓDULO 10: GESTÃO DE PROPOSTAS E PARCERIAS

### 13.1 Visão Geral

Centraliza todas as propostas de parceria que chegam por diversos canais.

### 13.2 Canais de Entrada

- Instagram DM
- Email
- WhatsApp
- LinkedIn
- Indicação

### 13.3 Fluxo da Proposta

```
Recebida → Triagem → Análise → Negociação → Fechada/Rejeitada
```

### 13.4 Categorias de Proposta

- Influencer
- Parceria B2B
- Evento
- Mídia
- Outro

### 13.5 Campos da Proposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| origem | enum | Canal por onde chegou |
| categoria | enum | Tipo de proposta |
| contato | json | Nome, email, telefone |
| descricao | text | O que estão propondo |
| valor_estimado | decimal | Valor envolvido |
| status | enum | Etapa atual |
| responsavel | user | Quem está analisando |
| decisor | user | Quem aprova/rejeita |
| motivo_rejeicao | text | Por que foi rejeitada |
| data_recebimento | datetime | Quando chegou |
| data_decisao | datetime | Quando foi decidida |

### 13.6 Formulário Público

O sistema pode gerar um **formulário público** que:
- Terceiros preenchem com sua proposta
- Cria automaticamente o registro como "Pendente"
- Notifica responsáveis

### 13.7 Métricas

- Quantidade de propostas por mês
- Taxa de conversão (fechadas / total)
- Tempo médio de resposta
- Distribuição por categoria

### 13.8 Histórico

Mantém todas as propostas, inclusive rejeitadas, para análise futura.

### 13.9 Integração Existente

Existe um fluxo no N8N que cataloga propostas do email e cria tasks no ClickUp. Este módulo substituirá esse fluxo.

---

## 14. MÓDULO 11: CALENDÁRIO EDITORIAL

### 14.1 Visão Geral

Calendário unificado que mostra tudo que está planejado/acontecendo em marketing.

### 14.2 O que aparece no calendário

- Publicações de redes sociais
- Entregas de criativos
- Posts do blog
- Eventos presenciais
- Datas comemorativas

### 14.3 Datas Comemorativas

O sistema tem um cadastro de datas relevantes:
- Dia da Cannabis
- Datas de saúde (Setembro Amarelo, Outubro Rosa, etc.)
- Feriados comerciais (Black Friday, Natal, etc.)

### 14.4 Planejamento Antecipado

Configuração de **alertas automáticos**:
- X dias antes de uma data comemorativa
- Cria task automática para planejar ação
- Notifica responsáveis

### 14.5 Visualizações

- Semanal
- Mensal
- Trimestral

### 14.6 Permissões

Quem pode editar o calendário é **configurável por skill**.

### 14.7 Integração

**Não terá** sincronização com Google Calendar (por decisão de escopo).

---

## 15. MÓDULO 12: BIBLIOTECA DE ASSETS

### 15.1 Visão Geral

Repositório centralizado de todos os arquivos de marketing.

### 15.2 Problema Atual

Arquivos estão espalhados em múltiplos lugares (Drives, computadores, Frame.io).

### 15.3 Funcionalidades

- Upload de arquivos
- Categorização por tipo, uso, patologia
- Busca por tags/palavras-chave
- Controle de versões (v1, v2, v3)

### 15.4 Categorização

**Por Tipo:**
- Vídeo
- Imagem
- Áudio
- Documento
- Outro

**Por Uso:**
- Ads
- Social Media
- Blog
- Institucional
- Interno

**Por Patologia:**
- Insônia
- Ansiedade
- Dor
- Emagrecimento
- Geral

### 15.5 Versionamento

Cada asset pode ter múltiplas versões, com histórico de alterações.

### 15.6 Busca

- Por nome
- Por tags
- Por categoria
- Por data
- Por responsável

### 15.7 Arquivos Úteis

Seção especial para documentos importantes:
- Brandbook (PDF)
- Guias de estilo
- Templates
- Contratos modelo

### 15.8 O que NÃO está no MVP

- Aprovação antes de entrar na biblioteca
- Rastreamento de onde cada asset foi usado

---

## 16. MÓDULO 13: REDATORES E COPYWRITING

### 16.1 Visão Geral

Gerencia toda produção de texto que não é blog.

### 16.2 Tipos de Copy

- Copy de Ads
- Roteiros de vídeo
- Landing pages
- Emails
- WhatsApp Remarketing

### 16.3 Banco de Copies

Repositório de copies aprovadas para reuso, especialmente as que performaram bem.

### 16.4 Templates de Copy

Templates configuráveis por objetivo:
- Conversão
- Awareness
- Remarketing
- Educativo

### 16.5 Fluxo de Copy

```
Solicitação → Redação → Revisão → Aprovação → Disponível para uso
```

### 16.6 Revisão

Revisores são **configuráveis** nas settings do sistema.

### 16.7 Vinculação com Criativos

O sistema permite vincular qual copy foi usada em qual criativo, permitindo análise de performance por copy.

### 16.8 Briefing (Opcional)

Formulário estruturado para solicitar copy:
- Objetivo
- Público-alvo
- Tom de voz
- CTA desejado
- Referências

---

## 17. MÓDULO 14: RELATÓRIOS E REPORTS

### 17.1 Visão Geral

Geração de relatórios consolidados de marketing.

### 17.2 Frequência

**Semanal** (solicitação do Lucas)

### 17.3 Seções do Relatório (A definir)

Sugestões:
- Performance de Ads (métricas principais)
- Entregas da Oslo (quantidade, prazo, qualidade)
- Publicações em redes sociais
- Artigos do blog
- Status de influencers
- Criativos em produção vs finalizados

### 17.4 Comparativo

Relatórios devem ter comparativo com período anterior.

### 17.5 Formato

Download em PDF/Excel (não tem envio automático por email).

### 17.6 Relatório Oslo

Relatório específico para apresentar à Oslo:
- O que eles entregaram
- Qualidade das entregas
- Cumprimento de prazos
- Performance dos criativos deles

### 17.7 Acesso da Oslo aos Resultados

A Oslo deve ter acesso no sistema para ver os resultados dos criativos que produziram.

### 17.8 Funcionalidades Futuras

- Geração 100% automática
- Personalização de seções
- Agendamento de envio

---

## 18. MÓDULO 15: CLICK EDUCA

### 18.1 Visão Geral

Conteúdo educativo para médicos (produto da Click).

### 18.2 O que é o Click Educa

- Educação de médicos
- Vídeos no YouTube (gratuito - já existe)
- Comunidade paga (futuro)
- Masterclass (futuro)

### 18.3 No Sistema de Marketing

O Click Educa entra como um **tipo de conteúdo** (assim como criativos, social media, etc.).

### 18.4 Fluxo de Conteúdo Click Educa

```
Pauta → Roteiro → Gravação → Edição → Revisão → Aprovação → Publicação (YouTube)
```

### 18.5 Diferenças para Criativos

- Não tem métricas de Ads
- Publicação é no YouTube
- Conteúdo é educativo, não publicitário
- Revisão médica mais rigorosa

---

## 19. INTEGRAÇÕES EXTERNAS

### 19.1 Integrações do MVP

| Integração | Tipo | Uso |
|------------|------|-----|
| Banco Click (PostgreSQL) | Leitura | Dados de pacientes/influencers |
| Banco Ads (PostgreSQL) | Leitura | Métricas de anúncios |
| Resend | API | Envio de emails/notificações |
| Vercel Blob | API | Armazenamento de arquivos |

### 19.2 Integrações Futuras

| Integração | Prioridade | Uso |
|------------|------------|-----|
| SemRush | Média | Dados de keywords para SEO |
| Google Search Console | Média | Performance do blog |
| Google Analytics | Média | Tráfego e conversões |
| Meta Ads API | Baixa | Se banco atual não atender |
| Correios API | Baixa | Rastreamento de envios |
| Strapi API | Média | Publicação direta no blog |
| APIs Redes Sociais | Baixa | Publicação automática |

---

## 20. ROADMAP MVP VS FUTURO

### 20.1 MVP (Prioridade Máxima)

#### Fase 1 - Core (Semanas 1-3)
- [ ] Autenticação e permissões
- [ ] Pipeline de Criativos (básico)
- [ ] Dashboard de Ads (conexão com banco)
- [ ] Notificações por email (Resend)

#### Fase 2 - Expansão (Semanas 4-6)
- [ ] Gestão de Influencers
- [ ] Integração Oslo (acesso limitado)
- [ ] Calendário Editorial (básico)
- [ ] Biblioteca de Assets (upload simples)

#### Fase 3 - Complemento (Semanas 7-9)
- [ ] Blog/SEO (pipeline)
- [ ] Redes Sociais (calendário)
- [ ] Copywriting (banco de copies)
- [ ] Propostas e Parcerias

### 20.2 V2 (Após MVP Validado)

- Endomarketing
- Trade Marketing completo
- Click Educa
- Relatórios automáticos
- Métricas de redes sociais
- Comparativos temporais
- Alertas de threshold

### 20.3 V3 (Futuro)

- Integrações com SemRush, Search Console
- Publicação automática em redes
- Integração Correios
- Integração Shopify
- AI para sugestões de copy/criativo

---

## 21. EQUIPE E RESPONSÁVEIS

### 21.1 Equipe Click (Usuários Principais)

| Nome | Função | Skills Principais |
|------|--------|-------------------|
| Pedro Mota | Growth/Tech | Super Admin |
| Lucas Rouxinol | CEO | Aprovações finais, Dashboard |
| Vidjai | Design | Validação design, Social Media |
| Samira | Content Manager | Blog, Pautas, Organização |
| Rafael Pro | Gestor de Tráfego | Dashboard Ads, Performance |
| Mauro | Designer | Validação design |
| Andrea | Redatora | Blog, Copywriting |
| Rafael Lacoste | CFO | Dashboard (visibilidade) |

### 21.2 Equipe Oslo (Acesso Limitado)

- Acesso apenas às suas entregas
- Podem atualizar status
- Podem ver feedback
- Podem ver resultados dos seus criativos

### 21.3 Bruna Wright

- Gestão de influencers/UGC
- Acesso ao módulo de influencers
- Acesso ao pipeline de criativos UGC

---

## 22. ANEXOS TÉCNICOS

### 22.1 Estrutura do Banco de Ads

```sql
-- Tabela principal: facebook_ads_insights
-- Total: ~69.245 registros
-- Período: Julho/2024 até presente

Campos principais:
- id (PK)
- date
- account_id
- campaign_id, campaign_name
- adset_id, adset_name
- ad_id, ad_name
- impressions, reach, frequency
- spend
- link_clicks, cpc, ctr
- landing_page_views
- complete_registration
- custom_conversion_data (JSONB com conversões)

Conversões no JSONB:
- CP_Click_deal
- CP_payment_consulting
- CP_payment_product_budget
```

### 22.2 Query de Exemplo - Métricas por Criativo

```sql
SELECT 
    ad_name,
    SUM(spend) as investimento,
    SUM(link_clicks) as cliques,
    SUM((SELECT SUM((elem->>'value')::int) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'event_name' = 'CP_Click_deal')) as deals,
    SUM((SELECT SUM((elem->>'value')::int) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'event_name' = 'CP_payment_consulting')) as consultas_pagas,
    SUM((SELECT SUM((elem->>'value')::int) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'event_name' = 'CP_payment_product_budget')) as orcamentos_pagos
FROM facebook_ads_insights
WHERE date >= '2025-01-01'
GROUP BY ad_name
ORDER BY investimento DESC;
```

### 22.3 Workflow N8N Existente

**Claude Ads**
- ID: `WQN60q9rd0iOGH4m`
- Endpoint: POST `/webhook/claude-ads`
- Payload: `{ "query": "SQL_AQUI" }`

### 22.4 Credenciais Importantes

| Serviço | Credencial |
|---------|------------|
| Resend API Key | `re_gBKBvUVv_QDn9QtXWavJszpfSWdAZ2ph7` |
| Banco Click (Leitura) | Ver seção 2.2 |
| Banco Ads (Leitura) | Ver seção 2.2 |

---

## HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 26/01/2026 | Pedro + Claude | Criação inicial |

---

## PRÓXIMOS PASSOS

1. [ ] Validar este documento com Lucas Rouxinol
2. [ ] Definir priorização final dos módulos
3. [ ] Criar schema do banco de dados
4. [ ] Desenhar wireframes das telas principais
5. [ ] Iniciar desenvolvimento do MVP

---

*Documento gerado em 26 de Janeiro de 2026*
*Click Cannabis - Sistema de Marketing*