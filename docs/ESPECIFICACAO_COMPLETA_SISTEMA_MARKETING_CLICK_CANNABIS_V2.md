# ESPECIFICAÇÃO COMPLETA: Sistema de Marketing Click Cannabis

**Versão:** 2.0 (Revisada e Ampliada)  
**Data de Criação:** 26 de Janeiro de 2026  
**Última Atualização:** 26 de Janeiro de 2026  
**Autor:** Pedro Mota + Claude AI  
**Status:** Em Definição

---

# PARTE 1: CONTEXTO E DIAGNÓSTICO

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo Principal

Criar um sistema centralizado para gerenciar **todas as operações de marketing** da Click Cannabis, **substituindo completamente o ClickUp** atual e unificando processos que hoje estão espalhados em múltiplas ferramentas.

### 1.2 Origem do Projeto

O projeto surge após uma **reunião de mapeamento de fluxos** realizada em 26/01/2026, onde a equipe (Pedro Mota, Rafael Pro, Vidjai, Lucas Rouxinol, Samira) identificou desorganização crítica em processos de marketing.

### 1.3 Problemas Críticos Identificados

#### 1.3.1 Operação com Oslo (Agência)

| Problema | Detalhes |
|----------|----------|
| **Contrato de R$100.000/mês** | Valor alto com expectativa de entrega maior |
| **Oslo não atualiza ClickUp da Click** | Usam planilha própria que é confusa |
| **Qualidade variável** | Entregas melhores quando Nelson (dono) e Lucas estão presentes |
| **Escala de produção** | Vai de 30 para 100-200 vídeos/mês |
| **Gap de acompanhamento** | Após saída de Ana Gaudio, ninguém da Click acompanha gravações |

#### 1.3.2 Processo de Criativos

| Problema | Detalhes |
|----------|----------|
| **Falta validação estruturada** | Compliance, qualidade e performance não têm processo formal |
| **Revisão manual demora muito** | Um dia inteiro para revisar vídeos |
| **Criativos bons ignorados** | Falta de teste sistemático pode ter desperdiçado bons criativos |
| **Do's and Don'ts informal** | Não existe documento validado com jurídico |

#### 1.3.3 Redes Sociais

| Problema | Detalhes |
|----------|----------|
| **Shadowban crítico** | 0,02% de engajamento com 400.000 seguidores |
| **10 likes por post** | Mesmo postando diariamente |
| **Canais abandonados** | Pinterest, Twitter, LinkedIn sem publicações |

#### 1.3.4 Gestão de Anúncios

| Problema | Detalhes |
|----------|----------|
| **Taxa de conexão de 70%** | Perde 30% dos cliques antes do site carregar |
| **Rafael Pro não exercia autonomia** | Tinha autonomia para testar mas não fazia |
| **Dependência de Pedro/Oslo** | 100% dependente deles para criativos |
| **Falta reports estruturados** | Sem validação de quais anúncios deram certo |

### 1.4 Decisões Estratégicas Confirmadas

| Decisão | Status |
|---------|--------|
| Vidjay será desligado | ✅ Confirmado |
| Head de Marketing é prioridade #1 | ✅ Confirmado |
| Click quer estilo minimalista/Nubank | ✅ Confirmado |
| UGC para conversão direta é foco | ✅ Confirmado |
| Sistema substitui ClickUp (não complementa) | ✅ Confirmado |

---

## 2. EQUIPE E RESPONSÁVEIS

### 2.1 Equipe Click Cannabis (Usuários do Sistema)

| Nome | Função | Papel no Sistema |
|------|--------|------------------|
| **Pedro Mota** | Growth/Tech | Super Admin, Product Owner do sistema |
| **Lucas Rouxinol** | CEO | Aprovações finais, visão estratégica |
| **Vidjai** | Design (será desligado) | Validação design, Social Media |
| **Samira** | Content Manager | Blog, pautas, organização, propostas externas |
| **Rafael Pro** | Gestor de Tráfego | Dashboard Ads, performance, subir anúncios |
| **Mauro** | Designer | Validação design, produção |
| **Andrea Vieira** | Redatora (PJ - mãe do Pedro) | Blog, copywriting |
| **Rafael Lacoste** | CFO | Dashboard (visibilidade), definição de budget |
| **Bruna Wright** | Gestão de Influencers | Encontra, organiza, acompanha todos os influencers |

### 2.2 Equipe Oslo (Acesso Limitado)

| Função | Acesso |
|--------|--------|
| Social Media | Suas entregas apenas |
| Editores de Vídeo | Suas entregas apenas |
| Ilustradores | Suas entregas apenas |
| Gestores de Produção | Suas entregas apenas |
| Nelson (Dono) | Visão geral das entregas Oslo |

### 2.3 Embaixadores Atuais

- **Léo Dutaxi** - Embaixador ativo
- **Pedro Machado** - Embaixador ativo

### 2.4 Custos de Equipe Mapeados

| Pessoa/Item | Custo Mensal |
|-------------|--------------|
| Vidjai (será desligado) | R$ 12.000 |
| Designer Júnior | R$ 3.000 - 4.000 |
| Rafael Pro | ~R$ 10.000 |
| Oslo (contrato) | R$ 100.000 |

---

## 3. ESTRUTURA DE REUNIÕES ATUAIS

### 3.1 Reuniões com Oslo

| Aspecto | Detalhe |
|---------|---------|
| **Frequência** | Terças e Quintas |
| **Horário** | 16h às 17h |
| **Participantes Click** | Vidjai, Samira, Pedro Mota, Lucas Rouxinol, às vezes Jack |
| **Novos participantes** | Rafael Pro (gestor tráfego), Rafael Lacoste (CFO) |
| **Problema** | A planilha da Oslo é confusa, eles não atualizam o ClickUp |

### 3.2 Objetivo do CFO nas Reuniões

Rafael Lacoste participa para entender mais sobre toda a empresa e não ficar preso apenas no financeiro - decisão estratégica de desenvolvimento do executivo.

---

# PARTE 2: ARQUITETURA TÉCNICA

## 4. STACK TECNOLÓGICO

### 4.1 Tecnologias Definidas

| Camada | Tecnologia | Observação |
|--------|------------|------------|
| **Frontend** | Next.js + React | A definir versão |
| **Backend** | Next.js API Routes | Full-stack |
| **Banco de Dados** | PostgreSQL | Novo banco dedicado |
| **Hospedagem** | Vercel | Deploy principal |
| **Banco Cloud** | Neon | PostgreSQL serverless |
| **Armazenamento** | Vercel Blob | Arquivos e assets |
| **Email/Notificações** | Resend | API Key já disponível |
| **Autenticação** | A definir | Níveis de permissão |

### 4.2 Decisão: Não Usar N8N

O sistema fará integrações **diretamente** com os serviços necessários, sem passar pelo N8N. Usará Resend para emails e notificações internas da plataforma.

---

## 5. BANCOS DE DADOS EXTERNOS

### 5.1 Banco Principal Click Cannabis (Somente Leitura)

```
Connection String:
postgresql://postgres:52439100@click-cannabis-production-postgres-rds-replica.cktooi4cqmri.us-east-1.rds.amazonaws.com:5432/click-database

Host: click-cannabis-production-postgres-rds-replica.cktooi4cqmri.us-east-1.rds.amazonaws.com
Port: 5432
Database: click-database
User: postgres
Password: 52439100
Tipo: Somente Leitura (Réplica)
```

**Uso no Sistema:**
- Consultar dados de pacientes que são influencers
- Verificar se influencer fez consulta médica
- Verificar pagamentos realizados
- Verificar entregas de produtos
- Conectar user_id do influencer com histórico na Click

### 5.2 Banco de Ads (Somente Leitura)

```
Connection String:
postgresql://click:52439100@159.203.75.72:5432/adtracker

Host: 159.203.75.72
Port: 5432
Database: adtracker
User: click
Password: 52439100
Tipo: Somente Leitura
```

**Uso no Sistema:**
- Dashboard de performance de Ads
- Métricas de criativos
- ROAS, conversões, custos

---

## 6. DOCUMENTAÇÃO COMPLETA DO BANCO DE ADS

### 6.1 Visão Geral da Tabela `facebook_ads_insights`

| Informação | Valor |
|------------|-------|
| **Total de registros** | ~69.245 |
| **Período de dados** | Julho/2024 até presente |
| **Granularidade** | Um registro por anúncio por dia |

### 6.2 Hierarquia de Análise

```
Conta (account_id)
  └── Campanha (campaign_name)
        └── Conjunto de Anúncios (adset_name)
              └── Criativo/Anúncio (ad_name)
```

### 6.3 Contas de Anúncios

| account_id | Descrição | Período | Registros | Uso Principal |
|------------|-----------|---------|-----------|---------------|
| **1** | Conta Principal | Set/2024 - atual | 40.624 | Campanhas de Leads, RMKT, Distribuição |
| **2** | Conta de Impulsionamento | Dez/2024 - atual | 1.263 | Stories, Impulsionamentos (SEM conversões) |
| **3** | BM Anunciante | Jul/2024 - atual | 27.358 | Testes de Criativos, Campanhas de Cadastro |

**IMPORTANTE:** A conta 2 NÃO possui conversões customizadas rastreadas.

### 6.4 Colunas Principais da Tabela

#### Identificadores
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | integer | ID único auto-incremento (PK) |
| `ad_id` | varchar | ID único do anúncio no Facebook Ads |
| `account_id` | integer | ID da conta (1, 2 ou 3) |
| `campaign_name` | varchar | Nome da campanha |
| `adset_name` | varchar | Nome do conjunto de anúncios |
| `ad_name` | varchar | Nome do criativo/anúncio |
| `date` | date | Data do registro |

#### Métricas de Alcance e Custo
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `impressions` | integer | Número de exibições |
| `spend` | numeric | Valor gasto em R$ |

#### Métricas de Tráfego
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `link_clicks` | integer | Cliques no link |
| `landing_page_views` | integer | Visualizações da LP |
| `video_view` | integer | Visualizações de vídeo (3+ segundos) |

#### Métricas de Cadastro
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `complete_registration` | integer | Cadastros completos |

### 6.5 ⭐ COLUNA MAIS IMPORTANTE: `custom_conversion_data`

Esta é a **coluna principal para análise de performance**. É um array JSONB com conversões detalhadas.

#### Estrutura do JSONB:
```json
[
  {
    "value": 2,
    "event_id": "771031809175466",
    "event_name": "CP_Click_payment_product",
    "action_type": "offsite_conversion.custom.771031809175466",
    "monetary_value": 1110
  },
  {
    "value": 7,
    "event_id": "1980885416002406",
    "event_name": "CP_Click_payment_consulting",
    "action_type": "offsite_conversion.custom.1980885416002406",
    "monetary_value": 350
  },
  {
    "value": 6,
    "event_id": "730433076389578",
    "event_name": "CP_Click_deal",
    "action_type": "offsite_conversion.custom.730433076389578"
  }
]
```

### 6.6 Eventos de Conversão Rastreados

| Evento | Nome Interno | Descrição | Etapa Funil | Tem Valor? |
|--------|--------------|-----------|-------------|------------|
| **CP_Click_deal** | Deal/Negociação | Lead qualificado / Deal CRM | Meio | ❌ Não |
| **CP_Click_payment_consulting** | Pagamento Consultoria | Pagamento de consulta (~R$50) | Fundo | ✅ Sim |
| **CP_Click_payment_product** | Pagamento Produto | Pagamento de orçamento (variável) | Fundo | ✅ Sim |

### 6.7 Event IDs por Conta

| Account | Evento | Event ID |
|---------|--------|----------|
| **1** | CP_Click_deal | 758215670017680 |
| **1** | CP_Click_payment_consulting | 724248433698593 |
| **1** | CP_Click_payment_product | 773357648684093 |
| **3** | CP_Click_deal | 730433076389578 |
| **3** | CP_Click_payment_consulting | 1980885416002406 |
| **3** | CP_Click_payment_product | 771031809175466 |

### 6.8 Query de Exemplo - Performance por Criativo

```sql
SELECT 
    ad_name,
    SUM(spend) as investimento,
    SUM(complete_registration) as cadastros,
    ROUND(SUM(spend) / NULLIF(SUM(complete_registration), 0), 2) as cpl,
    SUM((SELECT SUM((elem->>'value')::int) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'event_name' = 'CP_Click_deal')) as deals,
    SUM((SELECT SUM((elem->>'value')::int) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'event_name' = 'CP_Click_payment_consulting')) as consultas_pagas,
    SUM((SELECT SUM((elem->>'value')::int) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'event_name' = 'CP_Click_payment_product')) as orcamentos_pagos,
    SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
         FROM jsonb_array_elements(custom_conversion_data) elem 
         WHERE elem->>'monetary_value' IS NOT NULL)) as receita_total
FROM facebook_ads_insights
WHERE date >= '2025-01-01'
GROUP BY ad_name
ORDER BY receita_total DESC NULLS LAST;
```

### 6.9 Métricas Calculadas (KPIs)

| Métrica | Fórmula | Descrição |
|---------|---------|-----------|
| **CPM** | `(spend / impressions) * 1000` | Custo por mil impressões |
| **CTR** | `(link_clicks / impressions) * 100` | Taxa de cliques |
| **CPC** | `spend / link_clicks` | Custo por clique |
| **CPL** | `spend / complete_registration` | Custo por lead/cadastro |
| **ROAS** | `receita / spend` | Retorno sobre investimento |

### 6.10 Colunas Redundantes (Ignorar)

- `offsite_conversion_fb_pixel_complete_registration` → usar `complete_registration`
- `omni_complete_registration` → usar `complete_registration`
- `omni_landing_page_view` → usar `landing_page_views`

### 6.11 Palavras Reservadas (Usar Aspas)

```sql
SELECT "like", "comment", "post" FROM facebook_ads_insights;
```

### 6.12 Nomenclatura das Campanhas

| Prefixo | Significado |
|---------|-------------|
| `[F]` | Funil / Conversão |
| `[DIST]` | Distribuição / Alcance |
| `[RAC]` | Remarketing de Alcance |
| `[RMKT]` | Remarketing |
| `[CADASTRO]` | Campanha de cadastro |
| `[LEADS]` | Geração de leads |
| `[VENDAS]` | Campanha de vendas |

### 6.13 Workflow N8N para Consultas

| Informação | Valor |
|------------|-------|
| **Workflow ID** | `WQN60q9rd0iOGH4m` |
| **Nome** | Claude Ads |
| **Endpoint** | POST `/webhook/claude-ads` |

**Payload:**
```json
{
  "query": "SELECT * FROM facebook_ads_insights LIMIT 10;"
}
```

### 6.14 Dados Históricos Consolidados

| Métrica | Account 1 | Account 3 | Total |
|---------|-----------|-----------|-------|
| Deals | 82.249 | 42.420 | **124.669** |
| Pagamentos Consulting | 28.276 | 26.124 | **54.400** |
| Pagamentos Product | 9.324 | 8.971 | **18.295** |
| Receita Consulting | R$ 1,12M | R$ 1,03M | **R$ 2,15M** |
| Receita Product | R$ 6,56M | R$ 6,31M | **R$ 12,88M** |
| **Receita Total** | R$ 7,68M | R$ 7,34M | **R$ 15,03M** |

---

## 7. CREDENCIAIS E APIs

### 7.1 Resend (Email/Notificações)

```
API Key: re_gBKBvUVv_QDn9QtXWavJszpfSWdAZ2ph7
```

**Uso:**
- Alertas de atraso da Oslo
- Notificações de reprovação de criativos
- Avisos gerais do sistema

### 7.2 Frame.io (Links Externos)

A Oslo usa Frame.io para compartilhar criativos. O sistema deve:
1. Aceitar links do Frame.io
2. Quando possível, baixar e salvar no Vercel Blob
3. Exemplo de link: `https://next.frame.io/share/1809f4c0-7824-4e1e-bcff-e667eed44c0a/view/c94962c4-692b-4bae-9385-b42616d675c0`

### 7.3 Vercel Blob

Para armazenamento de arquivos. Credenciais a configurar no deploy.

---

## 8. SISTEMA DE PERMISSÕES

### 8.1 Níveis de Usuário

| Nível | Descrição | Exemplo |
|-------|-----------|---------|
| **Super Admin** | Acesso total + configurações do sistema | Pedro Mota |
| **Head** | Aprovações finais, visão estratégica | Lucas Rouxinol, Head Marketing (futuro) |
| **Coordenador** | Gestão de área, validações | Samira, Vidjai |
| **Executor** | Execução de tarefas específicas | Redatores, Social Media, Rafael Pro |
| **Externo** | Acesso limitado a módulos específicos | Oslo, Influencers (futuro) |

### 8.2 Conceito de Skills

O sistema usa **skills configuráveis**. Cada usuário pode ter múltiplas permissões:

```
SKILLS DISPONÍVEIS (Exemplos):
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
├── Dashboard
│   └── ver_dashboard_ads
├── Calendário
│   ├── ver_calendario
│   └── editar_calendario
├── Propostas
│   └── aprovar_proposta
└── Admin
    ├── configurar_sistema
    └── gerenciar_usuarios
```

### 8.3 Configuração de Validadores

Cada etapa de cada fluxo pode ter validadores configuráveis:

```
EXEMPLO: Fluxo de Criativo de Vídeo

├── Etapa: Roteiro
│   └── Validadores: [Content Manager, Médico]
│   └── Opcional: [Jurídico]
│   └── Regra: Pelo menos 1 deve aprovar
│
├── Etapa: Produção/Design
│   └── Validadores: [Vidjai, Mauro, Pedro Mota]
│   └── Regra: Pelo menos 1 deve aprovar
│
├── Etapa: Aprovação Final
│   └── Validadores: [Pedro Mota, Lucas Rouxinol, Head Marketing]
│   └── Regra: Pelo menos 1 deve aprovar
│
└── Etapa: Performance (pós-teste)
    └── Validadores: [Rafael Pro, Lucas Rouxinol]
    └── Regra: Feedback registrado
```

**Configurável nas Settings:**
- Pode ser pessoa específica OU grupo
- Pode exigir todos OU pelo menos um
- Pode incluir validadores opcionais

---

# PARTE 3: MÓDULOS DO SISTEMA

## 9. MÓDULO 1: PIPELINE DE CRIATIVOS

### 9.1 Visão Geral

Gerencia o ciclo de vida completo de criativos, desde a ideia até a análise de performance. Este é o **módulo mais prioritário** por ser a maior dor atual.

### 9.2 Ciclo de Vida (Status)

```
Ideia → Briefing → Roteiro → Produção → Revisão → Aprovado → No Ar → Pausado → Encerrado
         ↑                      ↑          ↑
         └──────────────────────┴──────────┘
              (pode voltar por reprovação)
```

**Regras:**
- Criativo pode voltar de etapa se reprovado
- Criativo pode ser descontinuado em qualquer etapa
- Todo retorno registra motivo

### 9.3 Tipos de Criativos

- Vídeo UGC
- Vídeo Institucional
- Carrossel
- Post Único
- Stories
- Reels

### 9.4 Origens de Criativo

| Origem | Descrição | Fluxo |
|--------|-----------|-------|
| **Oslo** | Produzido pela agência | Briefing Click → Oslo produz → Click valida |
| **Interno** | Produzido pela equipe Click | Briefing → Produção interna → Validação |
| **Influencer** | Entregue por influenciador | Briefing → Influencer produz → Click valida |

**Nota:** Os fluxos são parecidos, mas precisam ser detalhados posteriormente.

### 9.5 Campos do Criativo

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome | string | Sim | Nomenclatura padrão (configurável nas settings) |
| tipo | enum | Sim | Tipo do criativo |
| patologia | enum | Não | Insônia, Ansiedade, Dor, Emagrecimento, etc. |
| responsavel | user | Sim | Quem está produzindo |
| origem | enum | Sim | Oslo, Interno, Influencer |
| status | enum | Sim | Etapa atual do fluxo |
| versao | int | Auto | v1, v2, v3... (incrementa em reprovação) |
| custo_producao | decimal | Não | Custo total de produção |
| arquivos | array | Não | Upload, link Drive, link Frame.io |
| briefing | text | Não | Descrição do que deve ser feito |
| roteiro | text | Não | Roteiro/copy do criativo |
| metricas | json | Auto | Dados puxados do banco de Ads |
| plataformas | array | Não | Meta, Google, TikTok (pode rodar em múltiplas) |
| created_at | datetime | Auto | Data de criação |
| updated_at | datetime | Auto | Última atualização |

### 9.6 Versionamento de Criativos

Quando um criativo é **reprovado**:
1. Sistema registra o motivo da reprovação (obrigatório)
2. Cria automaticamente a próxima versão (v2, v3...)
3. Mantém histórico de todas as versões
4. Responsável é notificado por email (Resend)
5. Criativo entra na **fila de correção** com destaque visual

**Alternativa:** Criativo pode ser **descontinuado** (não segue para próxima versão)

### 9.7 Arquivos Aceitos

| Tipo | Formatos |
|------|----------|
| **Upload direto** | MP4, MOV, PNG, JPG, PSD, AI, PDF |
| **Link externo** | Google Drive, Frame.io |

**Comportamento:** Ao receber link externo, o sistema deve (quando possível) baixar e salvar no Vercel Blob.

### 9.8 Nomenclatura Padrão

A nomenclatura é **editável nas configurações** do sistema.

**Campos que podem compor:**
- Data
- Tipo
- Patologia
- Versão
- Responsável
- Código único

**Exemplo:** `2026-01-26_VIDEO-UGC_INSONIA_V1_001`

**Nota:** Pedro vai definir a regra exata posteriormente. Não deve pausar o desenvolvimento por isso.

### 9.9 Métricas de Performance

Puxadas automaticamente do banco de Ads:

| Métrica | Descrição |
|---------|-----------|
| **Custo por Click Deal** | spend / deals |
| **Custo por Pagamento Consulta** | spend / payment_consulting |
| **Custo por Pagamento Orçamento** | spend / payment_product |
| **ROAS** | receita_total / spend |

**Atualização:**
- Automática a cada 1 hora
- Botão "Sincronizar" para atualização imediata
- Atualiza ao dar refresh na página

### 9.10 Funcionalidades Especiais

| Funcionalidade | Descrição |
|----------------|-----------|
| **Duplicar criativo** | Cria cópia para variações rápidas |
| **Fila de correção** | Criativos reprovados aparecem em destaque |
| **Descontinuar** | Marca como cancelado (não continua o fluxo) |
| **Múltiplas plataformas** | Mesmo criativo pode rodar em Meta + Google |
| **Ranking de criativos** | Top 10 melhores/piores do período |

### 9.11 Meta de Produção

**40 criativos por mês** (mencionado no plano de execução do projeto CAC)

---

## 10. MÓDULO 2: GESTÃO DE INFLUENCERS E EMBAIXADORES

### 10.1 Visão Geral

Controla todo o relacionamento com influencers, desde prospecção até análise de resultados. **Bruna Wright** é a peça central deste módulo.

### 10.2 Diferença entre Tipos (A DEFINIR)

| Tipo | Descrição |
|------|-----------|
| **Influencer** | Parceria pontual ou de curto prazo |
| **Embaixador** | Parceria de longo prazo, representa a marca |
| **UGC Creator** | Produz conteúdo para Ads, não necessariamente posta no perfil |

**Nota:** Pedro não definiu a diferença prática. Precisa ser especificado.

### 10.3 Status do Influencer

```
Prospectando → Negociando → Fechado → Ativo → Pausado → Encerrado
```

### 10.4 Cadastro do Influencer

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome completo |
| instagram | string | Sim | @usuario |
| outras_redes | json | Não | TikTok, YouTube, etc. |
| cpf_cnpj | string | Sim | Documento |
| dados_bancarios | json | Sim | Banco, agência, conta, PIX |
| contato | json | Sim | Telefone, email, WhatsApp |
| nicho | enum | Não | Saúde, Lifestyle, Wellness, etc. |
| seguidores | int | Não | Número de seguidores |
| user_id_click | int | Não | ID no banco Click (se for paciente) |
| status | enum | Sim | Status atual |
| contrato | file | Não | Contrato assinado anexado |
| modelo_contrato | config | Não | Modelo é configurável nas settings |
| valor_fixo | decimal | Não | Valor do contrato (sempre fixo, nunca por performance) |
| motivo_descontinuacao | text | Não | Por que foi pausado/encerrado |

**Campos adicionais a definir:** Pedro mencionou que precisa pensar em outros campos.

### 10.5 Integração com Banco Click

Se o influencer tem `user_id_click` preenchido, o sistema **puxa automaticamente** do banco principal:
- Histórico de consultas
- Pagamentos realizados
- Entregas de produtos
- Status como paciente

**IMPORTANTE:** Todo influencer deve passar pelo fluxo de paciente da Click (consulta médica, receita, produto) antes de gravar. O sistema deve controlar isso.

### 10.6 Entregáveis do Influencer

| Campo | Tipo | Descrição |
|-------|------|-----------|
| descricao | string | Ex: "3 vídeos para Ads" |
| quantidade | int | Quantidade acordada |
| prazo | date | Data limite |
| status | enum | Pendente, Entregue, Atrasado |
| comprovante | file | Upload de comprovante (imagem, vídeo, texto, links) |
| observacoes | text | Notas sobre a entrega |

**Tipos de entregáveis:**
- Vídeos para Ads
- Stories no perfil dele
- Posts no feed
- Presença em evento
- Outros

### 10.7 Envio de Produtos

| Campo | Descrição |
|-------|-----------|
| data_envio | Quando foi enviado |
| codigo_rastreio | Manual (integração Correios é futuro) |
| data_recebimento | Confirmação de chegada |
| status | Pendente, Enviado, Recebido |

### 10.8 Avaliação e Continuidade

- Decisão é **manual** com registro de motivo
- Sistema registra performance dos criativos do influencer
- Sistema registra histórico de entregas (no prazo vs atrasado)

### 10.9 Perfil de Influencer Ideal (Definido pelo Lucas)

| Característica | Preferência |
|----------------|-------------|
| Tamanho | Micro/Médio |
| Gênero | Mulheres (performam muito melhor que homens) |
| Nicho | Wellness |
| Estética | Pessoas bonitas |

### 10.10 Meta 2026

**10-20 influenciadores ativos** simultaneamente

---

## 11. MÓDULO 3: BLOG E SEO

### 11.1 Visão Geral

Gerencia o pipeline de conteúdo do blog, desde pauta até publicação. Funciona como um **mini-CMS** integrado ao Strapi.

### 11.2 Fluxo do Artigo

```
Pauta → Pesquisa Keywords → Redação → Revisão Médica → Revisão Compliance → Revisão SEO → Publicação → Otimização
```

### 11.3 Meta de Produção

**30 artigos por mês** (1 por dia)

### 11.4 Quem Participa

| Pessoa | Papel |
|--------|-------|
| **Samira** | Content Manager - sugere pautas, organiza |
| **Andrea Vieira** | Redatora (PJ) - escreve os artigos |
| **Médico** | Revisão médica obrigatória |
| **Compliance** | Revisão de regras ANVISA/CFM |

### 11.5 Cadastro de Pauta

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

### 11.6 Editor de Artigo (Mini-CMS)

O sistema tem um **editor de texto** onde o redator pode:
- Escrever o artigo
- **Salvar como rascunho**
- Voltar a editar depois
- Enviar para revisão

### 11.7 Revisões

| Tipo | Obrigatório | Quem faz |
|------|-------------|----------|
| **Revisão Médica** | Sim | Médico da equipe |
| **Revisão Compliance** | Sim | Validador com skill |
| **Revisão SEO** | Sim | A definir |

### 11.8 Atualização de Artigos Antigos

O sistema deve permitir marcar artigos existentes para atualização, com fluxo similar ao de criação.

**Contexto:** O blog foi "resetado" no meio de 2025 e perderam 4 meses de trabalho.

### 11.9 Integração com Strapi

| MVP | Futuro |
|-----|--------|
| Apenas gestão do pipeline | Integração direta para publicar via API |
| Publicação manual no Strapi | Publicação automática |

### 11.10 Integrações Futuras

| Integração | Uso |
|------------|-----|
| **SemRush** | Dados de keywords automaticamente |
| **Google Search Console** | Performance pós-publicação |
| **Google Analytics** | Tráfego e conversões |

---

## 12. MÓDULO 4: VALIDAÇÃO E COMPLIANCE

### 12.1 Visão Geral

Sistema de validação que garante que todo conteúdo está dentro das regras antes de ir ao ar.

### 12.2 Momentos de Validação

| Momento | O que valida | Quando |
|---------|--------------|--------|
| **Pré-produção** | Roteiro/briefing | ANTES de produzir |
| **Pós-produção** | Criativo final | DEPOIS de pronto |
| **Pós-teste** | Performance | DEPOIS de 1 semana rodando |

### 12.3 Checklist de Compliance

Checklists são **configuráveis por tipo de criativo** nas settings.

**Exemplo para "Vídeo com Depoimento":**
- [ ] Não menciona "cura"
- [ ] Não faz promessas de resultado
- [ ] Tem disclaimer visível
- [ ] Depoimento é de paciente real
- [ ] Paciente assinou termo de uso de imagem
- [ ] Não mostra produtos controlados

**Nota:** Pedro não tem os critérios agora. Serão configurados depois.

### 12.4 Quem Valida

| Tipo | Validadores |
|------|-------------|
| **Compliance geral** | Qualquer um com skill de validador |
| **Compliance médico** | Médico da equipe |
| **Compliance jurídico** | Jurídico (quando necessário) |

### 12.5 Registro de Validações

| Campo | Descrição |
|-------|-----------|
| validador | Quem validou |
| data_hora | Quando validou |
| resultado | Aprovado / Reprovado |
| justificativa | Motivo (obrigatório se reprovado) |
| checklist_respostas | Quais itens foram marcados |

### 12.6 Histórico para Auditoria

O sistema mantém **log completo** de todas as validações para auditoria futura.

### 12.7 O que NÃO terá

- Score de risco automático baseado em palavras
- Assinatura digital nas aprovações

---

## 13. MÓDULO 5: INTEGRAÇÃO COM OSLO

### 13.1 Visão Geral

Módulo dedicado a acompanhar entregas da agência Oslo (R$100.000/mês).

### 13.2 Contexto do Contrato Oslo

| Informação | Detalhe |
|------------|---------|
| **Valor mensal** | R$ 100.000 |
| **Histórico** | Começou R$20k → R$50k → R$100k |
| **Desde** | Início da Click |
| **Inclui** | Equipe dedicada + custos operacionais (estúdios, equipamentos, diárias) |
| **Equipe dedicada** | Social media, editores de vídeo, ilustradores, gestores de produção |

### 13.3 Problema Atual

A Oslo usa planilha própria que é confusa. Eles não atualizam o ClickUp da Click. O sistema deve forçar que eles usem o novo sistema.

### 13.4 Acesso da Oslo

A equipe Oslo terá **login limitado** para:
- Ver suas tarefas pendentes
- Atualizar status das entregas
- Receber e responder feedbacks
- Ver resultados dos criativos que produziram

### 13.5 Fluxo de Entrega Oslo

```
Click cria briefing → Oslo recebe notificação (email) → Oslo produz → Oslo marca como entregue → Click valida → Aprovado/Reprovado
```

### 13.6 SLA de Entregas

| Campo | Descrição |
|-------|-----------|
| prazo_dias | Dias para entrega após briefing (depende da task) |
| data_inicio | Quando o briefing foi enviado |
| data_prevista | Deadline calculado |
| data_entrega | Quando foi efetivamente entregue |
| status_prazo | No prazo / Atrasado |

**Nota:** Pedro mencionou que o SLA depende da task e ainda não está mapeado.

### 13.7 Alertas de Atraso

Quando a Oslo atrasa uma entrega:
1. **Email automático** via Resend para responsáveis da Click
2. **Notificação no sistema**
3. Item destacado na lista de pendências

### 13.8 Feedback e Ajustes

| Campo | Descrição |
|-------|-----------|
| feedback_click | Texto do feedback enviado |
| resposta_oslo | Resposta da Oslo |
| historico | Log de ida e volta |
| numero_revisoes | Quantas vezes precisou de ajuste |

### 13.9 Relatório de Entregas (Futuro)

Métricas da Oslo:
- Quantidade entregue no período
- % no prazo vs atrasado
- % aprovado de primeira vs com revisão
- Performance dos criativos produzidos

---

## 14. MÓDULO 6: DASHBOARD DE PERFORMANCE DE ADS

### 14.1 Visão Geral

Dashboard conectado ao banco de Ads para visualização de métricas em tempo real.

### 14.2 Ferramentas Atuais

| Ferramenta | Status |
|------------|--------|
| **Looker Studio** | Dashboard atual de Ads |
| **Grafana/Metabase** | Pedro vai criar novo dashboard |

### 14.3 Métricas Obrigatórias

| Métrica | Descrição |
|---------|-----------|
| **Custo por Click Deal** | Quanto custa gerar um deal |
| **Custo por Consulta Paga** | Quanto custa um pagamento de consulta |
| **Custo por Orçamento Pago** | Quanto custa um pagamento de produto |
| **ROAS** | Retorno sobre investimento em ads |

### 14.4 Níveis de Visualização

1. **Por Criativo Individual** - Métricas de cada ad
2. **Por Campanha** - Métricas agregadas por campanha
3. **Por Conjunto** - Métricas agregadas por ad set
4. **Geral** - Visão consolidada de toda a conta

### 14.5 Filtros Disponíveis

- Por período (data início / data fim)
- Por patologia
- Por tipo de campanha
- Por conta de anúncio
- Por criativo específico

### 14.6 Acesso ao Dashboard

Controlado por **skill**: apenas usuários com permissão `ver_dashboard_ads` visualizam.

### 14.7 Budget de Ads (Contexto)

| Período | Investimento Diário |
|---------|---------------------|
| Outubro/2024 | R$ 10.000/dia |
| Novembro/2024 | R$ 15.000/dia |
| Dezembro/2024 | R$ 22.000 - 25.000/dia |

### 14.8 Funcionalidades MVP

- Visualização de métricas principais
- Filtros básicos
- Ranking de criativos (top 10 melhores/piores)

### 14.9 Funcionalidades Futuras

- Comparativo temporal (semana vs semana, mês vs mês)
- Alertas automáticos de threshold
- Exportação para Excel/PDF

---

## 15. MÓDULO 7: REDES SOCIAIS

### 15.1 Visão Geral

Gerencia o calendário e publicações das redes sociais.

### 15.2 Contexto Importante: Shadowban

| Métrica | Valor |
|---------|-------|
| Seguidores Instagram | ~400.000 |
| Engajamento | 0,02% (shadowban) |
| Likes por post | ~10 |

**Conclusão:** Foco é qualidade para quem chega de Ads, não crescimento orgânico.

### 15.3 Prioridade de Canais

1. **Instagram** (prioridade máxima)
2. **YouTube** (prioridade alta)
3. **LinkedIn** (marketing empresarial, cara da empresa)
4. **Twitter** (branding/cultura)
5. **Pinterest** (SEO visual)

### 15.4 Redes Gerenciadas no Sistema

- Instagram
- YouTube
- LinkedIn

### 15.5 Visualizações Disponíveis

| Visualização | Descrição |
|--------------|-----------|
| **Kanban** | Cards por status |
| **Lista** | Tabela com todas as publicações |
| **Calendário** | Visão mensal/semanal |

### 15.6 Fluxo de Publicação

```
Ideia → Criação → Revisão → Aprovação → Agendado → Publicado
```

### 15.7 Campos da Publicação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| titulo | string | Nome interno |
| rede | enum | Instagram, YouTube, LinkedIn |
| tipo | enum | Post, Stories, Reels, Carrossel, Vídeo |
| data_agendada | datetime | Quando publicar |
| copy | text | Texto da publicação |
| hashtags | array | Hashtags a usar |
| arquivos | array | Imagens/vídeos |
| status | enum | Etapa atual |
| responsavel | user | Quem está criando |
| aprovador | user | Quem aprovou |

### 15.8 Aprovação

Aprovadores são **configuráveis** nas settings (pessoa ou grupo).

### 15.9 Funcionalidades MVP

- Calendário de publicações
- Histórico com filtros
- Aprovação configurável
- Publicação manual (não automática)

### 15.10 Funcionalidades Futuras

- Métricas de cada publicação (input manual inicialmente, integração depois)
- Publicação automática via APIs das redes

---

## 16. MÓDULO 8: ENDOMARKETING

### 16.1 Visão Geral

Comunicação interna com a equipe da Click. **Nunca existiu** na empresa.

### 16.2 Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Mural/Feed** | Onde a equipe vê comunicados |
| **Aniversariantes** | Lista de aniversários (não automatiza felicitações) |
| **Celebrações** | Conquistas, metas batidas |
| **Competições** | Gamificação interna |

### 16.3 Tipos de Comunicado

- Aviso geral
- Celebração
- Competição
- Aniversariante do dia/semana

### 16.4 O que NÃO terá

- Automatização de feliz aniversário
- Integração com lista de RH
- Onboarding de funcionários
- Métricas de engajamento

---

## 17. MÓDULO 9: TRADE MARKETING

### 17.1 Visão Geral

Controle de materiais físicos e ações presenciais.

### 17.2 Contexto Histórico

| Informação | Detalhe |
|------------|---------|
| Outdoors 2023 | Principal gerador de branding |
| Investimento pico | Até R$ 200.000/mês em outdoor |
| Status atual | 100% largada, sem dono capacitado |
| Responsável anterior | Gabriel de Léo (saiu, não entregou) |

### 17.3 Funcionalidades MVP (Apenas 2 controles)

#### 17.3.1 Controle de Guarda-Sóis

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
3. **Todo mês:** registra validação de quantidade
4. Sistema calcula perdas automaticamente

#### 17.3.2 Controle de Outdoors

| Campo | Descrição |
|-------|-----------|
| local | Ponto no mapa |
| endereco | Endereço completo |
| data_inicio | Início do período |
| data_fim | Fim do período |
| fornecedor | Empresa responsável |
| valor | Custo do outdoor |
| arquivo_arte | Arte veiculada |

### 17.4 Calendário de Eventos

Para feiras, congressos, ações de rua, gravações.

### 17.5 Galeria de Fotos/Vídeos

Registro visual das ações para histórico e reuso.

### 17.6 Funcionalidades Futuras (V2)

- Controle de estoque de materiais
- Integração com Shopify (Click Store)
- Integração com Correios
- Vinculação de custos com resultados

---

## 18. MÓDULO 10: GESTÃO DE PROPOSTAS E PARCERIAS

### 18.1 Visão Geral

Centraliza todas as propostas de parceria que chegam por diversos canais.

### 18.2 Integração Existente

Existe um **fluxo no N8N** que cataloga propostas do email e cria tasks no ClickUp. Este módulo substituirá esse fluxo.

### 18.3 Canais de Entrada

- Instagram DM
- Email
- WhatsApp
- LinkedIn
- Indicação

### 18.4 Fluxo da Proposta

```
Recebida → Triagem → Análise → Negociação → Fechada/Rejeitada
```

### 18.5 Categorias

- Influencer
- Parceria B2B
- Evento
- Mídia
- Outro

### 18.6 Campos da Proposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| origem | enum | Canal por onde chegou |
| categoria | enum | Tipo de proposta |
| contato | json | Nome, email, telefone |
| descricao | text | O que estão propondo |
| valor_estimado | decimal | Valor envolvido |
| status | enum | Etapa atual |
| responsavel | user | Quem está analisando |
| decisor | user | Quem aprova/rejeita (skill configurável) |
| motivo_rejeicao | text | Por que foi rejeitada |
| data_recebimento | datetime | Quando chegou |
| data_decisao | datetime | Quando foi decidida |

### 18.7 Formulário Público

O sistema pode gerar um **formulário público** que:
- Terceiros preenchem com sua proposta
- Cria automaticamente o registro como "Pendente"
- Notifica responsáveis

### 18.8 Métricas

- Quantidade de propostas por mês
- Taxa de conversão
- Tempo médio de resposta
- Distribuição por categoria

### 18.9 Funcionalidades Futuras

- Templates de resposta para rejeição educada

---

## 19. MÓDULO 11: CALENDÁRIO EDITORIAL

### 19.1 Visão Geral

Calendário unificado que mostra tudo que está planejado/acontecendo em marketing.

### 19.2 O que aparece no calendário

- Publicações de redes sociais
- Entregas de criativos
- Posts do blog
- Eventos presenciais
- Datas comemorativas

### 19.3 Datas Comemorativas

| Tipo | Exemplos |
|------|----------|
| **Cannabis** | Dia da Cannabis, 4/20 |
| **Saúde** | Setembro Amarelo, Outubro Rosa |
| **Comerciais** | Black Friday, Natal |

### 19.4 Planejamento Antecipado

Configuração de **alertas automáticos**:
- X dias antes de uma data comemorativa
- Cria task automática para planejar ação
- Notifica responsáveis

### 19.5 Visualizações

- Semanal
- Mensal
- Trimestral

### 19.6 Permissões

Quem pode editar é **configurável por skill**.

### 19.7 Integrações

**NÃO terá** sincronização com Google Calendar.

---

## 20. MÓDULO 12: BIBLIOTECA DE ASSETS

### 20.1 Visão Geral

Repositório centralizado de todos os arquivos de marketing.

### 20.2 Problema Atual

Arquivos estão **espalhados** em múltiplos lugares (Drives, computadores, Frame.io).

### 20.3 Funcionalidades

- Upload de arquivos
- Categorização por tipo, uso, patologia
- Busca por tags/palavras-chave
- Controle de versões (v1, v2, v3)

### 20.4 Categorização

| Dimensão | Opções |
|----------|--------|
| **Por Tipo** | Vídeo, Imagem, Áudio, Documento, Outro |
| **Por Uso** | Ads, Social Media, Blog, Institucional, Interno |
| **Por Patologia** | Insônia, Ansiedade, Dor, Emagrecimento, Geral |

### 20.5 Arquivos Úteis

Seção especial para documentos importantes:
- Brandbook (PDF) - existe mas está desatualizado
- Guias de estilo
- Templates
- Contratos modelo

### 20.6 O que NÃO terá no MVP

- Aprovação antes de entrar na biblioteca
- Rastreamento de onde cada asset foi usado

---

## 21. MÓDULO 13: REDATORES E COPYWRITING

### 21.1 Visão Geral

Gerencia toda produção de texto que não é blog.

### 21.2 Tipos de Copy

- Copy de Ads
- Roteiros de vídeo
- Landing pages
- Emails
- WhatsApp Remarketing

### 21.3 Banco de Copies

Repositório de copies aprovadas para reuso, especialmente as que performaram bem.

### 21.4 Templates de Copy

Templates configuráveis por objetivo:
- Conversão
- Awareness
- Remarketing
- Educativo

### 21.5 Fluxo de Copy

```
Solicitação → Redação → Revisão → Aprovação → Disponível para uso
```

### 21.6 Revisão

Revisores são **configuráveis** nas settings.

### 21.7 Vinculação com Criativos

O sistema permite vincular qual copy foi usada em qual criativo, permitindo análise de performance por copy.

### 21.8 Briefing (Opcional)

Formulário estruturado para solicitar copy:
- Objetivo
- Público-alvo
- Tom de voz
- CTA desejado
- Referências

---

## 22. MÓDULO 14: RELATÓRIOS E REPORTS

### 22.1 Frequência

**Semanal** (solicitação do Lucas)

### 22.2 Seções Sugeridas (A definir com Lucas)

- Performance de Ads (métricas principais)
- Entregas da Oslo (quantidade, prazo, qualidade)
- Publicações em redes sociais
- Artigos do blog
- Status de influencers
- Criativos em produção vs finalizados

### 22.3 Comparativo

Relatórios devem ter comparativo com período anterior.

### 22.4 Formato

Download em PDF/Excel (não tem envio automático por email no MVP).

### 22.5 Relatório Específico Oslo

| Seção | Descrição |
|-------|-----------|
| O que entregaram | Lista de entregas |
| Qualidade | Aprovados de primeira vs com revisão |
| Prazos | No prazo vs atrasado |
| Performance | Resultados dos criativos deles |

### 22.6 Acesso da Oslo

A Oslo deve ter acesso no sistema para ver os resultados dos criativos que produziram.

### 22.7 Funcionalidades Futuras

- Geração 100% automática
- Personalização de seções
- Agendamento de envio por email

---

## 23. MÓDULO 15: CLICK EDUCA

### 23.1 O que é

| Componente | Status |
|------------|--------|
| **YouTube gratuito** | Já existe |
| **Comunidade paga** | Futuro |
| **Masterclass** | Futuro |

### 23.2 Contexto

**~30 vídeos** com edição pronta para postar. Faltam thumbnails, descrições e estratégia de SEO. Não existe bloqueio técnico. Samira deveria ter publicado mas não fez.

### 23.3 Frequência Ideal

2-3 vídeos por semana

### 23.4 No Sistema de Marketing

O Click Educa entra como um **tipo de conteúdo** (assim como criativos, social media, etc.).

### 23.5 Fluxo de Conteúdo

```
Pauta → Roteiro → Gravação → Edição → Revisão → Aprovação → Publicação (YouTube)
```

### 23.6 Diferenças para Criativos

- Não tem métricas de Ads
- Publicação é no YouTube
- Conteúdo é educativo, não publicitário
- Revisão médica mais rigorosa
- Cada vídeo deve conectar com artigo do blog

---

# PARTE 4: IMPLEMENTAÇÃO

## 24. ROADMAP

### 24.1 MVP - Fase 1 (Semanas 1-3)

| Item | Prioridade |
|------|------------|
| Autenticação e permissões | P0 |
| Pipeline de Criativos (básico) | P0 |
| Dashboard de Ads (conexão com banco) | P0 |
| Notificações por email (Resend) | P0 |

### 24.2 MVP - Fase 2 (Semanas 4-6)

| Item | Prioridade |
|------|------------|
| Gestão de Influencers | P1 |
| Integração Oslo (acesso limitado) | P1 |
| Calendário Editorial (básico) | P1 |
| Biblioteca de Assets (upload simples) | P1 |

### 24.3 MVP - Fase 3 (Semanas 7-9)

| Item | Prioridade |
|------|------------|
| Blog/SEO (pipeline) | P2 |
| Redes Sociais (calendário) | P2 |
| Copywriting (banco de copies) | P2 |
| Propostas e Parcerias | P2 |

### 24.4 V2 (Após MVP Validado)

- Endomarketing
- Trade Marketing completo
- Click Educa
- Relatórios automáticos
- Métricas de redes sociais
- Comparativos temporais
- Alertas de threshold

### 24.5 V3 (Futuro)

- Integrações com SemRush, Search Console
- Publicação automática em redes
- Integração Correios
- Integração Shopify
- AI para sugestões

---

## 25. PERGUNTAS PENDENTES (A Responder)

### 25.1 Perguntas Críticas

| # | Pergunta | Status |
|---|----------|--------|
| 1 | Qual a diferença prática entre Influencer, Embaixador e UGC Creator? | ❌ Não respondido |
| 2 | Quais campos adicionais do influencer? | ❌ A definir |
| 3 | Quais as seções exatas do relatório semanal que o Lucas quer? | ❌ Não definido |
| 4 | Quais as diferenças de fluxo entre Oslo, Interno e Influencer? | ❌ A detalhar |
| 5 | Qual a nomenclatura padrão de criativos? | ❌ A definir (não pausa desenvolvimento) |
| 6 | Quais os critérios do checklist de compliance? | ❌ A configurar depois |
| 7 | Qual o modelo de contrato de influencer? | ❌ Configurável nas settings |

### 25.2 Decisões Tomadas mas A Detalhar

| Item | Status |
|------|--------|
| SLA de entregas por tipo de task | Não mapeado ainda |
| Validadores específicos de cada etapa | Configurável, mas não definido quem |
| Integração com Clarity para análise de comportamento | Mencionado, não detalhado |

---

## 26. REFERÊNCIAS E LINKS

### 26.1 Workflows N8N Existentes

| Workflow | ID | Uso |
|----------|----|----|
| Claude Ads | WQN60q9rd0iOGH4m | Consultas ao banco de Ads |
| Claude Queries | 6WdaglLNkVEoq1yw | Consultas ao banco principal |
| Propostas (email → ClickUp) | A identificar | Catalogar propostas |

### 26.2 Ferramentas Mencionadas

| Ferramenta | Uso |
|------------|-----|
| **Looker Studio** | Dashboard atual de Ads |
| **ClickUp** | Será substituído pelo sistema |
| **Frame.io** | Onde Oslo compartilha criativos |
| **Strapi** | CMS do blog |
| **Clarity** | Análise de comportamento no site |
| **SemRush** | Keywords para SEO (futuro) |

---

## 27. HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 26/01/2026 | Pedro + Claude | Criação inicial |
| 2.0 | 26/01/2026 | Claude | Revisão completa com todos os detalhes |

---

## 28. PRÓXIMOS PASSOS

1. [ ] Pedro responde perguntas pendentes
2. [ ] Validar documento com Lucas Rouxinol
3. [ ] Definir priorização final dos módulos
4. [ ] Criar schema do banco de dados
5. [ ] Desenhar wireframes das telas principais
6. [ ] Iniciar desenvolvimento do MVP no Claude Code

---

*Documento gerado em 26 de Janeiro de 2026*
*Click Cannabis - Sistema de Marketing*
*Versão 2.0 - Revisada e Ampliada*
